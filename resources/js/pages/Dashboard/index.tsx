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
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4 px-4 py-4 md:px-5 md:py-4 lg:px-8">
                    {shouldShowSubmissionReminder ? (
                        <section>
                            <div className="flex w-full items-center gap-2.5 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-red-50 px-3 py-2 sm:gap-3 sm:px-4 sm:py-2.5">
                                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 sm:size-9 sm:rounded-xl">
                                    <AlertTriangle className="size-4 sm:size-[1.125rem]" />
                                </div>
                                <div className="min-w-0 space-y-0.5">
                                    <p className="text-sm font-semibold text-slate-900 sm:text-[0.9375rem]">
                                        Your weekly pulse is still waiting for
                                        submission.
                                    </p>
                                    <p className="max-w-4xl text-xs leading-snug text-slate-600 sm:text-sm sm:leading-relaxed">
                                        The Thursday 5:00 PM deadline has
                                        passed, and this week&apos;s pulse is
                                        still in draft. Review your entries and
                                        submit it as soon as possible.
                                    </p>
                                </div>
                            </div>
                        </section>
                    ) : null}

                    <section className="space-y-2">
                        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-stretch lg:gap-4 xl:gap-5">
                            <div className="shrink-0 space-y-0.5 lg:max-w-[18rem] lg:pt-0.5 xl:max-w-xs">
                                <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                    Welcome back, {userName}
                                </h1>
                                <p className="text-xs leading-snug text-slate-500 sm:text-sm">
                                    Review and update your Level of Effort for
                                    the current reporting week.
                                </p>
                            </div>

                            <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 md:grid-cols-2 md:items-stretch xl:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
                            <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-2.5 sm:p-3">
                                <div className="mb-2 flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                                                Monthly Allocation Progress
                                            </h2>
                                            <TooltipHint content="This shows the saved allocation total for the currently selected week and helps you spot whether your LoE is on track for the month." />
                                        </div>
                                        <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                            Target: 160 Hours / 100%
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-1">
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-700 sm:text-xs">
                                            On Track
                                        </span>
                                        <TooltipHint content="A quick health signal for the currently selected week based on the saved LoE total shown below." />
                                    </div>
                                </div>

                                <div className="mt-auto space-y-1">
                                    <div className="flex items-center justify-between text-[0.65rem] font-semibold tracking-[0.12em] text-slate-800 uppercase sm:text-xs sm:tracking-[0.16em]">
                                        <span>Current Status</span>
                                        <div className="flex items-center gap-1">
                                            <span className="text-emerald-700">
                                                {currentWeekTotalPercent}%
                                                Complete
                                            </span>
                                            <TooltipHint content="This number reflects the saved total allocation for the selected week in the database, not unsaved edits." />
                                        </div>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
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

                            <article className="flex h-full min-h-0 items-stretch rounded-xl border border-slate-200 bg-white p-2 shadow-sm sm:p-2.5">
                                <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-2.5">
                                    <div className="flex size-6 shrink-0 items-center justify-center self-center rounded-md bg-slate-100 text-slate-700 sm:size-7 sm:rounded-lg">
                                        <FolderKanban className="size-3.5" />
                                    </div>
                                    <div className="flex min-w-0 flex-1 items-center justify-between gap-1.5">
                                        <p className="inline-flex min-w-0 items-baseline gap-2 sm:gap-2.5">
                                            <span className="text-2xl font-semibold leading-none tracking-tight text-slate-900 tabular-nums sm:text-3xl">
                                                {summary.activeProjectsCount}
                                            </span>
                                            <span className="whitespace-nowrap text-[0.64rem] font-semibold tracking-[0.12em] text-slate-500 uppercase sm:text-[0.65rem] sm:tracking-[0.14em]">
                                                Active projects
                                            </span>
                                        </p>
                                        <div className="shrink-0 self-center">
                                            <TooltipHint content="Only projects that have LoE recorded in the selected month appear in the tracker below." />
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <div className="md:col-span-2 xl:col-span-1">
                                <SubmissionDeadlineSection
                                    deadlineAt={submissionDeadline.at}
                                    isOverdue={submissionDeadline.isOverdue}
                                />
                            </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-3">
                        <article className="overflow-hidden rounded-2xl border border-slate-200/80 border-t-[3px] border-t-teal-500/50 bg-gradient-to-b from-slate-50/60 to-white shadow-sm">
                            <div className="space-y-3 border-b border-slate-200/80 px-4 py-3.5 sm:px-5">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <h2 className="text-lg font-semibold tracking-tight text-slate-950 sm:text-xl">
                                                    Weekly LoE Tracker
                                                </h2>
                                                <TooltipHint content="Use the calendar above the table to change which week you are viewing. The highlighted column matches the selected reporting week. Changing the week reloads data from the server." />
                                            </div>
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pulseStatusClasses}`}
                                            >
                                                {pulseStatusLabel}
                                            </span>
                                            {isDirty ? (
                                                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                                                    Unsaved changes
                                                </span>
                                            ) : null}
                                        </div>
                                        <p className="text-sm text-slate-500">
                                            Adjust and record your level of
                                            effort per project for the week
                                            shown below.
                                        </p>
                                        {!reportingPeriod.isCurrentWeek ? (
                                            <p className="text-xs font-medium text-amber-700">
                                                Saving and submitting are only
                                                available for the current
                                                reporting week.
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="flex w-full min-w-0 flex-col gap-1 sm:max-w-[17rem] lg:shrink-0 lg:items-end">
                                        <span className="text-[0.65rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                            Select reporting week
                                        </span>
                                        <ReportingPeriodPicker
                                            defaultMonth={parseISO(
                                                reportingPeriod.monthStartDate,
                                            )}
                                            reportingPeriod={selectedReportingRange}
                                            onSelect={handleReportingPeriodSelect}
                                            size="compact"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2.5 border-t border-slate-200/60 pt-3">
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
                                <table className="min-w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/90 text-[0.65rem] tracking-[0.16em] text-slate-500 uppercase">
                                            <th className="px-3 py-2 font-semibold sm:px-4">
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
                                                        className={`px-2 py-2 text-center align-top font-semibold sm:px-3 ${isSelected
                                                            ? 'border-x border-slate-200 bg-blue-50 text-blue-700'
                                                            : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center justify-center gap-1">
                                                            <span className="font-semibold text-teal-600">
                                                                W{isoWeekNumber}
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
                                                    <td className="px-3 py-2 sm:px-4">
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[0.8125rem] font-semibold leading-tight text-slate-950">
                                                                {row.project}
                                                            </span>
                                                            <span className="text-xs leading-snug text-slate-500">
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
                                                                        className="border-x border-slate-200 bg-slate-50/70 px-2 py-2 sm:px-3"
                                                                    >
                                                                        <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                                            <button
                                                                                type="button"
                                                                                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
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
                                                                                <span className="text-base leading-none">
                                                                                    -
                                                                                </span>
                                                                            </button>
                                                                            <div className="relative w-[4.25rem] shrink-0">
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
                                                                                    className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 pr-6 text-center text-sm font-semibold text-emerald-900 transition outline-none [-moz-appearance:textfield] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                                                    aria-label={`${row.project} allocation percentage`}
                                                                                />
                                                                                <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                                                                    %
                                                                                </span>
                                                                            </div>
                                                                            <button
                                                                                type="button"
                                                                                className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
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
                                                                                <Plus className="size-3.5" />
                                                                            </button>
                                                                        </div>
                                                                        {rowIndex ===
                                                                        0 ? (
                                                                            <div className="mt-1.5 flex items-center justify-center gap-1">
                                                                                <span className="text-[0.62rem] font-medium text-slate-400">
                                                                                    Editable
                                                                                    week
                                                                                </span>
                                                                                <TooltipHint content="Use the minus and plus buttons to adjust in 5% steps, or type directly into the field. Save changes to store the draft in the backend." />
                                                                            </div>
                                                                        ) : null}
                                                                    </td>
                                                                );
                                                            }

                                                            return (
                                                                <td
                                                                    key={`${row.projectId}-${week.start.toISOString()}`}
                                                                    className={`px-2 py-2 text-center text-xs font-medium sm:px-3 sm:text-sm ${value ===
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
                                                    className="px-4 py-8 text-center text-sm text-slate-500"
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
                                            <td className="px-3 py-2 font-semibold text-slate-950 sm:px-4">
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
                                                            className={`px-2 py-2 text-center text-xs font-medium sm:px-3 sm:text-sm ${isSelected
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
                                            <td className="px-3 py-2 align-top text-xs font-medium text-slate-500 sm:px-4 sm:text-sm">
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
                                                        className="px-2 py-2 align-top text-center sm:px-3"
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
