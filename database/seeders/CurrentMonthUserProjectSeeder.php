<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class CurrentMonthUserProjectSeeder extends Seeder
{
    /**
     * Link each user to a few active projects for the current calendar month.
     */
    public function run(): void
    {
        $monthStart = CarbonImmutable::today()->startOfMonth();
        $monthEnd = CarbonImmutable::today()->endOfMonth();
        $projects = Project::query()->active()->orderBy('id')->get();

        if ($projects->isEmpty()) {
            return;
        }

        User::query()
            ->orderBy('id')
            ->get()
            ->values()
            ->each(function (User $user, int $userIndex) use (
                $monthStart,
                $monthEnd,
                $projects
            ): void {
                $this->assignProjectsForUser(
                    $user,
                    $userIndex,
                    $monthStart,
                    $monthEnd,
                    $projects,
                );
            });
    }

    /**
     * @param  Collection<int, Project>  $projects
     */
    private function assignProjectsForUser(
        User $user,
        int $userIndex,
        CarbonImmutable $monthStart,
        CarbonImmutable $monthEnd,
        Collection $projects,
    ): void {
        $count = $projects->count();
        $perUser = min(3, $count);
        $offset = ($userIndex * 2) % max(1, $count);
        $selected = collect(range(0, $perUser - 1))
            ->map(fn (int $i) => $projects[($offset + $i) % $count])
            ->unique('id')
            ->values();

        $selected->each(function (Project $project, int $index) use (
            $user,
            $monthStart,
            $monthEnd
        ): void {
            UserProject::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'project_id' => $project->id,
                    'starts_on' => $monthStart->toDateString(),
                ],
                [
                    'ends_on' => $monthEnd->toDateString(),
                    'sort_order' => $index,
                ],
            );
        });
    }
}
