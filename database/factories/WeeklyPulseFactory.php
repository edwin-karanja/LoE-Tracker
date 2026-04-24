<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\WeeklyPulse;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WeeklyPulse>
 */
class WeeklyPulseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $weekStart = now()->startOfWeek();

        return [
            'user_id' => User::factory(),
            'week_start_date' => $weekStart->toDateString(),
            'week_end_date' => $weekStart->copy()->addDays(6)->toDateString(),
            'status' => WeeklyPulse::STATUS_DRAFT,
            'submitted_at' => null,
            'weekly_summary' => null,
        ];
    }
}
