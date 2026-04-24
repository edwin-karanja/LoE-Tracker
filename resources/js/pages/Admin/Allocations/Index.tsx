import { Head, router } from '@inertiajs/react';
import { Save } from 'lucide-react';
import { useState } from 'react';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    index as allocationsIndex,
    update as updateAllocations,
} from '@/routes/admin/allocations';

type User = {
    email: string;
    id: number;
    isAdmin: boolean;
    name: string;
};

type Project = {
    code: string | null;
    id: number;
    name: string;
    stream: string;
};

type Props = {
    allocationValues: Record<string, number>;
    month: {
        label: string;
        value: string;
    };
    projects: Project[];
    users: User[];
};

export default function AdminAllocationsIndex({
    allocationValues,
    month,
    projects,
    users,
}: Props) {
    const [values, setValues] = useState<Record<string, number>>(
        allocationValues,
    );
    const [isSaving, setIsSaving] = useState(false);

    const allocationKey = (userId: number, projectId: number) =>
        `${userId}:${projectId}`;

    const updateValue = (userId: number, projectId: number, value: string) => {
        const parsedValue = value === '' ? 0 : Number.parseInt(value, 10) || 0;

        setValues((current) => ({
            ...current,
            [allocationKey(userId, projectId)]: Math.max(
                0,
                Math.min(200, parsedValue),
            ),
        }));
    };

    const totalForUser = (userId: number) =>
        projects.reduce(
            (total, project) =>
                total + (values[allocationKey(userId, project.id)] ?? 0),
            0,
        );

    const changeMonth = (nextMonth: string) => {
        router.visit(allocationsIndex({ query: { month: nextMonth } }), {
            preserveScroll: true,
            preserveState: false,
        });
    };

    const saveAllocations = () => {
        setIsSaving(true);

        router.visit(updateAllocations(month.value), {
            data: {
                allocations: users.flatMap((user) =>
                    projects.map((project) => ({
                        allocation_percent:
                            values[allocationKey(user.id, project.id)] ?? 0,
                        project_id: project.id,
                        user_id: user.id,
                    })),
                ),
            },
            preserveScroll: true,
            preserveState: false,
            onFinish: () => setIsSaving(false),
        });
    };

    return (
        <>
            <Head title="Monthly Allocations" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                                Monthly allocations
                            </h1>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                Allocate active projects to every member for the selected month. Totals can be under or over 100%.
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
                            <button
                                type="button"
                                onClick={saveAllocations}
                                disabled={isSaving || projects.length === 0}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Save className="size-4" />
                                {isSaving ? 'Saving...' : 'Save allocations'}
                            </button>
                        </div>
                    </section>

                    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-5 py-4">
                            <h2 className="text-lg font-semibold text-slate-950">
                                {month.label}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Enter percentages per project. Empty cells are treated as 0%.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="sticky left-0 z-10 min-w-64 bg-slate-50 px-5 py-4">
                                            Member
                                        </th>
                                        {projects.map((project) => (
                                            <th
                                                key={project.id}
                                                className="min-w-44 px-4 py-4 text-center"
                                            >
                                                <span className="block text-slate-700 normal-case">
                                                    {project.name}
                                                </span>
                                                <span className="mt-1 block text-[0.65rem] tracking-normal text-slate-400 normal-case">
                                                    {project.code ?? project.stream}
                                                </span>
                                            </th>
                                        ))}
                                        <th className="min-w-32 px-4 py-4 text-center">
                                            Total
                                        </th>
                                        <th className="min-w-36 px-4 py-4 text-center">
                                            Availability
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {users.map((user) => {
                                        const total = totalForUser(user.id);

                                        return (
                                            <tr key={user.id}>
                                                <td className="sticky left-0 z-10 bg-white px-5 py-4">
                                                    <p className="font-semibold text-slate-950">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {user.email}
                                                    </p>
                                                    {user.isAdmin ? (
                                                        <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
                                                            Admin
                                                        </span>
                                                    ) : null}
                                                </td>
                                                {projects.map((project) => (
                                                    <td
                                                        key={project.id}
                                                        className="px-4 py-4 text-center"
                                                    >
                                                        <div className="relative mx-auto w-20">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="200"
                                                                value={
                                                                    values[
                                                                        allocationKey(
                                                                            user.id,
                                                                            project.id,
                                                                        )
                                                                    ] ?? 0
                                                                }
                                                                onChange={(event) =>
                                                                    updateValue(
                                                                        user.id,
                                                                        project.id,
                                                                        event.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 pr-6 text-center text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                                            />
                                                            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                                                %
                                                            </span>
                                                        </div>
                                                    </td>
                                                ))}
                                                <td className="px-4 py-4 text-center text-sm font-bold text-slate-900">
                                                    {total}%
                                                </td>
                                                <td className="px-4 py-4 text-center text-sm font-semibold text-slate-500">
                                                    {Math.max(0, 100 - total)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </article>
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
