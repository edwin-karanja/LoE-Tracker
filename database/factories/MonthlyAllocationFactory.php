<?php

namespace Database\Factories;

use App\Models\MonthlyAllocation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MonthlyAllocation>
 */
class MonthlyAllocationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $month = now()->startOfMonth();

        return [
            'user_id' => User::factory(),
            'month' => $month->toDateString(),
            'total_allocation_percent' => 100,
            'availability_percent' => 0,
            'assigned_projects_count' => fake()->numberBetween(1, 4),
        ];
    }
}
