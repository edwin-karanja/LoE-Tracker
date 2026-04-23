<?php

use App\Models\MonthlyAllocation;
use App\Models\Project;
use App\Models\User;
use Database\Seeders\MonthlyAllocationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('monthly allocation seeder creates snapshots for existing users with mixed totals', function () {
    User::factory()->count(3)->create();
    Project::factory()->count(6)->create();

    $this->seed(MonthlyAllocationSeeder::class);

    $allocations = MonthlyAllocation::query()->with('items')->get();

    expect($allocations)->toHaveCount(9)
        ->and($allocations->every(fn (MonthlyAllocation $allocation) => $allocation->items->isNotEmpty()))->toBeTrue()
        ->and($allocations->contains(fn (MonthlyAllocation $allocation) => $allocation->total_allocation_percent === 100))->toBeTrue()
        ->and($allocations->contains(fn (MonthlyAllocation $allocation) => $allocation->total_allocation_percent < 100))->toBeTrue();
});
