<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserProject>
 */
class UserProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'project_id' => Project::factory(),
            'starts_on' => now()->startOfWeek()->toDateString(),
            'ends_on' => null,
            'sort_order' => 0,
        ];
    }
}
