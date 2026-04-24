import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    ChartNoAxesCombined,
    ClipboardList,
    FolderKanban,
    Percent,
    Users,
} from 'lucide-react';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as allocationsIndex } from '@/routes/admin/allocations';
import { index as loeSubmissionsIndex } from '@/routes/admin/loe-submissions';
import { index as projectsIndex } from '@/routes/admin/projects';
import { index as reportsIndex } from '@/routes/admin/reports';

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
        accent: 'border-l-emerald-500 hover:border-emerald-200 hover:bg-emerald-50/40',
        iconTone: 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-100',
    },
    {
        title: 'Monthly allocations',
        description: 'Assign project percentages to every member for the selected month.',
        href: allocationsIndex(),
        icon: Percent,
        accent: 'border-l-blue-500 hover:border-blue-200 hover:bg-blue-50/40',
        iconTone: 'bg-blue-50 text-blue-700 group-hover:bg-blue-100',
    },
    {
        title: 'LoE submissions',
        description: 'Review weekly submitted LoE, summaries, and project-level allocation breakdowns.',
        href: loeSubmissionsIndex(),
        icon: ClipboardList,
        accent: 'border-l-sky-500 hover:border-sky-200 hover:bg-sky-50/40',
        iconTone: 'bg-sky-50 text-sky-700 group-hover:bg-sky-100',
    },
    {
        title: 'Reports',
        description: 'View allocation, project load, member activity, and submission trends in one place.',
        href: reportsIndex(),
        icon: ChartNoAxesCombined,
        accent: 'border-l-indigo-500 hover:border-indigo-200 hover:bg-indigo-50/40',
        iconTone: 'bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100',
    },
];

const statCards = [
    {
        label: 'Members',
        valueKey: 'usersCount',
        icon: Users,
        tone: 'bg-blue-50 text-blue-700 ring-blue-100',
    },
    {
        label: 'Active projects',
        valueKey: 'activeProjectsCount',
        icon: FolderKanban,
        tone: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    },
    {
        label: 'Current allocations',
        valueKey: 'currentMonthAllocationsCount',
        icon: Percent,
        tone: 'bg-sky-50 text-sky-700 ring-sky-100',
    },
    {
        label: 'Submitted Pulses',
        valueKey: 'submittedPulsesCount',
        icon: ClipboardList,
        tone: 'bg-slate-100 text-slate-700 ring-slate-200',
    },
] as const;

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

                    <section className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
                        {statCards.map((card) => (
                            <article
                                key={card.label}
                                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-3 shadow-sm"
                            >
                                <div
                                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ring-1 ${card.tone}`}
                                >
                                    <card.icon className="size-4.5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-2xl font-semibold leading-none text-slate-950">
                                        {summary[card.valueKey]}
                                    </p>
                                    <p className="mt-1 text-[0.68rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        {card.label}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="space-y-3 border-t border-slate-200 pt-5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
                                    Admin tools
                                </p>
                                <h2 className="mt-1 text-lg font-semibold text-slate-950">
                                    Manage the operational workflow
                                </h2>
                            </div>
                        </div>

                        <div className="grid gap-2.5 lg:grid-cols-2 xl:grid-cols-4">
                            {adminCards.map((card) => (
                                <Link
                                    key={card.title}
                                    href={card.href}
                                    className={`group flex items-start gap-3 rounded-lg border border-l-4 border-slate-200 bg-white px-4 py-3.5 shadow-sm transition ${card.accent}`}
                                >
                                    <div
                                        className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition ${card.iconTone}`}
                                    >
                                        <card.icon className="size-4.5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-slate-950">
                                            {card.title}
                                        </h3>
                                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                                            {card.description}
                                        </p>
                                    </div>
                                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-slate-700">
                                        <ArrowRight className="size-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
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
