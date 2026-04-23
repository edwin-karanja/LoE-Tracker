<?php

use App\Http\Controllers\DashboardController;
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
    Route::get('my-allocations', [MyAllocationController::class, 'index'])->name('my-allocations');
    Route::post('user-projects', [UserProjectController::class, 'store'])->name('user-projects.store');
    Route::put('weekly-pulses/{weeklyPulse}', [WeeklyPulseController::class, 'update'])->name('weekly-pulses.update');
    Route::post('weekly-pulses/{weeklyPulse}/submit', [WeeklyPulseController::class, 'submit'])->name('weekly-pulses.submit');
});

require __DIR__.'/settings.php';
