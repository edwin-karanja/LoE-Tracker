<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\WeeklyPulse;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();
        $now = CarbonImmutable::now();
        $today = $now->startOfDay();
        $reportingWeekStart = $today->startOfWeek(CarbonImmutable::MONDAY);
        $reportingWeekEnd = $today->endOfWeek(CarbonImmutable::SUNDAY);
        $reportingMonth = $reportingWeekStart->startOfMonth();

        $weekStarts = collect();
        $cursor = $reportingMonth->startOfWeek(CarbonImmutable::MONDAY);
        $monthEnd = $reportingMonth->endOfMonth();

        while ($cursor->lte($monthEnd)) {
            $weekStarts->push($cursor);
            $cursor = $cursor->addWeek();
        }

        $assignments = $user->projectAssignments()
            ->with('project')
            ->activeDuring($reportingWeekStart, $reportingWeekEnd)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        $currentPulse = $user->weeklyPulses()
            ->whereDate('week_start_date', $reportingWeekStart->toDateString())
            ->first();

        if (! $currentPulse) {
            $currentPulse = $user->weeklyPulses()->create([
                'week_start_date' => $reportingWeekStart->toDateString(),
                'week_end_date' => $reportingWeekEnd->toDateString(),
                'status' => WeeklyPulse::STATUS_DRAFT,
            ]);
        }

        $submissionDeadline = $this->resolveSubmissionDeadline(
            $currentPulse,
            $now,
        );

        $monthlyPulses = $user->weeklyPulses()
            ->forMonth($reportingMonth)
            ->with('items')
            ->get()
            ->keyBy(fn (WeeklyPulse $weeklyPulse) => $weeklyPulse->week_start_date->toDateString());

        $allocationRows = $assignments
            ->map(function ($assignment) use ($monthlyPulses, $weekStarts) {
                return [
                    'projectId' => $assignment->project_id,
                    'project' => $assignment->project->name,
                    'stream' => $assignment->project->stream,
                    'weekValues' => $weekStarts
                        ->map(function (CarbonImmutable $weekStart) use ($assignment, $monthlyPulses) {
                            $weeklyPulse = $monthlyPulses->get($weekStart->toDateString());

                            return $weeklyPulse?->items
                                ->firstWhere('project_id', $assignment->project_id)
                                ?->allocation_percent;
                        })
                        ->values()
                        ->all(),
                ];
            })
            ->values()
            ->all();

        $availableProjects = Project::query()
            ->active()
            ->whereNotIn('id', $assignments->pluck('project_id'))
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (Project $project) => [
                'id' => $project->id,
                'name' => $project->name,
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'availableProjects' => $availableProjects,
            'allocationRows' => $allocationRows,
            'summary' => [
                'activeProjectsCount' => $assignments->count(),
                'currentWeekTotalPercent' => (int) $currentPulse->items()->sum('allocation_percent'),
            ],
            'submissionDeadline' => [
                'at' => $submissionDeadline->toIso8601String(),
                'isOverdue' => $currentPulse->status === WeeklyPulse::STATUS_DRAFT
                    && $now->greaterThanOrEqualTo($submissionDeadline),
            ],
            'weeklyPulse' => [
                'id' => $currentPulse->id,
                'status' => $currentPulse->status,
                'weekStartDate' => $reportingWeekStart->toDateString(),
                'weekEndDate' => $reportingWeekEnd->toDateString(),
            ],
        ]);
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
