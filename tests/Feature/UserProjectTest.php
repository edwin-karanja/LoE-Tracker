<?php

use App\Models\Project;
use App\Models\User;
use App\Models\WeeklyPulse;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('users can attach a new project to their current weekly pulse', function () {
    $user = User::factory()->create();
    $project = Project::factory()->create();
    $weeklyPulse = WeeklyPulse::factory()->for($user)->create();

    $this->travelTo($weeklyPulse->week_start_date);

    $this->actingAs($user)
        ->post(route('user-projects.store'), [
            'project_id' => $project->id,
        ])
        ->assertRedirect(route('dashboard'));

    expect($user->projectAssignments()->where('project_id', $project->id)->exists())->toBeTrue()
        ->and($weeklyPulse->fresh()->items()->where('project_id', $project->id)->exists())->toBeTrue();
});
