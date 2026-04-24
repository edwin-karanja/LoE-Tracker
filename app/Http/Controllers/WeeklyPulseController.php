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
        $validated = $request->validate([
            'week' => ['nullable', 'date_format:Y-m-d'],
        ]);

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

        return redirect()->to(route('dashboard', [
            'week' => $validated['week'] ?? $weeklyPulse->week_start_date->toDateString(),
        ]));
    }

    public function submit(WeeklyPulse $weeklyPulse): RedirectResponse
    {
        $validated = request()->validate([
            'week' => ['nullable', 'date_format:Y-m-d'],
            'weekly_summary' => ['nullable', 'string', 'max:5000'],
        ]);

        abort_unless($weeklyPulse->user?->is(request()->user()), 403);

        $weeklyPulse->update([
            'status' => WeeklyPulse::STATUS_SUBMITTED,
            'submitted_at' => now(),
            'weekly_summary' => blank($validated['weekly_summary'] ?? null)
                ? null
                : $validated['weekly_summary'],
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Weekly pulse submitted.')]);

        return redirect()->to(route('dashboard', [
            'week' => $validated['week'] ?? $weeklyPulse->week_start_date->toDateString(),
        ]));
    }
}
