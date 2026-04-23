<?php

use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use App\Models\WeeklyPulse;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('users can save allocations for their weekly pulse', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $weeklyPulse = WeeklyPulse::factory()->for($user)->create();

    UserProject::factory()
        ->for($user)
        ->for($project)
        ->create([
            'starts_on' => $weeklyPulse->week_start_date,
            'ends_on' => null,
        ]);

    $this->actingAs($user)
        ->put(route('weekly-pulses.update', $weeklyPulse), [
            'items' => [
                [
                    'project_id' => $project->id,
                    'allocation_percent' => 100,
                ],
            ],
        ])
        ->assertRedirect(route('dashboard'));

    expect($weeklyPulse->fresh()->items()->first()?->allocation_percent)->toBe(100);
});

test('users can submit a weekly pulse regardless of the current total allocation', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $weeklyPulse = WeeklyPulse::factory()->for($user)->create();

    $weeklyPulse->items()->create([
        'project_id' => $project->id,
        'allocation_percent' => 65,
    ]);

    $this->actingAs($user)
        ->post(route('weekly-pulses.submit', $weeklyPulse))
        ->assertRedirect(route('dashboard'));

    expect($weeklyPulse->fresh()->status)->toBe(WeeklyPulse::STATUS_SUBMITTED)
        ->and($weeklyPulse->fresh()->submitted_at)->not->toBeNull();
});
