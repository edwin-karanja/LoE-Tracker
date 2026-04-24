<?php

use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminLoeSubmissionController;
use App\Http\Controllers\Admin\AdminMonthlyAllocationController;
use App\Http\Controllers\Admin\AdminProjectController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HelpCenterController;
use App\Http\Controllers\MyAllocationController;
use App\Http\Controllers\UserProjectController;
use App\Http\Controllers\WeeklyPulseController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'show'])->name('dashboard');
    Route::get('help-center', [HelpCenterController::class, 'index'])->name('help-center');
    Route::get('my-allocations', [MyAllocationController::class, 'index'])->name('my-allocations');
    Route::post('user-projects', [UserProjectController::class, 'store'])->name('user-projects.store');
    Route::put('weekly-pulses/{weeklyPulse}', [WeeklyPulseController::class, 'update'])->name('weekly-pulses.update');
    Route::post('weekly-pulses/{weeklyPulse}/submit', [WeeklyPulseController::class, 'submit'])->name('weekly-pulses.submit');

    Route::middleware('admin')
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('/', AdminDashboardController::class)->name('dashboard');
            Route::resource('projects', AdminProjectController::class);
            Route::get('allocations', [AdminMonthlyAllocationController::class, 'index'])->name('allocations.index');
            Route::put('allocations/{month}', [AdminMonthlyAllocationController::class, 'update'])->name('allocations.update');
            Route::get('loe-submissions', [AdminLoeSubmissionController::class, 'index'])->name('loe-submissions.index');
            Route::get('loe-submissions/{weeklyPulse}', [AdminLoeSubmissionController::class, 'show'])->name('loe-submissions.show');
        });
});

require __DIR__.'/settings.php';
