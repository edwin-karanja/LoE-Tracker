import { Head, router, usePage } from '@inertiajs/react';
import {
    addDays,
    eachWeekOfInterval,
    endOfMonth,
    isSameDay,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import { Copy, FolderKanban, Info, Plus } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { AddProjectDialog } from '@/pages/Dashboard/components/AddProjectDialog';
import { ReportingPeriodPicker } from '@/pages/Dashboard/components/ReportingPeriodPicker';
import { SubmissionDeadlineSection } from '@/pages/Dashboard/components/SubmissionDeadlineSection';
import { SubmitWeeklyPulseDialog } from '@/pages/Dashboard/components/SubmitWeeklyPulseDialog';
import { update as updateWeeklyPulse } from '@/routes/weekly-pulses';

type AllocationRow = {
    projectId: number;
    project: string;
    stream: string;
    weekValues: Array<number | null>;
};

type AvailableProject = {
    id: number;
    name: string;
};

type Summary = {
    activeProjectsCount: number;
    currentWeekTotalPercent: number;
};

type SubmissionDeadline = {
    at: string;
    isOverdue: boolean;
};

type WeeklyPulse = {
    id: number;
    status: string;
    weekStartDate: string;
    weekEndDate: string;
};

type Props = {
    allocationRows: AllocationRow[];
    availableProjects: AvailableProject[];
    submissionDeadline: SubmissionDeadline;
    summary: Summary;
    weeklyPulse: WeeklyPulse;
};

export default function DashboardShowcase({
    allocationRows,
    availableProjects,
    submissionDeadline,
    summary,
    weeklyPulse,
}: Props) {
    const { auth } = usePage().props;
    const userName = auth.user?.name?.split(' ')[0] ?? 'there';
    const today = new Date();
    const initialReportingDate = new Date(weeklyPulse.weekStartDate);
    const getWorkWeekRange = (date: Date): DateRange => {
        const monday = startOfWeek(date, { weekStartsOn: 1 });

        return {
            from: monday,
            to: addDays(monday, 6),
        };
    };
    const buildEditableAllocations = (date: Date): Record<number, number> => {
        const selectedRange = getWorkWeekRange(date);
        const selectedMonth = selectedRange.from ?? date;
        const monthWeeks = eachWeekOfInterval(
            {
                start: startOfMonth(selectedMonth),
                end: endOfMonth(selectedMonth),
            },
            { weekStartsOn: 1 },
        ).map((weekStart) => ({
            start: weekStart,
            end: addDays(weekStart, 4),
        }));
        const weekIndex = monthWeeks.findIndex((week) =>
            selectedRange.from
                ? isSameDay(week.start, selectedRange.from)
                : false,
        );

        if (weekIndex < 0) {
            return {};
        }

        return Object.fromEntries(
            allocationRows.map((row) => [
                row.projectId,
                row.weekValues[weekIndex] ?? 0,
            ]),
        );
    };
    const [reportingPeriod, setReportingPeriod] = useState<
        DateRange | undefined
    >(getWorkWeekRange(initialReportingDate));
    const [editableAllocations, setEditableAllocations] = useState<
        Record<number, number>
    >(() => buildEditableAllocations(initialReportingDate));

    const handleReportingPeriodSelect = (date: Date | undefined) => {
        if (!date) {
            return;
        }

        setReportingPeriod(getWorkWeekRange(date));
        setEditableAllocations(buildEditableAllocations(date));
    };
    const reportingMonth = reportingPeriod?.from ?? today;
    const reportingWeeks = eachWeekOfInterval(
        {
            start: startOfMonth(reportingMonth),
            end: endOfMonth(reportingMonth),
        },
        { weekStartsOn: 1 },
    ).map((weekStart) => ({
        start: weekStart,
        end: addDays(weekStart, 4),
    }));
    const selectedWeekIndex = reportingWeeks.findIndex((week) =>
        reportingPeriod?.from
            ? isSameDay(week.start, reportingPeriod.from)
            : false,
    );
    const currentPulseWeekStart = new Date(weeklyPulse.weekStartDate);
    const isCurrentPulseWeekSelected = reportingPeriod?.from
        ? isSameDay(reportingPeriod.from, currentPulseWeekStart)
        : false;
    const totalAllocationByWeek = reportingWeeks.map((_, weekIndex) =>
        allocationRows.reduce(
            (total, row) =>
                total +
                (weekIndex > selectedWeekIndex
                    ? 0
                    : (row.weekValues[weekIndex] ?? 0)),
            0,
        ),
    );
    const currentWeekTotalPercent = summary.currentWeekTotalPercent ?? 0;
    const savedAllocationsForSelectedWeek = Object.fromEntries(
        allocationRows.map((row) => [
            row.projectId,
            selectedWeekIndex >= 0
                ? (row.weekValues[selectedWeekIndex] ?? 0)
                : 0,
        ]),
    );
    const isDirty = allocationRows.some(
        (row) =>
            (editableAllocations[row.projectId] ?? 0) !==
            (savedAllocationsForSelectedWeek[row.projectId] ?? 0),
    );
    const pulseStatusLabel =
        weeklyPulse.status === 'submitted' ? 'Submitted' : 'Draft';
    const pulseStatusClasses =
        weeklyPulse.status === 'submitted'
            ? 'bg-emerald-100 text-emerald-800'
            : 'bg-amber-100 text-amber-800';
    const canEditSelectedWeek =
        isCurrentPulseWeekSelected && weeklyPulse.status !== 'submitted';

    const clampAllocation = (value: number): number =>
        Math.max(0, Math.min(100, value));

    const updateAllocation = (projectId: number, nextValue: number) => {
        setEditableAllocations((current) => ({
            ...current,
            [projectId]: clampAllocation(nextValue),
        }));
    };

    const handleAllocationInput = (projectId: number, value: string) => {
        if (value === '') {
            updateAllocation(projectId, 0);

            return;
        }

        updateAllocation(projectId, Number.parseInt(value, 10) || 0);
    };

    const handleSaveWeeklyPulse = () => {
        if (!canEditSelectedWeek) {
            return;
        }

        router.visit(updateWeeklyPulse(weeklyPulse.id), {
            data: {
                items: allocationRows.map((row) => ({
                    allocation_percent: editableAllocations[row.projectId] ?? 0,
                    project_id: row.projectId,
                })),
            },
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="space-y-3">
                        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                            <div className="space-y-1.5">
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.55rem]">
                                    Welcome back, {userName}
                                </h1>
                                <p className="text-sm text-slate-500 md:text-base">
                                    Review and update your Level of Effort for
                                    the current reporting week.
                                </p>
                            </div>

                            <ReportingPeriodPicker
                                defaultMonth={today}
                                reportingPeriod={reportingPeriod}
                                onSelect={handleReportingPeriodSelect}
                            />
                        </div>

                        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(13rem,0.72fr)_minmax(13rem,0.72fr)]">
                            <article className="rounded-[1.1rem] border border-slate-200 bg-white p-3.5 shadow-sm">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold tracking-tight text-slate-900 md:text-[1.35rem]">
                                            Monthly Allocation Progress
                                        </h2>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            Target: 160 Hours / 100%
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[0.72rem] font-semibold text-emerald-700 md:text-xs">
                                        On Track
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[0.72rem] font-semibold tracking-[0.16em] text-slate-800 uppercase md:text-xs">
                                        <span>Current Status</span>
                                        <span className="text-emerald-700">
                                            {currentWeekTotalPercent}% Complete
                                        </span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                        <div
                                            className="h-full rounded-full bg-emerald-700"
                                            style={{
                                                width: `${Math.min(
                                                    currentWeekTotalPercent,
                                                    100,
                                                )}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-[1.1rem] border border-slate-200 bg-white p-3.5 shadow-sm">
                                <div className="mb-4 flex size-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <FolderKanban className="size-4" />
                                </div>
                                <p className="text-3xl font-semibold tracking-tight text-slate-900">
                                    {summary.activeProjectsCount}
                                </p>
                                <p className="mt-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-500 uppercase md:text-xs">
                                    Active Projects
                                </p>
                            </article>

                            <SubmissionDeadlineSection
                                deadlineAt={submissionDeadline.at}
                                isOverdue={submissionDeadline.isOverdue}
                                pulseStatus={weeklyPulse.status}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <article className="overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                                            Weekly LoE Tracker
                                        </h2>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${pulseStatusClasses}`}
                                        >
                                            {pulseStatusLabel}
                                        </span>
                                        {isDirty ? (
                                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                                                Unsaved changes
                                            </span>
                                        ) : null}
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        Adjust and record your level of effort
                                        per project for the current week.
                                    </p>
                                    {!isCurrentPulseWeekSelected ? (
                                        <p className="text-xs font-medium text-amber-700">
                                            Saving and submitting are only
                                            available for the current reporting
                                            week.
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <AddProjectDialog
                                        availableProjects={availableProjects}
                                    />
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        onClick={handleSaveWeeklyPulse}
                                        disabled={
                                            allocationRows.length === 0 ||
                                            !canEditSelectedWeek ||
                                            !isDirty
                                        }
                                    >
                                        <Copy className="size-4" />
                                        Save changes
                                    </button>
                                    <SubmitWeeklyPulseDialog
                                        allocationRows={allocationRows}
                                        canSubmit={
                                            isCurrentPulseWeekSelected &&
                                            weeklyPulse.status !== 'submitted'
                                        }
                                        editableAllocations={
                                            editableAllocations
                                        }
                                        hasUnsavedChanges={isDirty}
                                        weeklyPulse={weeklyPulse}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/90 text-xs tracking-[0.22em] text-slate-500 uppercase">
                                            <th className="px-6 py-4 font-semibold">
                                                Project &amp; stream
                                            </th>
                                            {reportingWeeks.map(
                                                (week, weekIndex) => {
                                                    const isSelected =
                                                        weekIndex ===
                                                        selectedWeekIndex;

                                                    return (
                                                        <th
                                                            key={week.start.toISOString()}
                                                            className={`px-4 py-4 text-center font-semibold ${
                                                                isSelected
                                                                    ? 'border-x border-slate-200 bg-blue-50 text-blue-700'
                                                                    : ''
                                                            }`}
                                                        >
                                                            Week {weekIndex + 1}
                                                        </th>
                                                    );
                                                },
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allocationRows.length > 0 ? (
                                            allocationRows.map((row) => (
                                                <tr
                                                    key={row.projectId}
                                                    className="align-middle"
                                                >
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-semibold text-slate-950">
                                                                {row.project}
                                                            </span>
                                                            <span className="text-sm text-slate-500">
                                                                {row.stream}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    {reportingWeeks.map(
                                                        (week, weekIndex) => {
                                                            const selectedWeekValue =
                                                                editableAllocations[
                                                                    row
                                                                        .projectId
                                                                ] ??
                                                                row.weekValues[
                                                                    weekIndex
                                                                ] ??
                                                                0;
                                                            const value =
                                                                weekIndex >
                                                                selectedWeekIndex
                                                                    ? 0
                                                                    : (row
                                                                          .weekValues[
                                                                          weekIndex
                                                                      ] ??
                                                                      null);
                                                            const isSelected =
                                                                weekIndex ===
                                                                selectedWeekIndex;

                                                            if (isSelected) {
                                                                return (
                                                                    <td
                                                                        key={`${row.projectId}-${week.start.toISOString()}`}
                                                                        className="border-x border-slate-200 bg-slate-50/70 px-4 py-5"
                                                                    >
                                                                        <div className="flex items-center justify-center gap-3">
                                                                            <button
                                                                                type="button"
                                                                                className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                                                                                aria-label={`Decrease ${row.project} allocation`}
                                                                                disabled={
                                                                                    !canEditSelectedWeek
                                                                                }
                                                                                onClick={() =>
                                                                                    updateAllocation(
                                                                                        row.projectId,
                                                                                        selectedWeekValue -
                                                                                            5,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <span className="text-lg leading-none">
                                                                                    -
                                                                                </span>
                                                                            </button>
                                                                            <div className="relative w-20">
                                                                                <input
                                                                                    type="number"
                                                                                    min="0"
                                                                                    max="100"
                                                                                    step="5"
                                                                                    inputMode="numeric"
                                                                                    value={
                                                                                        selectedWeekValue
                                                                                    }
                                                                                    disabled={
                                                                                        !canEditSelectedWeek
                                                                                    }
                                                                                    onChange={(
                                                                                        event,
                                                                                    ) =>
                                                                                        handleAllocationInput(
                                                                                            row.projectId,
                                                                                            event
                                                                                                .target
                                                                                                .value,
                                                                                        )
                                                                                    }
                                                                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-7 text-center text-base font-semibold text-emerald-900 transition outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                                                    aria-label={`${row.project} allocation percentage`}
                                                                                />
                                                                                <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                                                                                aria-label={`Increase ${row.project} allocation`}
                                                                                disabled={
                                                                                    !canEditSelectedWeek
                                                                                }
                                                                                onClick={() =>
                                                                                    updateAllocation(
                                                                                        row.projectId,
                                                                                        selectedWeekValue +
                                                                                            5,
                                                                                    )
                                                                                }
                                                                            >
                                                                                <Plus className="size-4" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                );
                                                            }

                                                            return (
                                                                <td
                                                                    key={`${row.projectId}-${week.start.toISOString()}`}
                                                                    className={`px-4 py-5 text-center text-sm font-medium ${
                                                                        value ===
                                                                        null
                                                                            ? 'text-slate-300'
                                                                            : 'text-slate-400'
                                                                    }`}
                                                                >
                                                                    {value ===
                                                                    null
                                                                        ? '-'
                                                                        : `${value}%`}
                                                                </td>
                                                            );
                                                        },
                                                    )}
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={
                                                        reportingWeeks.length +
                                                        1
                                                    }
                                                    className="px-6 py-12 text-center text-sm text-slate-500"
                                                >
                                                    No active projects are
                                                    assigned for this reporting
                                                    period yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-slate-200 bg-slate-50/90">
                                            <td className="px-6 py-4 font-semibold text-slate-950">
                                                Total allocation
                                            </td>
                                            {reportingWeeks.map(
                                                (week, weekIndex) => {
                                                    const total =
                                                        weekIndex ===
                                                        selectedWeekIndex
                                                            ? allocationRows.reduce(
                                                                  (sum, row) =>
                                                                      sum +
                                                                      (editableAllocations[
                                                                          row
                                                                              .projectId
                                                                      ] ?? 0),
                                                                  0,
                                                              )
                                                            : totalAllocationByWeek[
                                                                  weekIndex
                                                              ];
                                                    const isSelected =
                                                        weekIndex ===
                                                        selectedWeekIndex;

                                                    return (
                                                        <td
                                                            key={`total-${week.start.toISOString()}`}
                                                            className={`px-4 py-4 text-center text-sm ${
                                                                isSelected
                                                                    ? 'border-x border-slate-200 bg-blue-50 font-bold text-blue-700'
                                                                    : total ===
                                                                        0
                                                                      ? 'font-medium text-slate-300'
                                                                      : 'font-medium text-slate-500'
                                                            }`}
                                                        >
                                                            {total === 0
                                                                ? '0%'
                                                                : `${total}%`}
                                                        </td>
                                                    );
                                                },
                                            )}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </article>

                        <article className="rounded-[1.8rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-sky-50 p-6 shadow-sm">
                            <div className="flex items-start gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                                    <Info className="size-5" />
                                </div>
                                <div className="w-full space-y-5">
                                    <div>
                                        <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                                            Submission instructions
                                        </h3>
                                        <p className="mt-1 text-sm leading-6 text-slate-600">
                                            Use the actions in the Weekly LoE
                                            Tracker to either keep working on a
                                            draft or finalize the current
                                            reporting week. Weekly pulses are
                                            due every Friday by 5:00 PM.
                                        </p>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-2">
                                        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
                                            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                                Save changes
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                                Saves your current LoE entries
                                                as a draft for this week so you
                                                can come back and continue
                                                editing before final submission.
                                            </p>
                                        </div>

                                        <div className="rounded-[1.4rem] border border-slate-200 bg-white/80 p-4 shadow-sm">
                                            <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                                Submit week&apos;s pulse
                                            </p>
                                            <p className="mt-2 text-sm leading-6 text-slate-700">
                                                Finalizes the weekly pulse and
                                                sends it as the official record
                                                for that week. After submission,
                                                changes require administrator
                                                authorization.
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm font-medium text-slate-700">
                                        Tip: If you see the{' '}
                                        <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800">
                                            Unsaved changes
                                        </span>{' '}
                                        badge, save your draft first if you are
                                        not ready to submit yet.
                                    </p>
                                </div>
                            </div>
                        </article>
                    </section>
                </div>
            </div>
        </>
    );
}
