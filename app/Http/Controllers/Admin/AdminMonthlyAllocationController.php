<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateMonthlyAllocationsRequest;
use App\Models\MonthlyAllocation;
use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminMonthlyAllocationController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        $month = $this->monthFromString($validated['month'] ?? now()->format('Y-m'));
        $monthKey = $month->format('Y-m');

        $users = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'is_admin'])
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'isAdmin' => $user->is_admin,
            ])
            ->values();

        $projects = Project::query()
            ->active()
            ->orderBy('name')
            ->get(['id', 'name', 'code', 'stream'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
                'code' => $project->code,
                'stream' => $project->stream,
            ])
            ->values();

        $allocationValues = MonthlyAllocation::query()
            ->forMonth($month)
            ->with('items')
            ->get()
            ->flatMap(fn (MonthlyAllocation $allocation) => $allocation->items
                ->filter(fn ($item) => $item->project_id !== null)
                ->map(fn ($item) => [
                    'key' => "{$allocation->user_id}:{$item->project_id}",
                    'value' => $item->allocation_percent,
                ]))
            ->pluck('value', 'key');

        return Inertia::render('Admin/Allocations/Index', [
            'allocationValues' => $allocationValues,
            'month' => [
                'label' => $month->format('F Y'),
                'value' => $monthKey,
            ],
            'projects' => $projects,
            'users' => $users,
        ]);
    }

    public function update(
        UpdateMonthlyAllocationsRequest $request,
        string $month,
    ): RedirectResponse {
        $monthStart = $this->monthFromString($month);
        $monthEnd = $monthStart->endOfMonth();
        $projects = Project::query()->get(['id', 'name', 'stream'])->keyBy('id');

        $allocationsByUser = collect($request->validated('allocations'))
            ->groupBy('user_id');

        DB::transaction(function () use ($allocationsByUser, $monthStart, $monthEnd, $projects): void {
            $allocationsByUser->each(function ($allocations, int|string $userId) use ($monthStart, $monthEnd, $projects): void {
                $positiveAllocations = collect($allocations)
                    ->filter(fn (array $allocation) => (int) $allocation['allocation_percent'] > 0)
                    ->values();

                $total = (int) $positiveAllocations->sum('allocation_percent');

                $monthlyAllocation = MonthlyAllocation::query()->updateOrCreate(
                    [
                        'user_id' => $userId,
                        'month' => $monthStart->toDateString(),
                    ],
                    [
                        'total_allocation_percent' => $total,
                        'availability_percent' => max(0, 100 - $total),
                        'assigned_projects_count' => $positiveAllocations->count(),
                    ],
                );

                $monthlyAllocation->items()->delete();

                $positiveAllocations->each(function (array $allocation, int $index) use ($monthlyAllocation, $projects): void {
                    $project = $projects->get($allocation['project_id']);

                    if (! $project) {
                        return;
                    }

                    $monthlyAllocation->items()->create([
                        'project_id' => $project->id,
                        'project_name' => $project->name,
                        'stream' => $project->stream,
                        'allocation_percent' => (int) $allocation['allocation_percent'],
                        'sort_order' => $index,
                    ]);
                });

                UserProject::query()
                    ->where('user_id', $userId)
                    ->whereDate('starts_on', $monthStart->toDateString())
                    ->whereDate('ends_on', $monthEnd->toDateString())
                    ->delete();

                $positiveAllocations->each(function (array $allocation, int $index) use ($userId, $monthStart, $monthEnd): void {
                    UserProject::create([
                        'user_id' => $userId,
                        'project_id' => $allocation['project_id'],
                        'starts_on' => $monthStart->toDateString(),
                        'ends_on' => $monthEnd->toDateString(),
                        'sort_order' => $index,
                    ]);
                });
            });
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Monthly allocations saved.')]);

        return redirect()->route('admin.allocations.index', [
            'month' => $monthStart->format('Y-m'),
        ]);
    }

    private function monthFromString(string $month): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat('Y-m', $month)->startOfMonth();
    }
}
