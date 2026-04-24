import { Head, router, usePage } from '@inertiajs/react';
import {
    addDays,
    format,
    getISOWeek,
    isSameDay,
    isWithinInterval,
    parseISO,
    startOfWeek,
} from 'date-fns';
import {
    AlertTriangle,
    CircleHelp,
    Copy,
    FolderKanban,
    Info,
    Plus,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { AddProjectDialog } from '@/pages/Dashboard/components/AddProjectDialog';
import { ReportingPeriodPicker } from '@/pages/Dashboard/components/ReportingPeriodPicker';
import { SubmissionDeadlineSection } from '@/pages/Dashboard/components/SubmissionDeadlineSection';
import { SubmitWeeklyPulseDialog } from '@/pages/Dashboard/components/SubmitWeeklyPulseDialog';
import { dashboard } from '@/routes';
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

type ReportingWeek = {
    endDate: string;
    index: number;
    startDate: string;
    weeklySummary: string | null;
};

type ReportingPeriod = {
    isCurrentWeek: boolean;
    monthStartDate: string;
    weekEndDate: string;
    weekStartDate: string;
    weeks: ReportingWeek[];
};

type SubmissionDeadline = {
    at: string;
    isOverdue: boolean;
};

type WeeklyPulse = {
    id: number | null;
    status: string;
    weekStartDate: string;
    weekEndDate: string;
    weeklySummary: string | null;
};

type Props = {
    allocationRows: AllocationRow[];
    availableProjects: AvailableProject[];
    reportingPeriod: ReportingPeriod;
    submissionDeadline: SubmissionDeadline;
    summary: Summary;
    weeklyPulse: WeeklyPulse;
};

function DashboardTooltip({
    children,
    content,
}: {
    children: ReactNode;
    content: string;
}) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent className="max-w-64 rounded-xl bg-slate-900 px-3 py-2 text-[0.72rem] leading-5 text-white shadow-lg">
                <p>{content}</p>
            </TooltipContent>
        </Tooltip>
    );
}

function TooltipHint({ content }: { content: string }) {
    return (
        <DashboardTooltip
            content={content}
        >
            <button
                type="button"
                className="inline-flex size-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label={content}
            >
                <CircleHelp className="size-3.5" />
            </button>
        </DashboardTooltip>
    );
}

function previewWeeklySummary(summary: string): string {
    const words = summary.trim().split(/\s+/);

    if (words.length <= 4) {
        return summary;
    }

    return `${words.slice(0, 15).join(' ')}...`;
}

