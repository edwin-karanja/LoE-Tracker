<?php

namespace App\Models;

use Database\Factories\MonthlyAllocationItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'monthly_allocation_id',
    'project_id',
    'project_name',
    'stream',
    'allocation_percent',
    'sort_order',
])]
class MonthlyAllocationItem extends Model
{
    /** @use HasFactory<MonthlyAllocationItemFactory> */
    use HasFactory;

    public function monthlyAllocation(): BelongsTo
    {
        return $this->belongsTo(MonthlyAllocation::class);
    }

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
