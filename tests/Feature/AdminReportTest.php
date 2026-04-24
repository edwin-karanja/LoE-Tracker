<?php

use App\Models\MonthlyAllocation;
use App\Models\Project;
use App\Models\User;
use App\Models\WeeklyPulse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('only admins can view reports', function () {
    $member = User::factory()->create();

    $this->actingAs($member)
        ->get(route('admin.reports.index'))
        ->assertForbidden();
});

test('admins can view monthly visual report data', function () {
    $admin = User::factory()->admin()->create(['name' => 'Z Admin']);
    $member = User::factory()->create(['name' => 'Aashir Khan']);
    $project = Project::factory()->create([
        'name' => 'ERM: Assess',
        'code' => 'ERM-ASSESS',
        'stream' => 'Risk Management Framework',
    ]);

    $monthlyAllocation = MonthlyAllocation::factory()
        ->for($member)
        ->create([
            'month' => '2026-04-01',
            'total_allocation_percent' => 80,
            'availability_percent' => 20,
            'assigned_projects_count' => 1,
        ]);

    $monthlyAllocation->items()->create([
        'project_id' => $project->id,
        'project_name' => $project->name,
        'stream' => $project->stream,
        'allocation_percent' => 80,
        'sort_order' => 0,
    ]);

    $submittedPulse = WeeklyPulse::factory()
        ->for($member)
        ->create([
            'week_start_date' => '2026-04-06',
            'week_end_date' => '2026-04-12',
            'status' => WeeklyPulse::STATUS_SUBMITTED,
            'submitted_at' => '2026-04-09 15:30:00',
            'weekly_summary' => 'Completed the risk framework review.',
        ]);

    $submittedPulse->items()->create([
        'project_id' => $project->id,
        'allocation_percent' => 75,
    ]);

    WeeklyPulse::factory()
        ->for($member)
        ->create([
            'week_start_date' => '2026-04-13',
            'week_end_date' => '2026-04-19',
            'status' => WeeklyPulse::STATUS_DRAFT,
        ]);

    $this->actingAs($admin)
        ->get(route('admin.reports.index', ['month' => '2026-04']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Reports/Index')
            ->where('month.label', 'April 2026')
            ->where('overview.membersCount', 2)
            ->where('overview.membersReportingCount', 1)
            ->where('overview.submittedPulsesCount', 1)
            ->where('overview.draftPulsesCount', 1)
            ->where('overview.submissionRate', 50)
            ->where('overview.averageSubmittedLoe', 75)
            ->where('overview.plannedAllocationTotal', 80)
            ->where('projectLoadReports.0.name', 'ERM: Assess')
            ->where('projectLoadReports.0.plannedAllocationPercent', 80)
            ->where('projectLoadReports.0.submittedLoePercent', 75)
            ->where('projectLoadReports.0.variancePercent', -5)
            ->where('memberReports.0.name', 'Aashir Khan')
            ->where('memberReports.0.plannedAllocationPercent', 80)
            ->where('memberReports.0.availabilityPercent', 20)
            ->where('memberReports.0.submittedWeeksCount', 1)
            ->where('memberReports.0.draftWeeksCount', 1)
            ->where('memberReports.0.averageSubmittedLoe', 75)
            ->where('recentSummaries.0.summary', 'Completed the risk framework review.'),
        );
});