export default function DashboardShowcase({
    allocationRows,
    availableProjects,
    reportingPeriod,
    submissionDeadline,
    summary,
    weeklyPulse,
}: Props) {
    const { auth } = usePage().props;
    const userName = auth.user?.name?.split(' ')[0] ?? 'there';

    const getWorkWeekRange = (date: Date): DateRange => {
        const monday = startOfWeek(date, { weekStartsOn: 1 });

        return {
            from: monday,
            to: addDays(monday, 6),
        };
    };

    const selectedWeekStartDate = reportingPeriod.weekStartDate;
    const selectedWeekStart = parseISO(selectedWeekStartDate);
    const selectedReportingRange = getWorkWeekRange(selectedWeekStart);
    const reportingWeeks = reportingPeriod.weeks.map((week) => ({
        end: parseISO(week.endDate),
        index: week.index,
        start: parseISO(week.startDate),
        weeklySummary: week.weeklySummary,
    }));
    const selectedWeekIndex = reportingWeeks.findIndex((week) =>
        isSameDay(week.start, selectedWeekStart),
    );

    const savedAllocationsForSelectedWeek = Object.fromEntries(
        allocationRows.map((row) => [
            row.projectId,
            selectedWeekIndex >= 0
                ? (row.weekValues[selectedWeekIndex] ?? 0)
                : 0,
        ]),
    );

    const [editableAllocations, setEditableAllocations] = useState<
        Record<number, number>
    >(savedAllocationsForSelectedWeek);
    const [expandedWeekSummaries, setExpandedWeekSummaries] = useState<
        Record<string, boolean>
    >({});

    const handleReportingPeriodSelect = (date: Date | undefined) => {
        if (!date) {
            return;
        }

        const matchedWeek = reportingWeeks.find((week) =>
            isWithinInterval(date, {
                start: week.start,
                end: week.end,
            }),
        );
        const nextWeekStart = matchedWeek?.start ?? startOfWeek(date, { weekStartsOn: 1 });

        router.visit(
            dashboard({
                query: {
                    week: format(nextWeekStart, 'yyyy-MM-dd'),
                },
            }),
            {
                preserveState: false,
                preserveScroll: true,
            },
        );
    };

    const totalAllocationByWeek = reportingWeeks.map((_, weekIndex) =>
        allocationRows.reduce(
            (total, row) => total + (row.weekValues[weekIndex] ?? 0),
            0,
        ),
    );

    const currentWeekTotalPercent = summary.currentWeekTotalPercent ?? 0;
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
    const shouldShowSubmissionReminder =
        weeklyPulse.status === 'draft' && submissionDeadline.isOverdue;
    const canEditSelectedWeek =
        reportingPeriod.isCurrentWeek &&
        weeklyPulse.id !== null &&
        weeklyPulse.status !== 'submitted';

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

    const toggleWeekSummary = (weekStartDate: string) => {
        setExpandedWeekSummaries((current) => ({
            ...current,
            [weekStartDate]: !current[weekStartDate],
        }));
    };

    const handleSaveWeeklyPulse = () => {
        if (!canEditSelectedWeek || weeklyPulse.id === null) {
            return;
        }

        router.visit(
            updateWeeklyPulse(weeklyPulse.id, {
                query: { week: selectedWeekStartDate },
            }),
            {
                data: {
                    items: allocationRows.map((row) => ({
                        allocation_percent:
                            editableAllocations[row.projectId] ?? 0,
                        project_id: row.projectId,
                    })),
                },
                preserveState: false,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    {shouldShowSubmissionReminder ? (
                        <section>
                            <div className="flex w-full items-start gap-4 rounded-[1.5rem] border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-red-50 px-5 py-4 shadow-sm">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                                    <AlertTriangle className="size-5" />
                                </div>
                                <div className="min-w-0 space-y-1.5">
                                    <p className="text-base font-semibold text-slate-900 md:text-lg">
                                        Your weekly pulse is still waiting for
                                        submission.
                                    </p>
                                    <p className="max-w-4xl text-sm leading-7 text-slate-600 md:text-base">
                                        The Thursday 5:00 PM deadline has
                                        passed, and this week&apos;s pulse is
                                        still in draft. Review your entries and
                                        submit it as soon as possible.
                                    </p>
                                </div>
                            </div>
                        </section>
                    ) : null}

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
                                defaultMonth={
                                    parseISO(reportingPeriod.monthStartDate)
                                }
                                reportingPeriod={selectedReportingRange}
                                onSelect={handleReportingPeriodSelect}
                            />
                        </div>

                        <div className="grid gap-2.5 xl:grid-cols-[minmax(0,1.55fr)_minmax(13rem,0.72fr)_minmax(13rem,0.72fr)]">
                            <article className="rounded-[1.1rem] border border-slate-200 bg-white p-3.5 shadow-sm">
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <h2 className="text-lg font-semibold tracking-tight text-slate-900 md:text-[1.35rem]">
                                                Monthly Allocation Progress
                                            </h2>
                                            <TooltipHint content="This shows the saved allocation total for the currently selected week and helps you spot whether your LoE is on track for the month." />
                                        </div>
                                        <p className="mt-0.5 text-sm text-slate-500">
                                            Target: 160 Hours / 100%
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[0.72rem] font-semibold text-emerald-700 md:text-xs">
                                            On Track
                                        </span>
                                        <TooltipHint content="A quick health signal for the currently selected week based on the saved LoE total shown below." />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[0.72rem] font-semibold tracking-[0.16em] text-slate-800 uppercase md:text-xs">
                                        <span>Current Status</span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-emerald-700">
                                                {currentWeekTotalPercent}%
                                                Complete
                                            </span>
                                            <TooltipHint content="This number reflects the saved total allocation for the selected week in the database, not unsaved edits." />
                                        </div>
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
                                <div className="flex items-center gap-1.5">
                                    <p className="text-3xl font-semibold tracking-tight text-slate-900">
                                        {summary.activeProjectsCount}
                                    </p>
                                    <TooltipHint content="Only projects that have LoE recorded in the selected month appear in the tracker below." />
                                </div>
                                <p className="mt-1 text-[0.72rem] font-semibold tracking-[0.16em] text-slate-500 uppercase md:text-xs">
                                    Active Projects
                                </p>
                            </article>

                            <SubmissionDeadlineSection
                                deadlineAt={submissionDeadline.at}
                                isOverdue={submissionDeadline.isOverdue}
                            />
                        </div>
                    </section>

                    <section className="space-y-4">
                        <article className="overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <div className="flex items-center gap-1.5">
                                            <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                                                Weekly LoE Tracker
                                            </h2>
                                            <TooltipHint content="Use the highlighted week column to enter or adjust LoE percentages. Changing the reporting period reloads the tracker from the backend for that selected week." />
                                        </div>
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
                                    {!reportingPeriod.isCurrentWeek ? (
                                        <p className="text-xs font-medium text-amber-700">
                                            Saving and submitting are only
                                            available for the current reporting
                                            week.
                                        </p>
                                    ) : null}
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className="flex items-center gap-1.5">
                                        <AddProjectDialog
                                            availableProjects={
                                                availableProjects
                                            }
                                            canAddProject={
                                                reportingPeriod.isCurrentWeek
                                            }
                                            reportingWeekStartDate={
                                                selectedWeekStartDate
                                            }
                                        />
                                        <TooltipHint content="Add another project to the current week so you can begin recording LoE against it." />
                                    </div>
                                    <div className="flex items-center gap-1.5">
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
                                            Save Changes
                                        </button>
                                        <TooltipHint content="Save your current edits as a draft in the backend without submitting the weekly pulse yet." />
                                    </div>
                                    <SubmitWeeklyPulseDialog
                                        allocationRows={allocationRows}
                                        canSubmit={
                                            reportingPeriod.isCurrentWeek &&
                                            weeklyPulse.id !== null &&
                                            weeklyPulse.status !== 'submitted'
                                        }
                                        editableAllocations={
                                            editableAllocations
                                        }
                                        hasUnsavedChanges={isDirty}
                                        reportingWeekStartDate={
                                            selectedWeekStartDate
                                        }
                                        weeklyPulse={weeklyPulse}
                                    />
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/90 text-xs tracking-[0.22em] text-slate-500 uppercase">
                                            <th className="px-6 py-4 font-semibold">
                                                <div className="flex items-center gap-1.5">
                                                    <span>
                                                        Project &amp; stream
                                                    </span>
                                                    <TooltipHint content="Each row is a project that already has LoE recorded in the selected month. The highlighted column is the currently selected week." />
                                                </div>
                                            </th>
                                            {reportingWeeks.map((week, weekIndex) => {
                                                const isSelected = isSameDay(
                                                    week.start,
                                                    selectedWeekStart,
                                                );
                                                const isoWeekNumber = getISOWeek(
                                                    week.start,
                                                );

                                                return (
                                                    <th
                                                        key={week.start.toISOString()}
                                                        className={`px-4 py-4 text-center align-top font-semibold ${isSelected
                                                            ? 'border-x border-slate-200 bg-blue-50 text-blue-700'
                                                            : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-center gap-1.5">
                                                            <span className="font-semibold text-teal-600">
                                                                Week {isoWeekNumber}
                                                            </span>
                                                            {weekIndex === 0 ? (
                                                                <TooltipHint content={`Shows saved LoE for ${format(
                                                                    week.start,
                                                                    'MMM d',
                                                                )} to ${format(
                                                                    week.end,
                                                                    'MMM d',
                                                                )}. Week labels use the ISO week number of the year. Click a date in the reporting period picker to focus a different week.`} />
                                                            ) : null}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allocationRows.length > 0 ? (
                                            allocationRows.map((row, rowIndex) => (
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
                                                            const isSelected =
                                                                isSameDay(
                                                                    week.start,
                                                                    selectedWeekStart,
                                                                );
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
                                                                row.weekValues[
                                                                weekIndex
                                                                ] ?? null;

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
                                                                        <div className="mt-2 flex items-center justify-center gap-1.5">
                                                                            <span className="text-[0.68rem] font-medium text-slate-400">
                                                                                Edit this week
                                                                            </span>
                                                                            {rowIndex === 0 ? (
                                                                                <TooltipHint content="Use the minus and plus buttons to adjust in 5% steps, or type directly into the field. Save changes to store the draft in the backend." />
                                                                            ) : null}
                                                                        </div>
                                                                    </td>
                                                                );
                                                            }

                                                            return (
                                                                <td
                                                                    key={`${row.projectId}-${week.start.toISOString()}`}
                                                                    className={`px-4 py-5 text-center text-sm font-medium ${value ===
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
                                                <div className="flex items-center gap-1.5">
                                                    <span>Total allocation</span>
                                                    <TooltipHint content="This footer sums all project allocations for each displayed week. The highlighted total includes any unsaved edits in the active week column." />
                                                </div>
                                            </td>
                                            {reportingWeeks.map(
                                                (week, weekIndex) => {
                                                    const isSelected =
                                                        isSameDay(
                                                            week.start,
                                                            selectedWeekStart,
                                                        );
                                                    const total = isSelected
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

                                                    return (
                                                        <td
                                                            key={`total-${week.start.toISOString()}`}
                                                            className={`px-4 py-4 text-center text-sm ${isSelected
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
                                        <tr className="border-t border-slate-200 bg-white">
                                            <td className="px-6 py-4 align-top font-medium text-slate-500">
                                                Weekly summary
                                            </td>
                                            {reportingWeeks.map((week) => {
                                                const weekStartDate = format(
                                                    week.start,
                                                    'yyyy-MM-dd',
                                                );
                                                const hasWeeklySummary = Boolean(
                                                    week.weeklySummary,
                                                );
                                                const isSummaryExpanded = Boolean(
                                                    expandedWeekSummaries[
                                                    weekStartDate
                                                    ],
                                                );
                                                const weeklySummaryPreview =
                                                    week.weeklySummary
                                                        ? previewWeeklySummary(
                                                            week.weeklySummary,
                                                        )
                                                        : null;

                                                return (
                                                    <td
                                                        key={`summary-${week.start.toISOString()}`}
                                                        className="px-4 py-4 align-top text-center"
                                                    >
                                                        {hasWeeklySummary ? (
                                                            <div className="mx-auto w-full flex max-w-[12rem] flex-col items-center space-y-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleWeekSummary(
                                                                            weekStartDate,
                                                                        )
                                                                    }
                                                                    className="inline text-[0.8rem] leading-5 font-medium normal-case text-slate-500 transition hover:text-slate-700"
                                                                >
                                                                    {isSummaryExpanded &&
                                                                        week.weeklySummary
                                                                        ? week.weeklySummary
                                                                        : weeklySummaryPreview}
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleWeekSummary(
                                                                            weekStartDate,
                                                                        )
                                                                    }
                                                                    className="text-[0.62rem] font-semibold tracking-normal normal-case text-teal-600 transition hover:text-teal-700"
                                                                >
                                                                    {isSummaryExpanded
                                                                        ? 'Show less'
                                                                        : 'Show more'}
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-slate-300">
                                                                -
                                                            </span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </article>


                    </section>
                </div>
            </div>
        </>
    );
}
