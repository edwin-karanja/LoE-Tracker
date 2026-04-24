<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\MonthlyAllocation;
use App\Models\Project;
use App\Models\User;
use App\Models\WeeklyPulse;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Admin/Dashboard/Index', [
            'summary' => [
                'usersCount' => User::query()->count(),
                'activeProjectsCount' => Project::query()->active()->count(),
                'currentMonthAllocationsCount' => MonthlyAllocation::query()
                    ->forMonth(now())
                    ->count(),
                'submittedPulsesCount' => WeeklyPulse::query()
                    ->where('status', WeeklyPulse::STATUS_SUBMITTED)
                    ->count(),
            ],
        ]);
    }
}
