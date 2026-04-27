<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WeeklyPulse;
use App\Models\WeeklyPulseItem;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function show(Request $request): Response
    {
        $validated = $request->validate([
            'week' => ['nullable', 'date_format:Y-m-d'],
        ]);

        $user = $request->user();
        $now = CarbonImmutable::now();
        $today = $now->startOfDay();
        $currentWeekStart = $today->startOfWeek(CarbonImmutable::MONDAY);
        $selectedDate = $request->date('week', 'Y-m-d')?->startOfDay() ?? $today;

        $selectedPulse = $user->weeklyPulses()
            ->whereDate('week_start_date', '<=', $selectedDate->toDateString())
            ->whereDate('week_end_date', '>=', $selectedDate->toDateString())
            ->with('items.project')
            ->orderBy('week_start_date')
            ->first();

        $reportingWeekStart = $selectedPulse?->week_start_date->toImmutable()
            ?? $selectedDate->startOfWeek(CarbonImmutable::MONDAY);
        $reportingWeekEnd = $selectedPulse?->week_end_date->toImmutable()
            ?? $reportingWeekStart->endOfWeek(CarbonImmutable::SUNDAY);
        $reportingMonth = $reportingWeekStart->startOfMonth();
        $weekStarts = $this->weekStartsForMonth($reportingMonth);
        $reportingWindowStart = $weekStarts->first();
        $reportingWindowEnd = $weekStarts
            ->last()
            ?->endOfWeek(CarbonImmutable::SUNDAY) ?? $reportingWeekEnd;

        if (! $selectedPulse && $reportingWeekStart->isSameDay($currentWeekStart)) {
            $selectedPulse = $user->weeklyPulses()->create([
                'week_start_date' => $reportingWeekStart->toDateString(),
                'week_end_date' => $reportingWeekEnd->toDateString(),
                'status' => WeeklyPulse::STATUS_DRAFT,
            ])->load('items.project');
        }

        $monthlyPulses = $user->weeklyPulses()
            ->forMonth($reportingMonth)
            ->with('items.project')
            ->get()
            ->keyBy(fn (WeeklyPulse $weeklyPulse) => $weeklyPulse->week_start_date->toDateString());

        if ($selectedPulse) {
            $monthlyPulses->put($selectedPulse->week_start_date->toDateString(), $selectedPulse);
        }

        $projectRows = $this->projectRows($monthlyPulses);
        $allocationRows = $projectRows
            ->map(function (array $projectRow) use ($monthlyPulses, $weekStarts): array {
                return [
                    'projectId' => $projectRow['projectId'],
                    'project' => $projectRow['project'],
                    'stream' => $projectRow['stream'],
                    'weekValues' => $weekStarts
                        ->map(function (CarbonImmutable $weekStart) use ($monthlyPulses, $projectRow) {
                            $weeklyPulse = $monthlyPulses->get($weekStart->toDateString());

                            return $weeklyPulse?->items
                                ->firstWhere('project_id', $projectRow['projectId'])
                                ?->allocation_percent;
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        $selectedWeekAssignments = $user->projectAssignments()
            ->activeDuring($reportingWeekStart, $reportingWeekEnd)
            ->pluck('project_id');

        $assignedProjectIdsForSelectedWeek = $selectedWeekAssignments
            ->map(fn (mixed $id) => (int) $id)
            ->values()
            ->all();

        $submissionDeadline = $this->resolveSubmissionDeadline(
            $selectedPulse ?? new WeeklyPulse([
                'status' => WeeklyPulse::STATUS_DRAFT,
                'week_start_date' => $reportingWeekStart->toDateString(),
                'week_end_date' => $reportingWeekEnd->toDateString(),
            ]),
            $now,
        );

        $selectedWeekTotal = $selectedPulse
            ? (int) $selectedPulse->items->sum('allocation_percent')
            : 0;

        $availableProjects = Project::query()
            ->active()
            ->whereNotIn('id', $selectedWeekAssignments)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'assignedProjectIdsForSelectedWeek' => $assignedProjectIdsForSelectedWeek,
            'availableProjects' => $availableProjects,
            'allocationRows' => $allocationRows,
            'reportingPeriod' => [
                'monthStartDate' => $reportingMonth->toDateString(),
                'weekStartDate' => $reportingWeekStart->toDateString(),
                'weekEndDate' => $reportingWeekEnd->toDateString(),
                'isCurrentWeek' => $reportingWeekStart->isSameDay($currentWeekStart),
                'weeks' => $weekStarts
                    ->map(function (CarbonImmutable $weekStart, int $index) use ($monthlyPulses) {
                        $weeklyPulse = $monthlyPulses->get($weekStart->toDateString());

                        return [
                            'index' => $index + 1,
                            'startDate' => $weekStart->toDateString(),
                            'endDate' => $weekStart->addDays(6)->toDateString(),
                            'weeklySummary' => $weeklyPulse?->weekly_summary,
                        ];
                    })
                    ->values()
                    ->all(),
            ],
            'summary' => [
                'activeProjectsCount' => count($allocationRows),
                'currentWeekTotalPercent' => $selectedWeekTotal,
            ],
            'submissionDeadline' => [
                'at' => $submissionDeadline->toIso8601String(),
                'isOverdue' => ($selectedPulse?->status ?? WeeklyPulse::STATUS_DRAFT) === WeeklyPulse::STATUS_DRAFT
                    && $now->greaterThanOrEqualTo($submissionDeadline),
            ],
            'weeklyPulse' => [
                'id' => $selectedPulse?->id,
                'status' => $selectedPulse?->status ?? WeeklyPulse::STATUS_DRAFT,
                'weekStartDate' => $reportingWeekStart->toDateString(),
                'weekEndDate' => $reportingWeekEnd->toDateString(),
                'weeklySummary' => $selectedPulse?->weekly_summary,
            ],
        ]);
    }

    /**
     * @return Collection<int, CarbonImmutable>
     */
    private function weekStartsForMonth(CarbonImmutable $reportingMonth): Collection
    {
        $weekStarts = collect();
        $cursor = $reportingMonth->startOfWeek(CarbonImmutable::MONDAY);
        $monthEnd = $reportingMonth->endOfMonth();

        while ($cursor->lte($monthEnd)) {
            $weekStarts->push($cursor);
            $cursor = $cursor->addWeek();
        }

        return $weekStarts;
    }

    /**
     * @param  Collection<string, WeeklyPulse>  $monthlyPulses
     * @return Collection<int, array{projectId: int, project: string, stream: string, sortOrder: int}>
     */
    private function projectRows(
        Collection $monthlyPulses,
    ): Collection {
        $rows = collect();

        $monthlyPulses
            ->flatMap(fn (WeeklyPulse $weeklyPulse) => $weeklyPulse->items)
            ->each(function (WeeklyPulseItem $item) use ($rows): void {
                $project = $item->project;

                if (! $project || $rows->has($project->id)) {
                    return;
                }

                $rows->put($project->id, [
                    'projectId' => $project->id,
                    'project' => $project->name,
                    'stream' => $project->stream,
                    'sortOrder' => 10_000 + $rows->count(),
                ]);
            });

        return $rows
            ->sortBy([
                ['sortOrder', 'asc'],
                ['project', 'asc'],
            ])
            ->values();
    }

    private function resolveSubmissionDeadline(
        WeeklyPulse $weeklyPulse,
        CarbonImmutable $now,
    ): CarbonImmutable {
        $deadlineReferenceWeek = $weeklyPulse->week_start_date->toImmutable();

        if ($weeklyPulse->status === WeeklyPulse::STATUS_SUBMITTED) {
            $deadlineReferenceWeek = $deadlineReferenceWeek->addWeek();
        }

        return $this->submissionDeadlineForWeek($deadlineReferenceWeek);
    }

    private function submissionDeadlineForWeek(
        CarbonImmutable $weekStartDate,
    ): CarbonImmutable {
        return $weekStartDate
            ->startOfWeek(CarbonImmutable::MONDAY)
            ->addDays((int) config('dashboard.submission_deadline.day_offset', 3))
            ->setTime(
                (int) config('dashboard.submission_deadline.hour', 17),
                (int) config('dashboard.submission_deadline.minute', 0),
            );
    }
}
