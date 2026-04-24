<?php

use App\Models\MonthlyAllocation;
use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('admins can view the monthly allocation grid', function () {
    $admin = User::factory()->admin()->create();
    $project = Project::factory()->create(['name' => 'ERM: Assess']);

    Carbon::setTestNow('2026-04-24 00:00:00');

    $this->actingAs($admin)
        ->get(route('admin.allocations.index', ['month' => '2026-04']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Allocations/Index')
            ->where('currentMonth.value', '2026-04')
            ->where('isViewingCurrentMonth', true)
            ->where('monthViewState', 'current')
            ->where('users.0.id', $admin->id)
            ->where('projects.0.id', $project->id)
            ->where('month.value', '2026-04'),
        );
});

test('admins can tell when they are viewing an archived allocation month', function () {
    $admin = User::factory()->admin()->create();

    Carbon::setTestNow('2026-04-24 00:00:00');

    $this->actingAs($admin)
        ->get(route('admin.allocations.index', ['month' => '2026-03']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Allocations/Index')
            ->where('currentMonth.value', '2026-04')
            ->where('isViewingCurrentMonth', false)
            ->where('monthViewState', 'past')
            ->where('month.value', '2026-03'),
        );
});

test('admins can tell when they are viewing a future allocation month', function () {
    $admin = User::factory()->admin()->create();

    Carbon::setTestNow('2026-04-24 00:00:00');

    $this->actingAs($admin)
        ->get(route('admin.allocations.index', ['month' => '2026-05']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Allocations/Index')
            ->where('currentMonth.value', '2026-04')
            ->where('isViewingCurrentMonth', false)
            ->where('monthViewState', 'future')
            ->where('month.value', '2026-05'),
        );
});

test('admins can save monthly allocations for all members including themselves', function () {
    $admin = User::factory()->admin()->create();
    $member = User::factory()->create();
    $project = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);

    $this->actingAs($admin)
        ->put(route('admin.allocations.update', ['month' => '2026-04']), [
            'allocations' => [
                [
                    'user_id' => $admin->id,
                    'project_id' => $project->id,
                    'allocation_percent' => 40,
                ],
                [
                    'user_id' => $member->id,
                    'project_id' => $project->id,
                    'allocation_percent' => 85,
                ],
            ],
        ])
        ->assertRedirect(route('admin.allocations.index', ['month' => '2026-04']));

    $memberAllocation = MonthlyAllocation::query()
        ->where('user_id', $member->id)
        ->whereDate('month', '2026-04-01')
        ->firstOrFail();

    expect($memberAllocation)
        ->total_allocation_percent->toBe(85)
        ->availability_percent->toBe(15)
        ->assigned_projects_count->toBe(1)
        ->and($memberAllocation->items()->first()?->project_name)->toBe('ERM: Assess')
        ->and(UserProject::query()
            ->where('user_id', $member->id)
            ->where('project_id', $project->id)
            ->whereDate('starts_on', '2026-04-01')
            ->whereDate('ends_on', '2026-04-30')
            ->exists())->toBeTrue();
});

test('admins can save allocations for one member without clearing others', function () {
    $admin = User::factory()->admin()->create();
    $member = User::factory()->create();
    $project = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);

    $this->actingAs($admin)
        ->put(route('admin.allocations.update', ['month' => '2026-04']), [
            'allocations' => [
                [
                    'user_id' => $admin->id,
                    'project_id' => $project->id,
                    'allocation_percent' => 40,
                ],
                [
                    'user_id' => $member->id,
                    'project_id' => $project->id,
                    'allocation_percent' => 85,
                ],
            ],
        ])
        ->assertRedirect(route('admin.allocations.index', ['month' => '2026-04']));

    $this->actingAs($admin)
        ->put(route('admin.allocations.update', ['month' => '2026-04']), [
            'allocations' => [
                [
                    'user_id' => $member->id,
                    'project_id' => $project->id,
                    'allocation_percent' => 55,
                ],
            ],
        ])
        ->assertRedirect(route('admin.allocations.index', ['month' => '2026-04']));

    $adminAllocation = MonthlyAllocation::query()
        ->where('user_id', $admin->id)
        ->whereDate('month', '2026-04-01')
        ->firstOrFail();

    $memberAllocation = MonthlyAllocation::query()
        ->where('user_id', $member->id)
        ->whereDate('month', '2026-04-01')
        ->firstOrFail();

    expect($adminAllocation->total_allocation_percent)->toBe(40)
        ->and($memberAllocation->total_allocation_percent)->toBe(55)
        ->and(UserProject::query()
            ->where('user_id', $admin->id)
            ->where('project_id', $project->id)
            ->whereDate('starts_on', '2026-04-01')
            ->exists())->toBeTrue()
        ->and(UserProject::query()
            ->where('user_id', $member->id)
            ->where('project_id', $project->id)
            ->whereDate('starts_on', '2026-04-01')
            ->exists())->toBeTrue();
});
