import { Head, Link } from '@inertiajs/react';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as loeSubmissionsIndex } from '@/routes/admin/loe-submissions';

type Submission = {
    id: number;
    items: {
        allocationPercent: number;
        id: number;
        project: string | null;
        stream: string | null;
    }[];
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
    submission: Submission;
};

export default function AdminLoeSubmissionsShow({ submission }: Props) {
    return (
        <>
            <Head title="LoE Submission" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                                LoE submission
                            </h1>
                            <p className="mt-1 text-sm leading-6 text-slate-500 md:text-base">
                                {submission.user.name} · {submission.weekStartDate} to {submission.weekEndDate}
                            </p>
                        </div>
                        <Link
                            href={loeSubmissionsIndex()}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Back to submissions
                        </Link>
                    </section>

                    <section className="grid gap-3 md:grid-cols-3">
                        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm font-semibold text-slate-500">
                                Status
                            </p>
                            <p className="mt-2 text-2xl font-semibold capitalize text-slate-950">
                                {submission.status}
                            </p>
                        </article>
                        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm font-semibold text-slate-500">
                                Total LoE
                            </p>
                            <p className="mt-2 text-2xl font-semibold text-slate-950">
                                {submission.totalAllocationPercent}%
                            </p>
                        </article>
                        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <p className="text-sm font-semibold text-slate-500">
                                Submitted
                            </p>
                            <p className="mt-2 text-base font-semibold text-slate-950">
                                {submission.submittedAt ?? 'Not submitted'}
                            </p>
                        </article>
                    </section>

                    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h2 className="text-lg font-semibold text-slate-950">
                            Weekly summary
                        </h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            {submission.weeklySummary ?? 'No summary was submitted for this week.'}
                        </p>
                    </article>

                    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-lg font-semibold text-slate-950">
                                Project breakdown
                            </h2>
                        </div>
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                    <th className="px-5 py-4">Project</th>
                                    <th className="px-5 py-4">Stream</th>
                                    <th className="px-5 py-4 text-right">Allocation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {submission.items.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-5 py-4 font-semibold text-slate-950">
                                            {item.project ?? 'Deleted project'}
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-500">
                                            {item.stream ?? '-'}
                                        </td>
                                        <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                                            {item.allocationPercent}%
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </article>
                </div>
            </div>
        </>
    );
}

AdminLoeSubmissionsShow.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'LoE submissions', href: loeSubmissionsIndex() },
        { title: 'Submission', href: '#' },
    ],
};
