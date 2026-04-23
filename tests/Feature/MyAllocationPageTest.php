<?php

use App\Models\MonthlyAllocation;
use App\Models\MonthlyAllocationItem;
use App\Models\Project;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;

uses(RefreshDatabase::class);

test('authenticated users can view their current monthly allocation snapshot', function () {
    CarbonImmutable::setTestNow('2026-04-23 09:00:00');

    $user = User::factory()->create();
    $project = Project::factory()->create([
        'name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
    ]);

    $allocation = MonthlyAllocation::factory()->for($user)->create([
        'month' => '2026-04-01',
        'total_allocation_percent' => 100,
        'availability_percent' => 10,
        'assigned_projects_count' => 2,
    ]);

    MonthlyAllocationItem::factory()->for($allocation)->create([
        'project_id' => $project->id,
        'project_name' => 'ERM: Assess',
        'stream' => 'Risk Management Framework',
        'allocation_percent' => 50,
        'sort_order' => 1,
    ]);

    $this->actingAs($user)
        ->get(route('my-allocations'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('my-allocations')
            ->where('selectedMonth', '2026-04')
            ->where('summary.totalAllocationPercent', 100)
            ->where('summary.availabilityPercent', 10)
            ->where('summary.assignedProjectsCount', 2)
            ->where('allocation.monthLabel', 'April 2026')
            ->where('allocation.rows.0.project', 'ERM: Assess')
            ->where('allocation.rows.0.allocationPercent', 50),
        );

    CarbonImmutable::setTestNow();
});

test('users can switch to previous monthly allocation snapshots', function () {
    CarbonImmutable::setTestNow('2026-04-23 09:00:00');

    $user = User::factory()->create();

    $currentAllocation = MonthlyAllocation::factory()->for($user)->create([
        'month' => '2026-04-01',
        'total_allocation_percent' => 100,
        'availability_percent' => 0,
        'assigned_projects_count' => 2,
    ]);

    $previousAllocation = MonthlyAllocation::factory()->for($user)->create([
        'month' => '2026-03-01',
        'total_allocation_percent' => 85,
        'availability_percent' => 15,
        'assigned_projects_count' => 1,
    ]);

    MonthlyAllocationItem::factory()->for($currentAllocation)->create([
        'project_name' => 'PixelEdge: Platform',
        'stream' => 'UI Component Library Migration',
        'allocation_percent' => 55,
    ]);

    MonthlyAllocationItem::factory()->for($previousAllocation)->create([
        'project_name' => 'Internal: Upskilling',
        'stream' => 'Generative AI Coursework',
        'allocation_percent' => 70,
    ]);

    $this->actingAs($user)
        ->get(route('my-allocations', ['month' => '2026-03']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('my-allocations')
            ->where('selectedMonth', '2026-03')
            ->where('summary.totalAllocationPercent', 85)
            ->where('summary.availabilityPercent', 15)
            ->where('summary.assignedProjectsCount', 1)
            ->where('allocation.monthLabel', 'March 2026')
            ->where('allocation.rows.0.project', 'Internal: Upskilling')
            ->where('availableMonths.0.value', '2026-04')
            ->where('availableMonths.1.value', '2026-03'),
        );

    CarbonImmutable::setTestNow();
});

test('users only see their own monthly allocations', function () {
    CarbonImmutable::setTestNow('2026-04-23 09:00:00');

    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    MonthlyAllocation::factory()->for($otherUser)->create([
        'month' => '2026-04-01',
        'total_allocation_percent' => 100,
        'availability_percent' => 0,
        'assigned_projects_count' => 3,
    ]);

    $this->actingAs($user)
        ->get(route('my-allocations'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('my-allocations')
            ->where('summary.totalAllocationPercent', 0)
            ->where('allocation', null),
        );

    CarbonImmutable::setTestNow();
});
