import { Head, Link } from '@inertiajs/react';
import { ClipboardList, FolderKanban, Percent, Users } from 'lucide-react';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as allocationsIndex } from '@/routes/admin/allocations';
import { index as loeSubmissionsIndex } from '@/routes/admin/loe-submissions';
import { index as projectsIndex } from '@/routes/admin/projects';

type Props = {
    summary: {
        activeProjectsCount: number;
        currentMonthAllocationsCount: number;
        submittedPulsesCount: number;
        usersCount: number;
    };
};

const adminCards = [
    {
        title: 'Projects',
        description: 'Create and maintain the project catalog used across allocations and LoE tracking.',
        href: projectsIndex(),
        icon: FolderKanban,
    },
    {
        title: 'Monthly allocations',
        description: 'Assign project percentages to every member for the selected month.',
        href: allocationsIndex(),
        icon: Percent,
    },
    {
        title: 'LoE submissions',
        description: 'Review weekly submitted LoE, summaries, and project-level allocation breakdowns.',
        href: loeSubmissionsIndex(),
        icon: ClipboardList,
    },
];

export default function AdminDashboardIndex({ summary }: Props) {
    return (
        <>
            <Head title="Admin" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="space-y-2">
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                            Admin
                        </h1>
                        <p className="max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                            Manage the project catalog, monthly allocation snapshots, and submitted weekly LoE records.
                        </p>
                    </section>

                    <section className="grid gap-3 md:grid-cols-4">
                        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <Users className="mb-4 size-5 text-slate-500" />
                            <p className="text-3xl font-semibold text-slate-950">
                                {summary.usersCount}
                            </p>
                            <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Members
                            </p>
                        </article>
                        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <FolderKanban className="mb-4 size-5 text-slate-500" />
                            <p className="text-3xl font-semibold text-slate-950">
                                {summary.activeProjectsCount}
                            </p>
                            <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Active projects
                            </p>
                        </article>
                        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <Percent className="mb-4 size-5 text-slate-500" />
                            <p className="text-3xl font-semibold text-slate-950">
                                {summary.currentMonthAllocationsCount}
                            </p>
                            <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Current allocations
                            </p>
                        </article>
                        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <ClipboardList className="mb-4 size-5 text-slate-500" />
                            <p className="text-3xl font-semibold text-slate-950">
                                {summary.submittedPulsesCount}
                            </p>
                            <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Submitted pulses
                            </p>
                        </article>
                    </section>

                    <section className="grid gap-3 lg:grid-cols-3">
                        {adminCards.map((card) => (
                            <Link
                                key={card.title}
                                href={card.href}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                <card.icon className="mb-5 size-5 text-emerald-700" />
                                <h2 className="text-lg font-semibold text-slate-950">
                                    {card.title}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {card.description}
                                </p>
                            </Link>
                        ))}
                    </section>
                </div>
            </div>
        </>
    );
}

AdminDashboardIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: adminDashboard(),
        },
    ],
};
