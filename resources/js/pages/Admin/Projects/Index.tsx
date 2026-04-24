import { Head, Link, router } from '@inertiajs/react';
import { Archive, Edit3, Plus } from 'lucide-react';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    create as createProject,
    destroy as destroyProject,
    edit as editProject,
    index as projectsIndex,
} from '@/routes/admin/projects';

type Project = {
    code: string | null;
    description: string | null;
    id: number;
    isActive: boolean;
    name: string;
    stream: string;
};

type Props = {
    projects: Project[];
};

export default function AdminProjectsIndex({ projects }: Props) {
    const archiveProject = (project: Project) => {
        router.delete(destroyProject(project.id).url, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Admin Projects" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                                Projects
                            </h1>
                            <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                                Manage the project catalog used in allocations and weekly LoE tracking.
                            </p>
                        </div>
                        <Link
                            href={createProject()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
                        >
                            <Plus className="size-4" />
                            Add project
                        </Link>
                    </section>

                    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-5 py-4">Project</th>
                                        <th className="px-5 py-4">Code</th>
                                        <th className="px-5 py-4">Stream</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {projects.map((project) => (
                                        <tr key={project.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-950">
                                                    {project.name}
                                                </p>
                                                {project.description ? (
                                                    <p className="mt-1 line-clamp-1 text-sm text-slate-500">
                                                        {project.description}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {project.code ?? '-'}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {project.stream}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        project.isActive
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {project.isActive ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={editProject(project.id)}
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                        aria-label={`Edit ${project.name}`}
                                                    >
                                                        <Edit3 className="size-4" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => archiveProject(project)}
                                                        disabled={!project.isActive}
                                                        className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label={`Archive ${project.name}`}
                                                    >
                                                        <Archive className="size-4" />
                                                    </button>
                                                </div>
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

AdminProjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'Projects', href: projectsIndex() },
    ],
};
