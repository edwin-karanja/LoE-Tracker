import { Head, usePage } from '@inertiajs/react';
import {
    addDays,
    eachWeekOfInterval,
    endOfMonth,
    format,
    isSameDay,
    startOfMonth,
    startOfWeek,
} from 'date-fns';
import {
    ArrowRight,
    CalendarDays,
    Clock3,
    Copy,
    FolderKanban,
    Info,
    Plus,
    Send,
} from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

type AllocationRow = {
    project: string;
    stream: string;
    weekValues: Array<number | null>;
};

const allocationRows: AllocationRow[] = [
    {
        project: 'ERM: Assess',
        stream: 'Risk Management Framework',
        weekValues: [40, 35, 35, 30, 25],
    },
    {
        project: 'PixelEdge: Platform',
        stream: 'UI Component Library Migration',
        weekValues: [25, 25, 30, 35, 30],
    },
    {
        project: 'Internal: Upskilling',
        stream: 'Generative AI Coursework',
        weekValues: [15, 20, 20, 20, 25],
    },
    {
        project: 'General Administration',
        stream: 'Email, Meetings & Planning',
        weekValues: [20, 20, 15, 15, 20],
    },
];

const availableProjects = [
    'Core Banking Migration',
    'Digital Risk Analytics',
    'Customer Experience Revamp',
    'Internal AI Enablement',
    'Operations Excellence',
];

