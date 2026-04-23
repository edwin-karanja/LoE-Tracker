<?php

namespace Database\Factories;

use App\Models\Project;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $availableProjectNames = [
            'FyldHub (Amber, i413)',
            'LoanIntel Covenants (FinTech)',
            'Customer Experience Revamp',
            'Internal AI Enablement',
            'Operations Excellence',
            'MyMonitor.AI',
            'HSF - GrantMatch & Salesforce',
            'ERM: Assess',
            'PixelEdge: Platform',
            'Internal: Upskilling',
            'General Administration',
        ];

        return [
            'name' => fake()->unique()->randomElement($availableProjectNames),
            'code' => fake()->unique()->bothify('PRJ-###'),
            'stream' => fake()->randomElement([
                'Risk Management Framework',
                'UI Component Library Migration',
                'Generative AI Coursework',
                'Operations Planning',
                'Fintech Innovation',
                'Artificial Intelligence',
            ]),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
