import { Head, router } from '@inertiajs/react';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as allocationsIndex } from '@/routes/admin/allocations';
import { MonthlyAllocationsTable } from './components/MonthlyAllocationsTable';
import type {
    AllocationProject,
    AllocationUser,
} from './components/MonthlyAllocationsTable';

type Props = {
    allocationValues: Record<string, number>;
    currentMonth: {
        label: string;
        value: string;
    };
    isViewingCurrentMonth: boolean;
    monthViewState: 'current' | 'future' | 'past';
    month: {
        label: string;
        value: string;
    };
    projects: AllocationProject[];
    users: AllocationUser[];
};

export default function AdminAllocationsIndex({
    allocationValues,
    currentMonth,
    isViewingCurrentMonth,
    monthViewState,
    month,
    projects,
    users,
}: Props) {
    const changeMonth = (nextMonth: string) => {
        router.visit(allocationsIndex({ query: { month: nextMonth } }), {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const monthStateUi =
        monthViewState === 'past'
            ? {
                  badge: 'Viewing archived month',
                  badgeClass:
                      'border-amber-200 bg-amber-100 text-amber-800',
                  bannerClass:
                      'border-amber-200/80 bg-white/80',
                  emphasisClass: 'text-amber-800',
                  messagePrefix: 'You are viewing and editing archived allocations for',
                  messageSuffix: `instead of the current month of ${currentMonth.label}.`,
              }
            : monthViewState === 'future'
              ? {
                    badge: 'Viewing future month',
                    badgeClass:
                        'border-sky-200 bg-sky-100 text-sky-800',
                    bannerClass:
                        'border-sky-200/80 bg-white/80',
                    emphasisClass: 'text-sky-800',
                    messagePrefix: 'You are viewing and planning allocations for',
                    messageSuffix: `before the current month of ${currentMonth.label} begins.`,
                }
              : null;

    return (
        <>
            <Head title="Monthly Allocations" />

            <div
                className={`flex flex-1 flex-col ${
                    isViewingCurrentMonth
                        ? 'bg-stone-100'
                        : monthViewState === 'future'
                          ? 'bg-linear-to-br from-sky-50 via-stone-100 to-stone-100'
                          : 'bg-linear-to-br from-amber-50 via-stone-100 to-stone-100'
                }`}
            >
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-3">
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                                    Monthly allocations
                                </h1>
                                {monthStateUi ? (
                                    <span
                                        className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase ${monthStateUi.badgeClass}`}
                                    >
                                        {monthStateUi.badge}
                                    </span>
                                ) : null}
                            </div>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                Review monthly allocations safely, then edit one member at a time for the selected month.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <input
                                type="month"
                                value={month.value}
                                onChange={(event) =>
                                    changeMonth(event.target.value)
                                }
                                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </div>
                    </section>

                    {monthStateUi ? (
                        <section
                            className={`rounded-2xl border px-4 py-3 shadow-sm backdrop-blur-sm ${monthStateUi.bannerClass}`}
                        >
                            <p className="text-sm font-medium text-slate-800">
                                {monthStateUi.messagePrefix}
                                {' '}
                                <span className={monthStateUi.emphasisClass}>
                                    {month.label}
                                </span>
                                {' '}
                                {monthStateUi.messageSuffix}
                            </p>
                        </section>
                    ) : null}

                    <MonthlyAllocationsTable
                        allocationValues={allocationValues}
                        currentMonth={currentMonth}
                        month={month}
                        monthViewState={monthViewState}
                        projects={projects}
                        users={users}
                    />
                </div>
            </div>
        </>
    );
}

AdminAllocationsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'Monthly allocations', href: allocationsIndex() },
    ],
};
