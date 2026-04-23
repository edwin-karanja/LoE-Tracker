<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\MonthlyAllocationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'month',
    'total_allocation_percent',
    'availability_percent',
    'assigned_projects_count',
])]
class MonthlyAllocation extends Model
{
    /** @use HasFactory<MonthlyAllocationFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'month' => 'date',
        ];
    }

    public function scopeForMonth(Builder $query, CarbonInterface $month): Builder
    {
        return $query->whereDate('month', $month->startOfMonth()->toDateString());
    }

    public function items(): HasMany
    {
        return $this->hasMany(MonthlyAllocationItem::class)->orderBy('sort_order')->orderBy('id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
