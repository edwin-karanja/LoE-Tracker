<?php

use App\Models\Project;
use App\Models\WeeklyPulse;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('weekly_pulse_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(WeeklyPulse::class)
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignIdFor(Project::class)
                ->constrained()
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('allocation_percent')->default(0);
            $table->timestamps();

            $table->unique(['weekly_pulse_id', 'project_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weekly_pulse_items');
    }
};
