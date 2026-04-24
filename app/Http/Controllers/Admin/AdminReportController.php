<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonthlyAllocation;
use App\Models\Project;
use App\Models\User;
use App\Models\WeeklyPulse;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class AdminReportController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        $month = CarbonImmutable::createFromFormat(
            'Y-m',
            $validated['month'] ?? now()->format('Y-m'),
        )->startOfMonth();

        $pulses = WeeklyPulse::query()
            ->with(['items.project:id,name,code,stream', 'user:id,name,email'])
            ->forMonth($month)
            ->get();

        $submittedPulses = $pulses
            ->where('status', WeeklyPulse::STATUS_SUBMITTED)
            ->values();
        $submittedTotals = $submittedPulses
            ->map(fn (WeeklyPulse $pulse): int => (int) $pulse->items->sum('allocation_percent'));

        $monthlyAllocations = MonthlyAllocation::query()
            ->with('items')
            ->forMonth($month)
            ->get();

        return Inertia::render('Admin/Reports/Index', [
            'filters' => [
                'month' => $month->format('Y-m'),
            ],
            'month' => [
                'label' => $month->format('F Y'),
                'value' => $month->format('Y-m'),
            ],
            'overview' => [
                'membersCount' => User::query()->count(),
                'membersReportingCount' => $pulses->pluck('user_id')->filter()->unique()->count(),
                'submittedPulsesCount' => $submittedPulses->count(),
                'draftPulsesCount' => $pulses
                    ->where('status', WeeklyPulse::STATUS_DRAFT)
                    ->count(),
                'submissionRate' => $pulses->isEmpty()
                    ? 0
                    : (int) round(($submittedPulses->count() / $pulses->count()) * 100),
                'averageSubmittedLoe' => (int) round((float) ($submittedTotals->avg() ?? 0)),
                'totalSubmittedLoe' => (int) $submittedTotals->sum(),
                'plannedAllocationTotal' => (int) $monthlyAllocations->sum('total_allocation_percent'),
                'activeProjectsCount' => $submittedPulses
                    ->flatMap(fn (WeeklyPulse $pulse) => $pulse->items->pluck('project_id'))
                    ->filter()
                    ->unique()
                    ->count(),
            ],
            'memberReports' => $this->memberReports($month, $monthlyAllocations, $pulses),
            'projectLoadReports' => $this->projectLoadReports($monthlyAllocations, $submittedPulses),
            'recentSummaries' => $this->recentSummaries($submittedPulses),
        ]);
    }

    /**
     * @param  Collection<int, MonthlyAllocation>  $monthlyAllocations
     * @param  Collection<int, WeeklyPulse>  $pulses
     * @return Collection<int, array<string, mixed>>
     */
    private function memberReports(
        CarbonImmutable $month,
        Collection $monthlyAllocations,
        Collection $pulses,
    ): Collection {
        $allocationsByUser = $monthlyAllocations->keyBy('user_id');
        $pulsesByUser = $pulses->groupBy('user_id');

        return User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(function (User $user) use ($allocationsByUser, $month, $pulsesByUser): array {
                $allocation = $allocationsByUser->get($user->id);
                $userPulses = $pulsesByUser->get($user->id, collect());
                $submittedPulses = $userPulses
                    ->where('status', WeeklyPulse::STATUS_SUBMITTED)
                    ->values();
                $submittedTotals = $submittedPulses
                    ->map(fn (WeeklyPulse $pulse): int => (int) $pulse->items->sum('allocation_percent'));
                $lastSubmittedPulse = $submittedPulses
                    ->sortByDesc('submitted_at')
                    ->first();

                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'month' => $month->format('Y-m'),
                    'plannedAllocationPercent' => $allocation?->total_allocation_percent ?? 0,
                    'availabilityPercent' => $allocation?->availability_percent ?? 100,
                    'assignedProjectsCount' => $allocation?->assigned_projects_count ?? 0,
                    'submittedWeeksCount' => $submittedPulses->count(),
                    'draftWeeksCount' => $userPulses
                        ->where('status', WeeklyPulse::STATUS_DRAFT)
                        ->count(),
                    'averageSubmittedLoe' => (int) round((float) ($submittedTotals->avg() ?? 0)),
                    'totalSubmittedLoe' => (int) $submittedTotals->sum(),
                    'summariesCount' => $submittedPulses
                        ->filter(fn (WeeklyPulse $pulse): bool => filled($pulse->weekly_summary))
                        ->count(),
                    'lastSubmittedAt' => $lastSubmittedPulse?->submitted_at?->toDateTimeString(),
                ];
            })
            ->values();
    }

    /**
     * @param  Collection<int, MonthlyAllocation>  $monthlyAllocations
     * @param  Collection<int, WeeklyPulse>  $submittedPulses
     * @return Collection<int, array<string, mixed>>
     */
    private function projectLoadReports(
        Collection $monthlyAllocations,
        Collection $submittedPulses,
    ): Collection {
        $plannedItems = $monthlyAllocations
            ->flatMap(fn (MonthlyAllocation $allocation) => $allocation->items
                ->filter(fn ($item): bool => $item->project_id !== null)
                ->map(fn ($item): array => [
                    'project_id' => $item->project_id,
                    'user_id' => $allocation->user_id,
                    'allocation_percent' => $item->allocation_percent,
                ]));

        $actualItems = $submittedPulses
            ->flatMap(fn (WeeklyPulse $pulse) => $pulse->items
                ->filter(fn ($item): bool => $item->project_id !== null)
                ->map(fn ($item): array => [
                    'project_id' => $item->project_id,
                    'user_id' => $pulse->user_id,
                    'allocation_percent' => $item->allocation_percent,
                ]));

        $projectIds = $plannedItems
            ->pluck('project_id')
            ->merge($actualItems->pluck('project_id'))
            ->filter()
            ->unique()
            ->values();

        $projects = Project::query()
            ->whereIn('id', $projectIds)
            ->get(['id', 'name', 'code', 'stream'])
            ->keyBy('id');

        return $projectIds
            ->map(function (int $projectId) use ($actualItems, $plannedItems, $projects): array {
                $project = $projects->get($projectId);
                $plannedProjectItems = $plannedItems->where('project_id', $projectId);
                $actualProjectItems = $actualItems->where('project_id', $projectId);
                $plannedAllocation = (int) $plannedProjectItems->sum('allocation_percent');
                $submittedLoe = (int) $actualProjectItems->sum('allocation_percent');

                return [
                    'id' => $projectId,
                    'name' => $project?->name ?? 'Unknown project',
                    'code' => $project?->code,
                    'stream' => $project?->stream,
                    'plannedAllocationPercent' => $plannedAllocation,
                    'submittedLoePercent' => $submittedLoe,
                    'variancePercent' => $submittedLoe - $plannedAllocation,
                    'plannedMembersCount' => $plannedProjectItems->pluck('user_id')->unique()->count(),
                    'submittingMembersCount' => $actualProjectItems->pluck('user_id')->unique()->count(),
                ];
            })
            ->sortByDesc('submittedLoePercent')
            ->values();
    }

    /**
     * @param  Collection<int, WeeklyPulse>  $submittedPulses
     * @return Collection<int, array<string, mixed>>
     */
    private function recentSummaries(Collection $submittedPulses): Collection
    {
        return $submittedPulses
            ->filter(fn (WeeklyPulse $pulse): bool => filled($pulse->weekly_summary))
            ->sortByDesc('submitted_at')
            ->take(5)
            ->map(fn (WeeklyPulse $pulse): array => [
                'id' => $pulse->id,
                'memberName' => $pulse->user?->name,
                'weekStartDate' => $pulse->week_start_date->toDateString(),
                'weekEndDate' => $pulse->week_end_date->toDateString(),
                'submittedAt' => $pulse->submitted_at?->toDateTimeString(),
                'summary' => $pulse->weekly_summary,
            ])
            ->values();
    }
}
