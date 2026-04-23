<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateWeeklyPulseRequest;
use App\Models\WeeklyPulse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WeeklyPulseController extends Controller
{
    public function update(
        UpdateWeeklyPulseRequest $request,
        WeeklyPulse $weeklyPulse,
    ): RedirectResponse {
        abort_unless($weeklyPulse->user?->is($request->user()), 403);

        if ($weeklyPulse->status === WeeklyPulse::STATUS_SUBMITTED) {
            throw ValidationException::withMessages([
                'weekly_pulse' => __('Submitted weekly pulses can not be edited.'),
            ]);
        }

        $allowedProjectIds = $request->user()
            ->projectAssignments()
            ->activeDuring($weeklyPulse->week_start_date, $weeklyPulse->week_end_date)
            ->pluck('project_id');

        $items = collect($request->validated('items'));

        if ($items->pluck('project_id')->diff($allowedProjectIds)->isNotEmpty()) {
            throw ValidationException::withMessages([
                'items' => __('One or more selected projects are not available for this pulse.'),
            ]);
        }

        DB::transaction(function () use ($items, $weeklyPulse) {
            $weeklyPulse->items()
                ->whereNotIn('project_id', $items->pluck('project_id'))
                ->delete();

            $items->each(function (array $item) use ($weeklyPulse) {
                $weeklyPulse->items()->updateOrCreate(
                    ['project_id' => $item['project_id']],
                    ['allocation_percent' => $item['allocation_percent']],
                );
            });
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Weekly pulse saved.')]);

        return to_route('dashboard');
    }

    public function submit(WeeklyPulse $weeklyPulse): RedirectResponse
    {
        abort_unless($weeklyPulse->user?->is(request()->user()), 403);

        $weeklyPulse->update([
            'status' => WeeklyPulse::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Weekly pulse submitted.')]);

        return to_route('dashboard');
    }
}
