<?php

namespace App\Http\Controllers;

use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class MyAllocationController extends Controller
{
    public function index(Request $request): Response
    {
        $validated = $request->validate([
            'month' => ['nullable', 'date_format:Y-m'],
        ]);

        $user = $request->user();
        $currentMonth = CarbonImmutable::today()->startOfMonth();

        $allocations = $user->monthlyAllocations()
            ->with('items')
            ->orderByDesc('month')
            ->get();

        $selectedMonth = $this->resolveSelectedMonth(
            $allocations,
            $validated['month'] ?? null,
            $currentMonth,
        );

        $selectedAllocation = $allocations->first(
            fn ($allocation) => $allocation->month->format('Y-m') === $selectedMonth,
        );
        $availableMonths = $allocations
            ->map(fn ($allocation) => [
                'value' => $allocation->month->format('Y-m'),
                'label' => $allocation->month->format('F Y'),
            ])
            ->unique('value')
            ->values();

        if (! $availableMonths->contains('value', $selectedMonth)) {
            $availableMonths->prepend([
                'value' => $selectedMonth,
                'label' => CarbonImmutable::createFromFormat('Y-m', $selectedMonth)
                    ->startOfMonth()
                    ->format('F Y'),
            ]);
        }

        return Inertia::render('my-allocations', [
            'availableMonths' => $availableMonths->all(),
            'selectedMonth' => $selectedMonth,
            'summary' => [
                'assignedProjectsCount' => $selectedAllocation?->assigned_projects_count ?? 0,
                'availabilityPercent' => $selectedAllocation?->availability_percent ?? 0,
                'totalAllocationPercent' => $selectedAllocation?->total_allocation_percent ?? 0,
            ],
            'allocation' => $selectedAllocation
                ? [
                    'monthLabel' => $selectedAllocation->month->format('F Y'),
                    'rows' => $selectedAllocation->items
                        ->map(fn ($item) => [
                            'allocationPercent' => $item->allocation_percent,
                            'id' => $item->id,
                            'project' => $item->project_name,
                            'stream' => $item->stream,
                        ])
                        ->values()
                        ->all(),
                ]
                : null,
        ]);
    }

    private function resolveSelectedMonth(
        Collection $allocations,
        ?string $requestedMonth,
        CarbonImmutable $currentMonth,
    ): string {
        if ($requestedMonth !== null) {
            return $requestedMonth;
        }

        $currentMonthValue = $currentMonth->format('Y-m');

        if ($allocations->contains(
            fn ($allocation) => $allocation->month->format('Y-m') === $currentMonthValue,
        )) {
            return $currentMonthValue;
        }

        return $allocations->first()?->month->format('Y-m') ?? $currentMonthValue;
    }
}
