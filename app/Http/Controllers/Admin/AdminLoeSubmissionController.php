<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Project;
use App\Models\User;
use App\Models\WeeklyPulse;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminLoeSubmissionController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
            'status' => ['nullable', 'in:draft,submitted'],
            'user' => ['nullable', 'integer', 'exists:users,id'],
            'project' => ['nullable', 'integer', 'exists:projects,id'],
        ]);

        $month = CarbonImmutable::createFromFormat(
            'Y-m',
            $validated['month'] ?? now()->format('Y-m'),
        )->startOfMonth();

        $submissions = WeeklyPulse::query()
            ->with(['user:id,name,email', 'items.project:id,name,stream'])
            ->forMonth($month)
            ->when($validated['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($validated['user'] ?? null, fn ($query, int $userId) => $query->where('user_id', $userId))
            ->when($validated['project'] ?? null, fn ($query, int $projectId) => $query->whereHas('items', fn ($items) => $items->where('project_id', $projectId)))
            ->orderByDesc('week_start_date')
            ->orderBy('user_id')
            ->get()
            ->map(fn (WeeklyPulse $pulse) => [
                'id' => $pulse->id,
                'user' => [
                    'name' => $pulse->user?->name,
                    'email' => $pulse->user?->email,
                ],
                'weekStartDate' => $pulse->week_start_date->toDateString(),
                'weekEndDate' => $pulse->week_end_date->toDateString(),
                'status' => $pulse->status,
                'submittedAt' => $pulse->submitted_at?->toDateTimeString(),
                'totalAllocationPercent' => (int) $pulse->items->sum('allocation_percent'),
                'weeklySummary' => $pulse->weekly_summary,
                'projectsCount' => $pulse->items->count(),
            ]);

        return Inertia::render('Admin/LoeSubmissions/Index', [
            'filters' => [
                'month' => $month->format('Y-m'),
                'status' => $validated['status'] ?? '',
                'user' => $validated['user'] ?? '',
                'project' => $validated['project'] ?? '',
            ],
            'projects' => Project::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Project $project) => [
                    'id' => $project->id,
                    'name' => $project->name,
                ]),
            'submissions' => $submissions,
            'users' => User::query()
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                ]),
        ]);
    }

    public function show(WeeklyPulse $weeklyPulse): Response
    {
        $weeklyPulse->load(['user:id,name,email', 'items.project:id,name,stream']);

        return Inertia::render('Admin/LoeSubmissions/Show', [
            'submission' => [
                'id' => $weeklyPulse->id,
                'user' => [
                    'name' => $weeklyPulse->user?->name,
                    'email' => $weeklyPulse->user?->email,
                ],
                'weekStartDate' => $weeklyPulse->week_start_date->toDateString(),
                'weekEndDate' => $weeklyPulse->week_end_date->toDateString(),
                'status' => $weeklyPulse->status,
                'submittedAt' => $weeklyPulse->submitted_at?->toDateTimeString(),
                'weeklySummary' => $weeklyPulse->weekly_summary,
                'totalAllocationPercent' => (int) $weeklyPulse->items->sum('allocation_percent'),
                'items' => $weeklyPulse->items
                    ->map(fn ($item) => [
                        'id' => $item->id,
                        'project' => $item->project?->name,
                        'stream' => $item->project?->stream,
                        'allocationPercent' => $item->allocation_percent,
                    ])
                    ->values(),
            ],
        ]);
    }
}
