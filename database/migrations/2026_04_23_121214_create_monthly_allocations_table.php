<?php

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
        Schema::create('monthly_allocations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('month');
            $table->unsignedSmallInteger('total_allocation_percent')->default(0);
            $table->unsignedSmallInteger('availability_percent')->default(0);
            $table->unsignedInteger('assigned_projects_count')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_allocations');
    }
};
