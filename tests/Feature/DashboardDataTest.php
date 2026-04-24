<?php

use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use App\Models\WeeklyPulse;
use App\Models\WeeklyPulseItem;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('dashboard renders database-backed project and pulse data', function () {
    CarbonImmutable::setTestNow('2026-04-23 10:00:00');

    $user = User::factory()->create();
    $project = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);

    UserProject::factory()->for($user)->for($project)->create();

    $weeklyPulse = WeeklyPulse::factory()->for($user)->create();
    WeeklyPulseItem::factory()
        ->for($weeklyPulse)
        ->for($project)
        ->create(['allocation_percent' => 35]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('summary.activeProjectsCount', 1)
            ->where('reportingPeriod.weekStartDate', $weeklyPulse->week_start_date->toDateString())
            ->where('allocationRows.0.project', 'ERM: Assess')
            ->where('allocationRows.0.stream', 'Risk Management Framework')
            ->where('weeklyPulse.id', $weeklyPulse->id)
            ->where('weeklyPulse.weeklySummary', null)
            ->where('submissionDeadline.isOverdue', false)
            ->where('submissionDeadline.at', fn (string $value) => CarbonImmutable::parse($value)->isSameSecond(
                CarbonImmutable::parse($weeklyPulse->week_start_date)->addDays(3)->setTime(17, 0),
            )),
        );

    CarbonImmutable::setTestNow();
});

test('dashboard loads the selected reporting week from the query string', function () {
    CarbonImmutable::setTestNow('2026-04-23 12:00:00');

    $user = User::factory()->create();
    $baseProject = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);
    $historicalProject = Project::factory()->create([
        'name' => 'PixelEdge: Platform',
        'stream' => 'UI Component Library Migration',
    ]);

    UserProject::factory()->for($user)->for($baseProject)->create([
        'starts_on' => '2026-01-01',
        'ends_on' => '2026-01-31',
        'sort_order' => 0,
    ]);
    UserProject::factory()->for($user)->for($historicalProject)->create([
        'starts_on' => '2026-01-01',
        'ends_on' => '2026-01-31',
        'sort_order' => 1,
    ]);

    $weeklyPulse = WeeklyPulse::factory()->for($user)->create([
        'week_start_date' => '2026-01-12',
        'week_end_date' => '2026-01-18',
        'status' => WeeklyPulse::STATUS_SUBMITTED,
        'weekly_summary' => 'Completed assessment updates and shared the client recap.',
    ]);

    $weeklyPulse->items()->createMany([
        [
            'project_id' => $baseProject->id,
            'allocation_percent' => 60,
        ],
        [
            'project_id' => $historicalProject->id,
            'allocation_percent' => 25,
        ],
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['week' => '2026-01-12']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('reportingPeriod.weekStartDate', '2026-01-12')
            ->where('reportingPeriod.isCurrentWeek', false)
            ->where('reportingPeriod.weeks.2.weeklySummary', 'Completed assessment updates and shared the client recap.')
            ->where('summary.currentWeekTotalPercent', 85)
            ->where('weeklyPulse.id', $weeklyPulse->id)
            ->where('allocationRows.0.weekValues.2', 60)
            ->where('allocationRows.1.weekValues.2', 25),
        );

    CarbonImmutable::setTestNow();
});

test('dashboard resolves a submitted pulse when the selected date falls within its week', function () {
    CarbonImmutable::setTestNow('2026-04-23 12:00:00');

    $user = User::factory()->create();
    $project = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);

    $weeklyPulse = WeeklyPulse::factory()->for($user)->create([
        'week_start_date' => '2026-01-12',
        'week_end_date' => '2026-01-18',
        'status' => WeeklyPulse::STATUS_SUBMITTED,
        'weekly_summary' => 'Completed client review and documented next steps.',
    ]);

    $weeklyPulse->items()->create([
        'project_id' => $project->id,
        'allocation_percent' => 40,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['week' => '2026-01-15']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('reportingPeriod.weekStartDate', '2026-01-12')
            ->where('weeklyPulse.id', $weeklyPulse->id)
            ->where('weeklyPulse.status', WeeklyPulse::STATUS_SUBMITTED)
            ->where('weeklyPulse.weeklySummary', 'Completed client review and documented next steps.')
            ->where('summary.currentWeekTotalPercent', 40),
        );

    CarbonImmutable::setTestNow();
});

test('dashboard only shows projects with loe in the selected month', function () {
    CarbonImmutable::setTestNow('2026-04-23 12:00:00');

    $user = User::factory()->create();
    $trackedProject = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);
    $hiddenProject = Project::factory()->create([
        'name' => 'Internal: Upskilling',
        'stream' => 'Generative AI Coursework',
    ]);

    UserProject::factory()->for($user)->for($trackedProject)->create([
        'starts_on' => '2026-01-01',
        'ends_on' => '2026-01-31',
        'sort_order' => 0,
    ]);
    UserProject::factory()->for($user)->for($hiddenProject)->create([
        'starts_on' => '2026-01-01',
        'ends_on' => '2026-01-31',
        'sort_order' => 1,
    ]);

    $weeklyPulse = WeeklyPulse::factory()->for($user)->create([
        'week_start_date' => '2026-01-12',
        'week_end_date' => '2026-01-18',
        'status' => WeeklyPulse::STATUS_SUBMITTED,
    ]);

    $weeklyPulse->items()->create([
        'project_id' => $trackedProject->id,
        'allocation_percent' => 55,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard', ['week' => '2026-01-12']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('summary.activeProjectsCount', 1)
            ->where('allocationRows', fn ($rows) => count($rows) === 1
                && data_get($rows, '0.project') === 'ERM: Assess'),
        );

    CarbonImmutable::setTestNow();
});

test('draft weekly pulses stay overdue against the current week deadline after it passes', function () {
    CarbonImmutable::setTestNow('2026-04-23 18:30:00');

    $user = User::factory()->create();
    $weeklyPulse = WeeklyPulse::factory()->for($user)->create([
        'week_start_date' => '2026-04-20',
        'week_end_date' => '2026-04-26',
        'status' => WeeklyPulse::STATUS_DRAFT,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('weeklyPulse.id', $weeklyPulse->id)
            ->where('submissionDeadline.isOverdue', true)
            ->where('submissionDeadline.at', fn (string $value) => CarbonImmutable::parse($value)->isSameSecond(
                CarbonImmutable::parse('2026-04-23 17:00:00'),
            )),
        );

    CarbonImmutable::setTestNow();
});

test('submitted weekly pulses advance the deadline to the next reporting week', function () {
    CarbonImmutable::setTestNow('2026-04-23 18:30:00');

    $user = User::factory()->create();
    $weeklyPulse = WeeklyPulse::factory()->for($user)->create([
        'week_start_date' => '2026-04-20',
        'week_end_date' => '2026-04-26',
        'status' => WeeklyPulse::STATUS_SUBMITTED,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('weeklyPulse.id', $weeklyPulse->id)
            ->where('submissionDeadline.isOverdue', false)
            ->where('submissionDeadline.at', fn (string $value) => CarbonImmutable::parse($value)->isSameSecond(
                CarbonImmutable::parse('2026-04-30 17:00:00'),
            )),
        );

    CarbonImmutable::setTestNow();
});
