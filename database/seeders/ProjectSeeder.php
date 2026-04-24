<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Ensure a pool of active projects exists for assignments and other seeders.
     */
    public function run(): void
    {
        $target = 8;
        $current = Project::query()->active()->count();

        if ($current < $target) {
            Project::factory()
                ->count($target - $current)
                ->create();
        }
    }
}