export default function DashboardShowcase() {
    const { auth } = usePage().props;
    const userName = auth.user?.name?.split(' ')[0] ?? 'there';
    const today = new Date();
    const getWorkWeekRange = (date: Date): DateRange => {
        const monday = startOfWeek(date, { weekStartsOn: 1 });

        return {
            from: monday,
            to: addDays(monday, 6),
        };
    };
    const [reportingPeriod, setReportingPeriod] = useState<
        DateRange | undefined
    >(getWorkWeekRange(today));
    const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const reportingPeriodLabel =
        reportingPeriod?.from && reportingPeriod?.to
            ? `${format(reportingPeriod.from, 'MMM d')} - ${format(
                  reportingPeriod.to,
                  'MMM d',
              )}`
            : 'Select dates';

    const handleReportingPeriodSelect = (date: Date | undefined) => {
        if (!date) {
            return;
        }

        setReportingPeriod(getWorkWeekRange(date));
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
        reportingPeriod?.from ? isSameDay(week.start, reportingPeriod.from) : false,
    );
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

    return (
        <>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="space-y-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-[3.15rem]">
                                    Welcome back, {userName}
                                </h1>
                                <p className="text-base text-slate-500 md:text-lg">
                                    Review and update your Level of Effort for
                                    October Week 3.
                                </p>
                            </div>

                            <Popover>
                                <PopoverTrigger asChild>
                                    <button
                                        type="button"
                                        className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50"
                                    >
                                        <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                                            <CalendarDays className="size-4.5" />
                                        </div>
                                        <div className="text-sm font-semibold tracking-[0.14em] text-slate-700 uppercase">
                                            Reporting period:{' '}
                                            {reportingPeriodLabel}
                                        </div>
                                    </button>
                                </PopoverTrigger>
                                <PopoverContent
                                    align="end"
                                    className="w-auto rounded-2xl border-slate-200 bg-white p-0"
                                >
                                    <Calendar
                                        mode="single"
                                        defaultMonth={today}
                                        selected={reportingPeriod?.from}
                                        onSelect={handleReportingPeriodSelect}
                                        numberOfMonths={1}
                                        weekStartsOn={1}
                                        modifiers={{
                                            range_start: reportingPeriod?.from,
                                            range_end: reportingPeriod?.to,
                                            range_middle:
                                                reportingPeriod?.from &&
                                                reportingPeriod?.to
                                                    ? {
                                                          after: reportingPeriod.from,
                                                          before: reportingPeriod.to,
                                                      }
                                                    : undefined,
                                            selected:
                                                reportingPeriod?.from &&
                                                reportingPeriod?.to
                                                    ? {
                                                          from: reportingPeriod.from,
                                                          to: reportingPeriod.to,
                                                      }
                                                    : undefined,
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(14rem,0.78fr)_minmax(14rem,0.78fr)]">
                            <article className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                                            Monthly Allocation Progress
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-500 md:text-base">
                                            Target: 160 Hours / 100%
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 md:text-sm">
                                        On Track
                                    </span>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-xs font-semibold tracking-[0.16em] text-slate-800 uppercase md:text-sm">
                                        <span>Current Status</span>
                                        <span className="text-emerald-700">
                                            72% Complete
                                        </span>
                                    </div>
                                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
                                        <div className="h-full w-[72%] rounded-full bg-emerald-700" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-1.5">
                                        <div className="h-1.5 rounded-full bg-emerald-700" />
                                        <div className="h-1.5 rounded-full bg-emerald-700" />
                                        <div className="h-1.5 rounded-full bg-emerald-300" />
                                        <div className="h-1.5 rounded-full bg-slate-200" />
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-[1.2rem] border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-6 flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                                    <FolderKanban className="size-4.5" />
                                </div>
                                <p className="text-4xl font-semibold tracking-tight text-slate-900">
                                    04
                                </p>
                                <p className="mt-1.5 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase md:text-sm">
                                    Active Projects
                                </p>
                            </article>

                            <article className="rounded-[1.2rem] border border-slate-900 bg-slate-900 p-4 text-white shadow-sm">
                                <div className="mb-6 flex items-start justify-between gap-4">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-amber-400/10 text-amber-300">
                                        <Clock3 className="size-4.5" />
                                    </div>
                                    <span className="rounded-md bg-red-600 px-2 py-1 text-[0.65rem] font-bold tracking-[0.16em] text-white uppercase">
                                        Urgent
                                    </span>
                                </div>
                                <p className="text-3xl font-semibold tracking-tight md:text-[2.1rem]">
                                    24h Left
                                </p>
                                <p className="mt-1.5 text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase md:text-sm">
                                    Submission Deadline
                                </p>
                            </article>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <article className="overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-white shadow-sm">
                            <div className="flex flex-col gap-4 border-b border-slate-200/80 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                                        Weekly pulse tracking
                                    </h2>
                                    <p className="text-sm text-slate-500">
                                        Adjust your allocation per project for
                                        the current week before submission.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Dialog
                                        open={isNewProjectDialogOpen}
                                        onOpenChange={setIsNewProjectDialogOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                            >
                                                <Plus className="size-4" />
                                                New project
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="rounded-2xl border-slate-200 p-0 sm:max-w-md">
                                            <DialogHeader className="border-b border-slate-200 px-6 py-5">
                                                <DialogTitle>
                                                    Add project to weekly pulse
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Select a project from the
                                                    available list. We&apos;ll
                                                    wire the actual add behavior
                                                    next.
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-3 px-6 py-5">
                                                <label
                                                    htmlFor="project-select"
                                                    className="text-sm font-medium text-slate-700"
                                                >
                                                    Project
                                                </label>
                                                <Select
                                                    value={selectedProject}
                                                    onValueChange={
                                                        setSelectedProject
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="project-select"
                                                        className="w-full rounded-xl border-slate-200 bg-white"
                                                    >
                                                        <SelectValue placeholder="Choose a project" />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-xl border-slate-200">
                                                        {availableProjects.map(
                                                            (project) => (
                                                                <SelectItem
                                                                    key={
                                                                        project
                                                                    }
                                                                    value={
                                                                        project
                                                                    }
                                                                >
                                                                    {project}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <DialogFooter className="border-t border-slate-200 px-6 py-4">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() =>
                                                        setIsNewProjectDialogOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="button"
                                                    disabled={!selectedProject}
                                                    onClick={() =>
                                                        setIsNewProjectDialogOpen(
                                                            false,
                                                        )
                                                    }
                                                >
                                                    Add project
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                                    >
                                        <Copy className="size-4" />
                                        No changes this week
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
                                    >
                                        <Send className="size-4" />
                                        Submit week&apos;s pulse
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50/90 text-xs tracking-[0.22em] text-slate-500 uppercase">
                                            <th className="px-6 py-4 font-semibold">
                                                Project &amp; stream
                                            </th>
                                            {reportingWeeks.map((week, weekIndex) => {
                                                const isSelected =
                                                    weekIndex === selectedWeekIndex;

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
                                            })}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {allocationRows.map((row) => (
                                            <tr
                                                key={row.project}
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
                                                        const value =
                                                            weekIndex >
                                                            selectedWeekIndex
                                                                ? 0
                                                                : (row
                                                                      .weekValues[
                                                                      weekIndex
                                                                  ] ?? null);
                                                        const isSelected =
                                                            weekIndex ===
                                                            selectedWeekIndex;

                                                        if (isSelected) {
                                                            return (
                                                                <td
                                                                    key={`${row.project}-${week.start.toISOString()}`}
                                                                    className="border-x border-slate-200 bg-slate-50/70 px-4 py-5"
                                                                >
                                                                    <div className="flex items-center justify-center gap-3">
                                                                        <button
                                                                            type="button"
                                                                            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                                                                            aria-label={`Decrease ${row.project} allocation`}
                                                                        >
                                                                            <span className="text-lg leading-none">
                                                                                -
                                                                            </span>
                                                                        </button>
                                                                        <span className="w-14 text-center text-xl font-semibold text-emerald-900">
                                                                            {value ?? 0}
                                                                            %
                                                                        </span>
                                                                        <button
                                                                            type="button"
                                                                            className="flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50"
                                                                            aria-label={`Increase ${row.project} allocation`}
                                                                        >
                                                                            <Plus className="size-4" />
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            );
                                                        }

                                                        return (
                                                            <td
                                                                key={`${row.project}-${week.start.toISOString()}`}
                                                                className={`px-4 py-5 text-center text-sm font-medium ${
                                                                    value ===
                                                                    null
                                                                        ? 'text-slate-300'
                                                                        : 'text-slate-400'
                                                                }`}
                                                            >
                                                                {value === null
                                                                    ? '-'
                                                                    : `${value}%`}
                                                            </td>
                                                        );
                                                    },
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-slate-200 bg-slate-50/90">
                                            <td className="px-6 py-4 font-semibold text-slate-950">
                                                Total allocation
                                            </td>
                                            {reportingWeeks.map(
                                                (week, weekIndex) => {
                                                    const total =
                                                        totalAllocationByWeek[
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

                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,0.95fr)]">
                            <article className="rounded-[1.8rem] border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-emerald-50 p-6 shadow-sm">
                                <div className="flex items-start gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                                        <Info className="size-5" />
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                                                Submission instructions
                                            </h3>
                                            <p className="mt-1 text-sm leading-6 text-slate-600">
                                                Ensure your total allocation
                                                adds up to exactly 100% across
                                                all active projects. If nothing
                                                changed from last week, use the
                                                quick-copy action before
                                                submitting.
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-slate-700">
                                            Weekly pulses are due every Friday
                                            by 5:00 PM.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            <button
                                type="button"
                                className="group flex w-full items-center justify-between rounded-[1.8rem] border border-dashed border-slate-300 bg-white px-6 py-5 text-left shadow-sm transition hover:border-blue-300 hover:bg-blue-50/50"
                            >
                                <div className="space-y-1">
                                    <p className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase transition group-hover:text-blue-700">
                                        Request new project stream
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Add a new allocation target for a future
                                        reporting cycle.
                                    </p>
                                </div>
                                <div className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 transition group-hover:bg-blue-600 group-hover:text-white">
                                    <ArrowRight className="size-5" />
                                </div>
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
}
