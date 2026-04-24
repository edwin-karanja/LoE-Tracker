import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CalendarRange,
    ClipboardCheck,
    FileText,
    Gauge,
    Layers3,
    Percent,
    Users,
} from 'lucide-react';
import { ComparisonBar } from '@/pages/Admin/Reports/components/ComparisonBar';
import { ReportMetricCard } from '@/pages/Admin/Reports/components/ReportMetricCard';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as allocationsIndex } from '@/routes/admin/allocations';
import { index as loeSubmissionsIndex } from '@/routes/admin/loe-submissions';
import { index as reportsIndex } from '@/routes/admin/reports';

type Overview = {
    activeProjectsCount: number;
    averageSubmittedLoe: number;
    draftPulsesCount: number;
    membersCount: number;
    membersReportingCount: number;
    plannedAllocationTotal: number;
    submissionRate: number;
    submittedPulsesCount: number;
    totalSubmittedLoe: number;
};

type MemberReport = {
    assignedProjectsCount: number;
    averageSubmittedLoe: number;
    availabilityPercent: number;
    draftWeeksCount: number;
    email: string;
    id: number;
    lastSubmittedAt: string | null;
    month: string;
    name: string;
    plannedAllocationPercent: number;
    submittedWeeksCount: number;
    summariesCount: number;
    totalSubmittedLoe: number;
};

type ProjectLoadReport = {
    code: string | null;
    id: number;
    name: string;
    plannedAllocationPercent: number;
    plannedMembersCount: number;
    stream: string | null;
    submittedLoePercent: number;
    submittingMembersCount: number;
    variancePercent: number;
};

type RecentSummary = {
    id: number;
    memberName: string | null;
    submittedAt: string | null;
    summary: string | null;
    weekEndDate: string;
    weekStartDate: string;
};

type Props = {
    filters: {
        month: string;
    };
    memberReports: MemberReport[];
    month: {
        label: string;
        value: string;
    };
    overview: Overview;
    projectLoadReports: ProjectLoadReport[];
    recentSummaries: RecentSummary[];
};

