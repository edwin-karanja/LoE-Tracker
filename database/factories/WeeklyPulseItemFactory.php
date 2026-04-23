<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\WeeklyPulse;
use App\Models\WeeklyPulseItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WeeklyPulseItem>
 */
class WeeklyPulseItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'weekly_pulse_id' => WeeklyPulse::factory(),
            'project_id' => Project::factory(),
            'allocation_percent' => fake()->numberBetween(0, 100),
        ];
    }
}
