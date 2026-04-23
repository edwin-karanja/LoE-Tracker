import { Head, router } from '@inertiajs/react';
import { BarChart3, CalendarRange, ChevronDown, FolderKanban, Percent } from 'lucide-react';
import { myAllocations } from '@/routes';

type AvailableMonth = {
    label: string;
    value: string;
};

type AllocationRow = {
    allocationPercent: number;
    id: number;
    project: string;
    stream: string | null;
};

type Summary = {
    assignedProjectsCount: number;
    availabilityPercent: number;
    totalAllocationPercent: number;
};

type Allocation = {
    monthLabel: string;
    rows: AllocationRow[];
};

type Props = {
    allocation: Allocation | null;
    availableMonths: AvailableMonth[];
    selectedMonth: string;
    summary: Summary;
};

export default function MyAllocationsIndex({
    allocation,
    availableMonths,
    selectedMonth,
    summary,
}: Props) {
    const selectedMonthLabel =
        availableMonths.find((month) => month.value === selectedMonth)?.label ??
        'Select month';

    const handleMonthChange = (month: string) => {
        router.visit(myAllocations({ query: { month } }), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    return (
        <>
            <Head title="My Allocations" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="space-y-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                            <div className="space-y-1.5">
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                                    My Allocations
                                </h1>
                                <p className="max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                    Review your monthly allocation snapshot for
                                    the current reporting month and previous
                                    months. This page is read-only and reflects
                                    allocations prepared by your administrators.
                                </p>
                            </div>

                            <label className="flex w-full max-w-sm items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                                    <CalendarRange className="size-4.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[0.68rem] font-semibold tracking-[0.22em] text-slate-500 uppercase">
                                        Allocation month
                                    </p>
                                    <div className="relative mt-1">
                                        <select
                                            value={selectedMonth}
                                            onChange={(event) =>
                                                handleMonthChange(
                                                    event.target.value,
                                                )
                                            }
                                            className="w-full appearance-none border-0 bg-transparent p-0 pr-8 text-sm font-semibold text-slate-900 outline-none"
                                            aria-label="Allocation month"
                                        >
                                            {availableMonths.map((month) => (
                                                <option
                                                    key={month.value}
                                                    value={month.value}
                                                >
                                                    {month.label}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="pointer-events-none absolute top-1/2 right-0 size-4 -translate-y-1/2 text-slate-400" />
                                    </div>

                                </div>
                            </label>
                        </div>

                        <div className="grid gap-3 md:grid-cols-3">
                            <article className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <Percent className="size-4.5" />
                                </div>
                                <p className="text-3xl font-semibold tracking-tight text-slate-900">
                                    {summary.totalAllocationPercent}%
                                </p>
                                <p className="mt-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    Total allocation
                                </p>
                            </article>

                            <article className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <BarChart3 className="size-4.5" />
                                </div>
                                <p className="text-3xl font-semibold tracking-tight text-slate-900">
                                    {summary.availabilityPercent}%
                                </p>
                                <p className="mt-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    Availability
                                </p>
                            </article>

                            <article className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <FolderKanban className="size-4.5" />
                                </div>
                                <p className="text-3xl font-semibold tracking-tight text-slate-900">
                                    {summary.assignedProjectsCount}
                                </p>
                                <p className="mt-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    Assigned projects
                                </p>
                            </article>
                        </div>
                    </section>

                    <section>
                        <article className="overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm">
                            <div className="border-b border-slate-200/80 px-6 py-5">
                                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                                    {allocation?.monthLabel ??
                                        'Selected allocation'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    Monthly project allocation breakdown.
                                </p>
                            </div>

                            {allocation ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/90 text-xs tracking-[0.22em] text-slate-500 uppercase">
                                                <th className="px-6 py-4 font-semibold">
                                                    Project
                                                </th>
                                                <th className="px-6 py-4 font-semibold">
                                                    Stream
                                                </th>
                                                <th className="px-6 py-4 text-right font-semibold">
                                                    Allocation
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {allocation.rows.map((row) => (
                                                <tr
                                                    key={row.id}
                                                    className="align-middle"
                                                >
                                                    <td className="px-6 py-5">
                                                        <span className="font-semibold text-slate-950">
                                                            {row.project}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-sm text-slate-500">
                                                        {row.stream ?? '—'}
                                                    </td>
                                                    <td className="px-6 py-5 text-right text-sm font-semibold text-slate-900">
                                                        {row.allocationPercent}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="px-6 py-12 text-center">
                                    <p className="text-sm font-medium text-slate-700">
                                        No allocation snapshot is available for
                                        this month yet.
                                    </p>
                                    <p className="mt-2 text-sm text-slate-500">
                                        Once the monthly allocation is prepared
                                        by an administrator, it will appear
                                        here.
                                    </p>
                                </div>
                            )}
                        </article>
                    </section>
                </div>
            </div>
        </>
    );
}
