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
        Schema::create('monthly_allocation_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('monthly_allocation_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('project_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->string('project_name');
            $table->string('stream')->nullable();
            $table->unsignedSmallInteger('allocation_percent')->default(0);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monthly_allocation_items');
    }
};
