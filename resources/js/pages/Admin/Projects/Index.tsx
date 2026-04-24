import { Head, router, useForm } from '@inertiajs/react';
import { Archive, Edit3, Plus } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Toggle } from '@/components/ui/toggle';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    destroy as destroyProject,
    index as projectsIndex,
    store as storeProject,
    update as updateProject,
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

type ProjectFormValues = {
    code: string;
    description: string;
    is_active: boolean;
    name: string;
    stream: string;
};

const blankProjectForm: ProjectFormValues = {
    code: '',
    description: '',
    is_active: true,
    name: '',
    stream: '',
};

export default function AdminProjectsIndex({ projects }: Props) {
    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const projectForm = useForm<ProjectFormValues>(blankProjectForm);

    const closeProjectDialog = () => {
        setIsProjectDialogOpen(false);
        setEditingProject(null);
        projectForm.clearErrors();
        projectForm.setData(blankProjectForm);
    };

    const openCreateProjectDialog = () => {
        setEditingProject(null);
        projectForm.clearErrors();
        projectForm.setData(blankProjectForm);
        setIsProjectDialogOpen(true);
    };

    const openEditProjectDialog = (project: Project) => {
        setEditingProject(project);
        projectForm.clearErrors();
        projectForm.setData({
            code: project.code ?? '',
            description: project.description ?? '',
            is_active: project.isActive,
            name: project.name,
            stream: project.stream,
        });
        setIsProjectDialogOpen(true);
    };

    const submitProject = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        projectForm.submit(
            editingProject
                ? updateProject(editingProject.id)
                : storeProject(),
            {
                preserveScroll: true,
                onSuccess: closeProjectDialog,
            },
        );
    };

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
                        <button
                            type="button"
                            onClick={openCreateProjectDialog}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-800"
                        >
                            <Plus className="size-4" />
                            Add project
                        </button>
                    </section>

                    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-[0.68rem] font-semibold tracking-[0.14em] text-slate-500 uppercase">
                                        <th className="px-4 py-2.5">Project</th>
                                        <th className="px-4 py-2.5">Code</th>
                                        <th className="px-4 py-2.5">Stream</th>
                                        <th className="px-4 py-2.5">Status</th>
                                        <th className="px-4 py-2.5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {projects.map((project) => (
                                        <tr
                                            key={project.id}
                                            className="text-sm transition hover:bg-slate-50/70"
                                        >
                                            <td className="px-4 py-3">
                                                <p className="font-semibold leading-5 text-slate-950">
                                                    {project.name}
                                                </p>
                                                {project.description ? (
                                                    <p className="mt-0.5 line-clamp-1 max-w-xl text-xs leading-5 text-slate-500">
                                                        {project.description}
                                                    </p>
                                                ) : null}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {project.code ?? '-'}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {project.stream}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[0.68rem] font-semibold ${
                                                        project.isActive
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {project.isActive ? 'Active' : 'Archived'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditProjectDialog(project)}
                                                        className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-white"
                                                        aria-label={`Edit ${project.name}`}
                                                    >
                                                        <Edit3 className="size-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => archiveProject(project)}
                                                        disabled={!project.isActive}
                                                        className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                                        aria-label={`Archive ${project.name}`}
                                                    >
                                                        <Archive className="size-3.5" />
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

            <Dialog
                open={isProjectDialogOpen}
                onOpenChange={(isOpen) => {
                    if (isOpen) {
                        setIsProjectDialogOpen(true);

                        return;
                    }

                    closeProjectDialog();
                }}
            >
                <DialogContent className="overflow-hidden border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
                        <DialogHeader>
                            <DialogTitle className="text-xl text-slate-950">
                                {editingProject ? 'Edit project' : 'Add project'}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                                {editingProject
                                    ? 'Update the project details used in allocations and LoE tracking.'
                                    : 'Create a project administrators can allocate to contributors.'}
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form onSubmit={submitProject} className="space-y-5 px-6 py-5">
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">
                                    Project name
                                </span>
                                <input
                                    value={projectForm.data.name}
                                    onChange={(event) =>
                                        projectForm.setData('name', event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                                {projectForm.errors.name ? (
                                    <p className="text-sm text-red-600">
                                        {projectForm.errors.name}
                                    </p>
                                ) : null}
                            </label>

                            <label className="space-y-2">
                                <span className="text-sm font-medium text-slate-700">
                                    Project code
                                </span>
                                <input
                                    value={projectForm.data.code}
                                    onChange={(event) =>
                                        projectForm.setData('code', event.target.value)
                                    }
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                                />
                                {projectForm.errors.code ? (
                                    <p className="text-sm text-red-600">
                                        {projectForm.errors.code}
                                    </p>
                                ) : null}
                            </label>
                        </div>

                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-700">
                                Stream
                            </span>
                            <input
                                value={projectForm.data.stream}
                                onChange={(event) =>
                                    projectForm.setData('stream', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                            {projectForm.errors.stream ? (
                                <p className="text-sm text-red-600">
                                    {projectForm.errors.stream}
                                </p>
                            ) : null}
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-700">
                                Description
                            </span>
                            <textarea
                                value={projectForm.data.description}
                                onChange={(event) =>
                                    projectForm.setData('description', event.target.value)
                                }
                                rows={4}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                            {projectForm.errors.description ? (
                                <p className="text-sm text-red-600">
                                    {projectForm.errors.description}
                                </p>
                            ) : null}
                        </label>

                        <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Project availability
                                </p>
                                <p className="text-xs leading-5 text-slate-500">
                                    {projectForm.data.is_active
                                        ? 'Active projects can be allocated to contributors.'
                                        : 'Archived projects stay visible in history but cannot be newly allocated.'}
                                </p>
                            </div>
                            <Toggle
                                type="button"
                                pressed={projectForm.data.is_active}
                                onPressedChange={(isPressed) =>
                                    projectForm.setData('is_active', isPressed)
                                }
                                aria-label="Toggle project active status"
                                className="relative h-7 w-12 shrink-0 rounded-full border border-slate-300 bg-slate-300 p-0 transition-colors hover:bg-slate-300 data-[state=on]:border-emerald-700 data-[state=on]:bg-emerald-700"
                            >
                                <span className="sr-only">
                                    {projectForm.data.is_active
                                        ? 'Mark project archived'
                                        : 'Mark project active'}
                                </span>
                                <span
                                    className={`absolute top-1 left-1 size-5 rounded-full bg-white shadow-sm transition-transform ${
                                        projectForm.data.is_active
                                            ? 'translate-x-5'
                                            : 'translate-x-0'
                                    }`}
                                />
                            </Toggle>
                        </div>

                        <DialogFooter className="border-t border-slate-200 pt-5">
                            <button
                                type="button"
                                onClick={closeProjectDialog}
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={projectForm.processing}
                                className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {projectForm.processing
                                    ? 'Saving...'
                                    : editingProject
                                      ? 'Save project'
                                      : 'Create project'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminProjectsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'Projects', href: projectsIndex() },
    ],
};
