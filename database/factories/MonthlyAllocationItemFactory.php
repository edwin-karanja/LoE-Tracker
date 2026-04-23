<?php

namespace Database\Factories;

use App\Models\MonthlyAllocation;
use App\Models\MonthlyAllocationItem;
use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MonthlyAllocationItem>
 */
class MonthlyAllocationItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $projectName = fake()->randomElement([
            'ERM: Assess',
            'PixelEdge: Platform',
            'Internal: Upskilling',
            'EnergyIntel (ICAST)',
        ]);

        return [
            'monthly_allocation_id' => MonthlyAllocation::factory(),
            'project_id' => Project::factory(),
            'project_name' => $projectName,
            'stream' => fake()->randomElement([
                'Risk Management Framework',
                'UI Component Library Migration',
                'Generative AI Coursework',
                'Advisory Delivery',
            ]),
            'allocation_percent' => fake()->randomElement([10, 15, 20, 25, 30, 40, 50]),
            'sort_order' => fake()->numberBetween(1, 6),
        ];
    }
}
