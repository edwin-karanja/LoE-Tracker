<?php

use App\Models\Project;
use App\Models\User;
use App\Models\UserProject;
use App\Models\WeeklyPulse;
use Carbon\CarbonImmutable;
use Database\Seeders\WeeklyPulseHistorySeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('weekly pulse history seeder backfills january through march with april projects and a fourth extra project', function () {
    CarbonImmutable::setTestNow('2026-04-23 10:00:00');

    $user = User::factory()->create();

    $baseProjects = collect([
        Project::factory()->create([
            'name' => 'ERM: Assess',
            'stream' => 'Risk Management Framework',
        ]),
        Project::factory()->create([
            'name' => 'PixelEdge: Platform',
            'stream' => 'UI Component Library Migration',
        ]),
        Project::factory()->create([
            'name' => 'Internal: Upskilling',
            'stream' => 'Generative AI Coursework',
        ]),
    ]);

    $extraProjects = Project::factory()->count(3)->create();

    $baseProjects->values()->each(function (Project $project, int $index) use ($user): void {
        UserProject::factory()->for($user)->for($project)->create([
            'starts_on' => '2026-04-01',
            'sort_order' => $index,
        ]);
    });

    $this->seed(WeeklyPulseHistorySeeder::class);

    $historicalPulses = WeeklyPulse::query()
        ->where('user_id', $user->id)
        ->whereDate('week_start_date', '>=', '2025-12-29')
        ->whereDate('week_start_date', '<', '2026-04-01')
        ->with('items')
        ->orderBy('week_start_date')
        ->get();

    expect($historicalPulses)->not->toBeEmpty()
        ->and($historicalPulses)->toHaveCount(14)
        ->and($historicalPulses->every(
            fn (WeeklyPulse $weeklyPulse) => $weeklyPulse->status === WeeklyPulse::STATUS_SUBMITTED
                && $weeklyPulse->items->count() === 4
                && $weeklyPulse->items->sum('allocation_percent') >= 90
                && $weeklyPulse->items->sum('allocation_percent') <= 130
        ))->toBeTrue()
        ->and($historicalPulses->every(function (WeeklyPulse $weeklyPulse) use ($baseProjects): bool {
            $projectIds = $weeklyPulse->items->pluck('project_id');

            return $baseProjects->every(
                fn (Project $project) => $projectIds->contains($project->id),
            ) && $projectIds->diff($baseProjects->pluck('id'))->count() === 1;
        }))->toBeTrue()
        ->and(
            UserProject::query()
                ->where('user_id', $user->id)
                ->whereDate('starts_on', '>=', '2026-01-01')
                ->whereDate('ends_on', '<=', '2026-03-31')
                ->count(),
        )->toBeGreaterThanOrEqual(4)
        ->and($extraProjects->contains(
            fn (Project $project) => $historicalPulses->contains(
                fn (WeeklyPulse $weeklyPulse) => $weeklyPulse->items->contains('project_id', $project->id),
            ),
        ))->toBeTrue();

    CarbonImmutable::setTestNow();
});

test('weekly pulse history seeder overwrites existing historical values for all seeded weeks', function () {
    CarbonImmutable::setTestNow('2026-04-23 10:00:00');

    $user = User::factory()->create();
    $baseProjects = Project::factory()->count(3)->create();
    $legacyProject = Project::factory()->create();

    $baseProjects->values()->each(function (Project $project, int $index) use ($user): void {
        UserProject::factory()->for($user)->for($project)->create([
            'starts_on' => '2026-04-01',
            'sort_order' => $index,
        ]);
    });

    $stalePulse = WeeklyPulse::factory()->for($user)->create([
        'week_start_date' => '2025-12-29',
        'week_end_date' => '2026-01-04',
        'status' => WeeklyPulse::STATUS_DRAFT,
    ]);

    $stalePulse->items()->create([
        'allocation_percent' => 10,
        'project_id' => $legacyProject->id,
    ]);

    $this->seed(WeeklyPulseHistorySeeder::class);

    $reseededPulse = WeeklyPulse::query()
        ->where('user_id', $user->id)
        ->whereDate('week_start_date', '2025-12-29')
        ->with('items')
        ->sole();

    expect($reseededPulse->status)->toBe(WeeklyPulse::STATUS_SUBMITTED)
        ->and($reseededPulse->items)->toHaveCount(4)
        ->and($reseededPulse->items->contains('project_id', $legacyProject->id))->toBeFalse()
        ->and($reseededPulse->items->sum('allocation_percent'))->toBeGreaterThanOrEqual(90)
        ->and($reseededPulse->items->sum('allocation_percent'))->toBeLessThanOrEqual(130);

    CarbonImmutable::setTestNow();
});

test('weekly pulse history seeder selects random base projects when user has no april assignments', function () {
    CarbonImmutable::setTestNow('2026-04-23 10:00:00');

    $user = User::factory()->create();
    Project::factory()->count(8)->create();

    $this->seed(WeeklyPulseHistorySeeder::class);

    $historicalAssignments = UserProject::query()
        ->where('user_id', $user->id)
        ->whereDate('starts_on', '2026-01-01')
        ->whereIn('sort_order', [0, 1, 2])
        ->orderBy('sort_order')
        ->get();

    expect($historicalAssignments)->toHaveCount(3)
        ->and($historicalAssignments->pluck('project_id')->unique())->toHaveCount(3);

    CarbonImmutable::setTestNow();
});
