<?php

namespace App\Models;

use Database\Factories\WeeklyPulseItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['weekly_pulse_id', 'project_id', 'allocation_percent'])]
class WeeklyPulseItem extends Model
{
    /** @use HasFactory<WeeklyPulseItemFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'allocation_percent' => 'integer',
        ];
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function weeklyPulse(): BelongsTo
    {
        return $this->belongsTo(WeeklyPulse::class);
    }
}
