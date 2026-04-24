<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\WeeklyPulseFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['user_id', 'week_start_date', 'week_end_date', 'status', 'submitted_at', 'weekly_summary'])]
class WeeklyPulse extends Model
{
    public const STATUS_DRAFT = 'draft';

    public const STATUS_SUBMITTED = 'submitted';

    /** @use HasFactory<WeeklyPulseFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'week_start_date' => 'date',
            'week_end_date' => 'date',
            'submitted_at' => 'datetime',
        ];
    }

    public function scopeForMonth(Builder $query, CarbonInterface $month): Builder
    {
        return $query->whereDate(
            'week_start_date',
            '>=',
            $month->copy()->startOfMonth()->startOfWeek(CarbonInterface::MONDAY)->toDateString(),
        )->whereDate(
            'week_start_date',
            '<=',
            $month->copy()->endOfMonth()->endOfWeek(CarbonInterface::SUNDAY)->toDateString(),
        );
    }

    public function items(): HasMany
    {
        return $this->hasMany(WeeklyPulseItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
