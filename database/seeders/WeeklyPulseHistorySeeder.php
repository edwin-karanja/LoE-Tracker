<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use App\Models\WeeklyPulse;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class WeeklyPulseHistorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $currentMonth = CarbonImmutable::today()->startOfMonth();
        $historicalMonths = collect([3, 2, 1])->map(
            fn (int $monthOffset) => $currentMonth->subMonths($monthOffset)->startOfMonth(),
        );
        $historyStartsOn = $historicalMonths->first();
        $historyEndsOn = $historicalMonths->last()->endOfMonth();
        $historicalWeekStarts = $this->historicalWeekStarts($historicalMonths);
        $projects = Project::query()->active()->orderBy('name')->get();

        if ($projects->count() < 6) {
            Project::factory()
                ->count(6 - $projects->count())
                ->create();

            $projects = Project::query()->active()->orderBy('name')->get();
        }

        User::query()
            ->orderBy('id')
            ->get()
            ->each(function (User $user, int $userIndex) use (
                $currentMonth,
                $historyEndsOn,
                $historicalWeekStarts,
                $historyStartsOn,
                $projects,
            ): void {
                $baseProjects = $this->baseProjectsForUser(
                    $user,
                    $projects,
                    $currentMonth,
                );

                $this->seedHistoricalAssignments(
                    $user,
                    $baseProjects,
                    $historyStartsOn,
                    $historyEndsOn,
                );

                $this->replaceExistingHistoricalPulses(
                    $user,
                    $historicalWeekStarts,
                );

                $historicalWeekStarts->each(function (CarbonImmutable $weekStart) use (
                    $baseProjects,
                    $projects,
                    $user,
                    $userIndex,
                ): void {
                    $extraProject = $this->extraProjectForWeek(
                        $projects,
                        $baseProjects,
                        $weekStart,
                        $userIndex,
                    );

                    $this->seedExtraProjectAssignment(
                        $user,
                        $extraProject,
                        $weekStart,
                    );

                    $selectedProjects = $baseProjects
                        ->take(3)
                        ->concat([$extraProject])
                        ->values();
                    $targetTotal = $this->targetTotalForWeek($userIndex, $weekStart);
                    $pulse = WeeklyPulse::query()
                        ->where('user_id', $user->id)
                        ->whereDate('week_start_date', $weekStart->toDateString())
                        ->first() ?? new WeeklyPulse;

                    $pulse->fill([
                        'user_id' => $user->id,
                        'week_start_date' => $weekStart->toDateString(),
                        'week_end_date' => $weekStart->addDays(6)->toDateString(),
                        'status' => WeeklyPulse::STATUS_SUBMITTED,
                        'submitted_at' => $weekStart
                            ->addDays((int) config('dashboard.submission_deadline.day_offset', 3))
                            ->setTime(
                                (int) config('dashboard.submission_deadline.hour', 17),
                                (int) config('dashboard.submission_deadline.minute', 0),
                            )
                            ->toDateTimeString(),
                    ]);
                    $pulse->save();

                    $pulse->items()->delete();

                    collect($this->buildAllocations($targetTotal))
                        ->zip($selectedProjects)
                        ->each(function ($pair, int $index) use ($pulse): void {
                            [$allocationPercent, $project] = $pair;

                            $pulse->items()->create([
                                'allocation_percent' => $allocationPercent,
                                'project_id' => $project->id,
                            ]);
                        });
                });
            });
    }

    /**
     * @param  Collection<int, CarbonImmutable>  $historicalMonths
     * @return Collection<int, CarbonImmutable>
     */
    private function historicalWeekStarts(Collection $historicalMonths): Collection
    {
        return $historicalMonths
            ->flatMap(function (CarbonImmutable $month): Collection {
                $weekStarts = collect();
                $weekStart = $month->startOfWeek(CarbonImmutable::MONDAY);
                $lastWeekStart = $month->endOfMonth()->startOfWeek(CarbonImmutable::MONDAY);

                while ($weekStart->lte($lastWeekStart)) {
                    $weekStarts->push($weekStart);
                    $weekStart = $weekStart->addWeek();
                }

                return $weekStarts;
            })
            ->unique(fn (CarbonImmutable $weekStart) => $weekStart->toDateString())
            ->values();
    }

    /**
     * @param  Collection<int, Project>  $projects
     * @return Collection<int, Project>
     */
    private function baseProjectsForUser(
        User $user,
        Collection $projects,
        CarbonImmutable $currentMonth,
    ): Collection {
        $baseProjects = $user->projectAssignments()
            ->with('project')
            ->activeDuring($currentMonth, $currentMonth->endOfMonth())
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->pluck('project')
            ->filter()
            ->unique('id')
            ->values();

        if ($baseProjects->count() >= 3) {
            return $baseProjects->take(3)->values();
        }

        return $baseProjects
            ->concat(
                $projects
                    ->reject(fn (Project $project) => $baseProjects->contains('id', $project->id))
                    ->shuffle()
                    ->take(3 - $baseProjects->count()),
            )
            ->take(3)
            ->values();
    }

    /**
     * @param  Collection<int, Project>  $baseProjects
     */
    private function seedHistoricalAssignments(
        User $user,
        Collection $baseProjects,
        CarbonImmutable $historyStartsOn,
        CarbonImmutable $historyEndsOn,
    ): void {
        $baseProjects->values()->each(function (Project $project, int $index) use (
            $historyEndsOn,
            $historyStartsOn,
            $user,
        ): void {
            UserProject::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'project_id' => $project->id,
                    'starts_on' => $historyStartsOn->toDateString(),
                ],
                [
                    'ends_on' => $historyEndsOn->toDateString(),
                    'sort_order' => $index,
                ],
            );
        });
    }

    /**
     * @param  Collection<int, Project>  $projects
     * @param  Collection<int, Project>  $baseProjects
     */
    private function extraProjectForWeek(
        Collection $projects,
        Collection $baseProjects,
        CarbonImmutable $weekStart,
        int $userIndex,
    ): Project {
        $availableProjects = $projects
            ->reject(fn (Project $project) => $baseProjects->contains('id', $project->id))
            ->values();

        return $availableProjects[($userIndex + $weekStart->weekOfYear) % $availableProjects->count()];
    }

    private function seedExtraProjectAssignment(
        User $user,
        Project $project,
        CarbonImmutable $weekStart,
    ): void {
        $monthStart = $weekStart->startOfMonth();
        $monthEnd = $weekStart->endOfMonth();

        UserProject::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'project_id' => $project->id,
                'starts_on' => $monthStart->toDateString(),
            ],
            [
                'ends_on' => $monthEnd->toDateString(),
                'sort_order' => 3,
            ],
        );
    }

    /**
     * @param  Collection<int, CarbonImmutable>  $historicalWeekStarts
     */
    private function replaceExistingHistoricalPulses(
        User $user,
        Collection $historicalWeekStarts,
    ): void {
        $weekStartDates = $historicalWeekStarts
            ->map(fn (CarbonImmutable $weekStart) => $weekStart->toDateString())
            ->all();

        $existingPulses = $user->weeklyPulses()
            ->whereIn('week_start_date', $weekStartDates)
            ->get();

        $existingPulses->each(function (WeeklyPulse $weeklyPulse): void {
            $weeklyPulse->items()->delete();
            $weeklyPulse->delete();
        });
    }

    private function targetTotalForWeek(
        int $userIndex,
        CarbonImmutable $weekStart,
    ): int {
        $targets = [90, 95, 100, 105, 110, 120, 130];

        return $targets[($userIndex + $weekStart->weekOfYear) % count($targets)];
    }

    /**
     * @return array<int, int>
     */
    private function buildAllocations(int $targetTotal): array
    {
        $firstShare = (int) floor($targetTotal * 0.35);
        $secondShare = (int) floor($targetTotal * 0.3);
        $thirdShare = (int) floor($targetTotal * 0.2);
        $fourthShare = $targetTotal - $firstShare - $secondShare - $thirdShare;

        return [
            $firstShare,
            $secondShare,
            $thirdShare,
            $fourthShare,
        ];
    }
}
