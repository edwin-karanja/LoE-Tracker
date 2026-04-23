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
            ->where('allocationRows.0.project', 'ERM: Assess')
            ->where('allocationRows.0.stream', 'Risk Management Framework')
            ->where('weeklyPulse.id', $weeklyPulse->id)
            ->where('submissionDeadline.isOverdue', false)
            ->where('submissionDeadline.at', fn (string $value) => CarbonImmutable::parse($value)->isSameSecond(
                CarbonImmutable::parse($weeklyPulse->week_start_date)->addDays(3)->setTime(17, 0),
            )),
        );
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