const formatDate = (value: string | null) => {
    if (!value) {
        return '-';
    }

    return new Intl.DateTimeFormat('en', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(new Date(value.replace(' ', 'T')));
};

const signedPercent = (value: number) => {
    if (value > 0) {
        return `+${value}%`;
    }

    return `${value}%`;
};

export default function AdminReportsIndex({
    filters,
    memberReports,
    month,
    overview,
    projectLoadReports,
    recentSummaries,
}: Props) {
    const updateMonth = (value: string) => {
        router.visit(
            reportsIndex({
                query: {
                    month: value,
                },
            }),
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const maxProjectLoad = Math.max(
        100,
        ...projectLoadReports.map((report) =>
            Math.max(
                report.plannedAllocationPercent,
                report.submittedLoePercent,
            ),
        ),
    );

    return (
        <>
            <Head title="Admin Reports" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-xs font-semibold tracking-[0.22em] text-blue-700 uppercase">
                                Admin reporting
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                                Reports
                            </h1>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                Visual snapshots of allocations, submitted LoE, project load, and member activity for {month.label}.
                            </p>
                        </div>

                        <label className="w-full max-w-xs space-y-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Reporting month
                            </span>
                            <div className="relative">
                                <CalendarRange className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="month"
                                    value={filters.month}
                                    onChange={(event) =>
                                        updateMonth(event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />
                            </div>
                        </label>
                    </section>

                    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <ReportMetricCard
                            label="Submission rate"
                            value={`${overview.submissionRate}%`}
                            supportingText={`${overview.submittedPulsesCount} submitted, ${overview.draftPulsesCount} still in draft.`}
                            icon={ClipboardCheck}
                            accentClass="bg-emerald-50 text-emerald-700"
                        />
                        <ReportMetricCard
                            label="Avg submitted LoE"
                            value={`${overview.averageSubmittedLoe}%`}
                            supportingText={`${overview.totalSubmittedLoe}% total LoE submitted across the selected month.`}
                            icon={Gauge}
                            accentClass="bg-blue-50 text-blue-700"
                        />
                        <ReportMetricCard
                            label="Reporting members"
                            value={`${overview.membersReportingCount}/${overview.membersCount}`}
                            supportingText="Members with a weekly pulse in this reporting month."
                            icon={Users}
                            accentClass="bg-sky-50 text-sky-700"
                        />
                        <ReportMetricCard
                            label="Active projects"
                            value={overview.activeProjectsCount}
                            supportingText={`${overview.plannedAllocationTotal}% planned allocation across monthly records.`}
                            icon={Layers3}
                            accentClass="bg-slate-100 text-slate-700"
                        />
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
                        <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950">
                                        Project load
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Planned allocation compared with submitted LoE.
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-blue-500" />
                                        Planned
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="size-2 rounded-full bg-emerald-500" />
                                        Submitted
                                    </span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-200 bg-slate-50 text-[0.68rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                            <th className="px-4 py-3">Project</th>
                                            <th className="min-w-48 px-4 py-3">Load</th>
                                            <th className="px-4 py-3 text-right">Planned</th>
                                            <th className="px-4 py-3 text-right">Submitted</th>
                                            <th className="px-4 py-3 text-right">Variance</th>
                                            <th className="px-4 py-3 text-right">View</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {projectLoadReports.map((report) => (
                                            <tr
                                                key={report.id}
                                                className="text-sm"
                                            >
                                                <td className="px-4 py-3">
                                                    <p className="font-medium text-slate-950">
                                                        {report.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {report.code ?? report.stream ?? '-'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <ComparisonBar
                                                        maxValue={maxProjectLoad}
                                                        planned={
                                                            report.plannedAllocationPercent
                                                        }
                                                        submitted={
                                                            report.submittedLoePercent
                                                        }
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-blue-700">
                                                    {report.plannedAllocationPercent}%
                                                    <span className="block text-[0.68rem] font-normal text-slate-400">
                                                        {report.plannedMembersCount} members
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                                                    {report.submittedLoePercent}%
                                                    <span className="block text-[0.68rem] font-normal text-slate-400">
                                                        {report.submittingMembersCount} members
                                                    </span>
                                                </td>
                                                <td
                                                    className={`px-4 py-3 text-right font-semibold ${
                                                        report.variancePercent > 0
                                                            ? 'text-amber-700'
                                                            : report.variancePercent < 0
                                                              ? 'text-sky-700'
                                                              : 'text-slate-600'
                                                    }`}
                                                >
                                                    {signedPercent(
                                                        report.variancePercent,
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <Link
                                                        href={loeSubmissionsIndex({
                                                            query: {
                                                                month: filters.month,
                                                                project: report.id,
                                                            },
                                                        })}
                                                        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                        aria-label={`View LoE submissions for ${report.name}`}
                                                    >
                                                        <ArrowRight className="size-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        {projectLoadReports.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-4 py-8 text-center text-sm text-slate-500"
                                                >
                                                    No project allocation or submitted LoE data for this month.
                                                </td>
                                            </tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </article>

                        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950">
                                        Recent weekly summaries
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        Latest submitted narrative updates.
                                    </p>
                                </div>
                                <FileText className="size-5 text-slate-400" />
                            </div>

                            <div className="mt-4 space-y-3">
                                {recentSummaries.map((summary) => (
                                    <article
                                        key={summary.id}
                                        className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <p className="truncate text-sm font-medium text-slate-900">
                                                {summary.memberName}
                                            </p>
                                            <span className="shrink-0 text-[0.68rem] text-slate-400">
                                                {formatDate(summary.submittedAt)}
                                            </span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                            {summary.summary}
                                        </p>
                                    </article>
                                ))}
                                {recentSummaries.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                                        No weekly summaries have been submitted for this month.
                                    </div>
                                ) : null}
                            </div>
                        </article>
                    </section>

                    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-slate-950">
                                    Member reporting
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Individual allocation and submitted LoE activity for {month.label}.
                                </p>
                            </div>
                            <Link
                                href={allocationsIndex({
                                    query: { month: filters.month },
                                })}
                                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                <Percent className="size-4" />
                                Manage allocations
                            </Link>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-[0.68rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-4 py-3">Member</th>
                                        <th className="px-4 py-3 text-right">Planned</th>
                                        <th className="px-4 py-3 text-right">Availability</th>
                                        <th className="px-4 py-3 text-right">Submitted weeks</th>
                                        <th className="px-4 py-3 text-right">Avg LoE</th>
                                        <th className="px-4 py-3 text-right">Summaries</th>
                                        <th className="px-4 py-3 text-right">Last submitted</th>
                                        <th className="px-4 py-3 text-right">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {memberReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            className="text-sm transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-950">
                                                    {report.name}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {report.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-blue-700">
                                                {report.plannedAllocationPercent}%
                                                <span className="block text-[0.68rem] font-normal text-slate-400">
                                                    {report.assignedProjectsCount} projects
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-sky-700">
                                                {report.availabilityPercent}%
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-semibold text-emerald-700">
                                                    {report.submittedWeeksCount}
                                                </span>
                                                <span className="ml-1 text-slate-400">
                                                    / draft {report.draftWeeksCount}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-900">
                                                {report.averageSubmittedLoe}%
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {report.summariesCount}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-500">
                                                {formatDate(report.lastSubmittedAt)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    href={loeSubmissionsIndex({
                                                        query: {
                                                            month: filters.month,
                                                            user: report.id,
                                                        },
                                                    })}
                                                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                    aria-label={`View LoE submissions for ${report.name}`}
                                                >
                                                    <Activity className="size-4" />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
}

AdminReportsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'Reports', href: reportsIndex() },
    ],
};
