<?php

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admins can view projects', function () {
    $admin = User::factory()->admin()->create();
    Project::factory()->create(['name' => 'ERM: Assess']);

    $this->actingAs($admin)
        ->get(route('admin.projects.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Projects/Index')
            ->where('projects.0.name', 'ERM: Assess'),
        );
});

test('admins can create and update projects', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('admin.projects.store'), [
            'name' => 'PixelEdge: Platform',
            'code' => 'PX-001',
            'stream' => 'UI Component Library Migration',
            'description' => 'Platform migration work.',
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.projects.index'));

    $project = Project::query()->where('code', 'PX-001')->firstOrFail();

    $this->actingAs($admin)
        ->put(route('admin.projects.update', $project), [
            'name' => 'PixelEdge: Platform Refresh',
            'code' => 'PX-001',
            'stream' => 'Design Systems',
            'description' => 'Updated scope.',
            'is_active' => true,
        ])
        ->assertRedirect(route('admin.projects.index'));

    expect($project->fresh())
        ->name->toBe('PixelEdge: Platform Refresh')
        ->stream->toBe('Design Systems');
});

test('admins archive projects instead of deleting history', function () {
    $admin = User::factory()->admin()->create();
    $project = Project::factory()->create(['is_active' => true]);

    $this->actingAs($admin)
        ->delete(route('admin.projects.destroy', $project))
        ->assertRedirect(route('admin.projects.index'));

    expect($project->fresh()->is_active)->toBeFalse();
});
