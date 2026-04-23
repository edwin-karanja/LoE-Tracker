<?php

namespace Database\Seeders;

use App\Models\MonthlyAllocation;
use App\Models\Project;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Seeder;

class MonthlyAllocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $projects = Project::query()->active()->orderBy('name')->get();

        if ($projects->isEmpty()) {
            $projects = Project::factory()->count(6)->create();
        }

        User::query()
            ->orderBy('id')
            ->get()
            ->each(function (User $user, int $userIndex) use ($projects): void {
                collect([0, 1, 2])->each(function (int $monthOffset) use ($projects, $user, $userIndex): void {
                    $month = CarbonImmutable::today()
                        ->startOfMonth()
                        ->subMonths($monthOffset);

                    $targetTotal = $this->allocationTargetFor($userIndex, $monthOffset);
                    $projectSelection = $this->projectSelectionFor(
                        $projects,
                        $userIndex + $monthOffset,
                    );
                    $allocations = $this->buildAllocations(
                        $targetTotal,
                        $projectSelection->count(),
                    );

                    $monthlyAllocation = MonthlyAllocation::query()->updateOrCreate(
                        [
                            'user_id' => $user->id,
                            'month' => $month->toDateString(),
                        ],
                        [
                            'assigned_projects_count' => $projectSelection->count(),
                            'availability_percent' => max(0, 100 - $targetTotal),
                            'total_allocation_percent' => $targetTotal,
                        ],
                    );

                    $monthlyAllocation->items()->delete();

                    $projectSelection->values()->each(function (Project $project, int $index) use ($allocations, $monthlyAllocation): void {
                        $monthlyAllocation->items()->create([
                            'allocation_percent' => $allocations[$index],
                            'project_id' => $project->id,
                            'project_name' => $project->name,
                            'sort_order' => $index + 1,
                            'stream' => $project->stream,
                        ]);
                    });
                });
            });
    }

    private function allocationTargetFor(int $userIndex, int $monthOffset): int
    {
        $targets = [100, 85, 70, 95];

        return $targets[($userIndex + $monthOffset) % count($targets)];
    }

    private function projectSelectionFor(
        Collection $projects,
        int $seed,
    ): Collection {
        $projectCount = min(
            3 + ($seed % 2),
            $projects->count(),
        );

        return $projects
            ->shuffle()
            ->slice(0, $projectCount)
            ->values();
    }

    /**
     * @return array<int, int>
     */
    private function buildAllocations(int $targetTotal, int $projectCount): array
    {
        if ($projectCount === 1) {
            return [$targetTotal];
        }

        $allocations = [];
        $remaining = $targetTotal;

        for ($index = 0; $index < $projectCount; $index++) {
            $projectsLeft = $projectCount - $index;

            if ($projectsLeft === 1) {
                $allocations[] = $remaining;

                continue;
            }

            $baseShare = intdiv($remaining, $projectsLeft);
            $adjustment = ($index % 2 === 0) ? 5 : 0;
            $allocation = max(10, $baseShare + $adjustment);

            $remainingAfterCurrent = $remaining - $allocation;
            $minimumRequiredForRemaining = ($projectsLeft - 1) * 10;

            if ($remainingAfterCurrent < $minimumRequiredForRemaining) {
                $allocation = $remaining - $minimumRequiredForRemaining;
            }

            $allocations[] = $allocation;
            $remaining -= $allocation;
        }

        return $allocations;
    }
}
