import { Head, Link, router } from '@inertiajs/react';
import { Eye } from 'lucide-react';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    index as loeSubmissionsIndex,
    show as showSubmission,
} from '@/routes/admin/loe-submissions';

type FilterOption = {
    id: number;
    name: string;
};

type Submission = {
    id: number;
    projectsCount: number;
    status: string;
    submittedAt: string | null;
    totalAllocationPercent: number;
    user: {
        email: string | null;
        name: string | null;
    };
    weekEndDate: string;
    weekStartDate: string;
    weeklySummary: string | null;
};

type Props = {
    filters: {
        month: string;
        project: number | string;
        status: string;
        user: number | string;
    };
    projects: FilterOption[];
    submissions: Submission[];
    users: FilterOption[];
};

export default function AdminLoeSubmissionsIndex({
    filters,
    projects,
    submissions,
    users,
}: Props) {
    const updateFilter = (key: keyof Props['filters'], value: string) => {
        router.visit(
            loeSubmissionsIndex({
                query: {
                    ...filters,
                    [key]: value || undefined,
                },
            }),
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    return (
        <>
            <Head title="LoE Submissions" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                            LoE submissions
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                            Review weekly LoE submissions, summaries, and project-level allocation percentages.
                        </p>
                    </section>

                    <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-4">
                        <label className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Month
                            </span>
                            <input
                                type="month"
                                value={filters.month}
                                onChange={(event) =>
                                    updateFilter('month', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </label>
                        <label className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Status
                            </span>
                            <select
                                value={filters.status}
                                onChange={(event) =>
                                    updateFilter('status', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">All statuses</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                            </select>
                        </label>
                        <label className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Member
                            </span>
                            <select
                                value={filters.user}
                                onChange={(event) =>
                                    updateFilter('user', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">All members</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Project
                            </span>
                            <select
                                value={filters.project}
                                onChange={(event) =>
                                    updateFilter('project', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            >
                                <option value="">All projects</option>
                                {projects.map((project) => (
                                    <option key={project.id} value={project.id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </section>

                    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-5 py-4">Member</th>
                                        <th className="px-5 py-4">Week</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Total</th>
                                        <th className="px-5 py-4">Summary</th>
                                        <th className="px-5 py-4 text-right">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {submissions.map((submission) => (
                                        <tr key={submission.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-950">
                                                    {submission.user.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {submission.user.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {submission.weekStartDate} to {submission.weekEndDate}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        submission.status === 'submitted'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {submission.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                                {submission.totalAllocationPercent}%
                                            </td>
                                            <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                                                <span className="line-clamp-2">
                                                    {submission.weeklySummary ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={showSubmission(submission.id)}
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                    aria-label="View submission"
                                                >
                                                    <Eye className="size-4" />
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

AdminLoeSubmissionsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'LoE submissions', href: loeSubmissionsIndex() },
    ],
};
