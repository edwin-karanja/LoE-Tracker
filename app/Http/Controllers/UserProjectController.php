<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserProjectRequest;
use App\Models\Project;
use App\Models\WeeklyPulse;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class UserProjectController extends Controller
{
    public function store(StoreUserProjectRequest $request): RedirectResponse
    {
        $user = $request->user();
        $project = Project::query()->active()->findOrFail($request->integer('project_id'));
        $today = CarbonImmutable::today();
        $weekStart = $today->startOfWeek(CarbonImmutable::MONDAY);
        $weekEnd = $today->endOfWeek(CarbonImmutable::SUNDAY);

        DB::transaction(function () use ($project, $user, $weekEnd, $weekStart) {
            $assignment = $user->projectAssignments()
                ->activeDuring($weekStart, $weekEnd)
                ->where('project_id', $project->id)
                ->first();

            if (! $assignment) {
                $user->projectAssignments()->create([
                    'project_id' => $project->id,
                    'starts_on' => $weekStart->toDateString(),
                    'sort_order' => (int) $user->projectAssignments()->max('sort_order') + 1,
                ]);
            }

            $weeklyPulse = $user->weeklyPulses()
                ->whereDate('week_start_date', $weekStart->toDateString())
                ->first();

            if (! $weeklyPulse) {
                $weeklyPulse = $user->weeklyPulses()->create([
                    'week_start_date' => $weekStart->toDateString(),
                    'week_end_date' => $weekEnd->toDateString(),
                    'status' => WeeklyPulse::STATUS_DRAFT,
                ]);
            }

            $weeklyPulse->items()->firstOrCreate(
                ['project_id' => $project->id],
                ['allocation_percent' => 0],
            );
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Project added to weekly pulse.')]);

        return to_route('dashboard');
    }
}
