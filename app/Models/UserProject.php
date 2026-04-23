<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\UserProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['user_id', 'project_id', 'starts_on', 'ends_on', 'sort_order'])]
class UserProject extends Model
{
    /** @use HasFactory<UserProjectFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'starts_on' => 'date',
            'ends_on' => 'date',
        ];
    }

    public function scopeActiveDuring(
        Builder $query,
        CarbonInterface $startDate,
        CarbonInterface $endDate,
    ): Builder {
        return $query
            ->whereDate('starts_on', '<=', $endDate->toDateString())
            ->where(function (Builder $builder) use ($startDate) {
                $builder
                    ->whereNull('ends_on')
                    ->orWhereDate('ends_on', '>=', $startDate->toDateString());
            });
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
