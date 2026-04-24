<?php

use App\Models\Project;
use App\Models\User;
use App\Models\WeeklyPulse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admins can view weekly loe submissions from other users', function () {
    $admin = User::factory()->admin()->create();
    $member = User::factory()->create(['name' => 'Aashir Khan']);
    $project = Project::factory()->create(['name' => 'ERM: Assess']);
    $weeklyPulse = WeeklyPulse::factory()->for($member)->create([
        'week_start_date' => '2026-04-13',
        'week_end_date' => '2026-04-19',
        'status' => WeeklyPulse::STATUS_SUBMITTED,
        'weekly_summary' => 'Completed assessment updates.',
        'submitted_at' => '2026-04-16 14:00:00',
    ]);

    $weeklyPulse->items()->create([
        'project_id' => $project->id,
        'allocation_percent' => 65,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.loe-submissions.index', ['month' => '2026-04']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LoeSubmissions/Index')
            ->where('submissions.0.user.name', 'Aashir Khan')
            ->where('submissions.0.totalAllocationPercent', 65)
            ->where('submissions.0.weeklySummary', 'Completed assessment updates.'),
        );
});

test('admins can view a weekly loe submission detail', function () {
    $admin = User::factory()->admin()->create();
    $member = User::factory()->create();
    $project = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);
    $weeklyPulse = WeeklyPulse::factory()->for($member)->create([
        'status' => WeeklyPulse::STATUS_SUBMITTED,
        'weekly_summary' => 'Completed the risk assessment review.',
    ]);

    $weeklyPulse->items()->create([
        'project_id' => $project->id,
        'allocation_percent' => 90,
    ]);

    $this->actingAs($admin)
        ->get(route('admin.loe-submissions.show', $weeklyPulse))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/LoeSubmissions/Show')
            ->where('submission.weeklySummary', 'Completed the risk assessment review.')
            ->where('submission.items.0.project', 'ERM: Assess')
            ->where('submission.items.0.allocationPercent', 90),
        );
});
