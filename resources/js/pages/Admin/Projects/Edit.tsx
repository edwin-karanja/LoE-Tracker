import { Head } from '@inertiajs/react';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as projectsIndex, update } from '@/routes/admin/projects';
import type { ProjectFormData } from './components/ProjectForm';
import { ProjectForm } from './components/ProjectForm';

type Props = {
    project: ProjectFormData & {
        id: number;
    };
};

export default function AdminProjectsEdit({ project }: Props) {
    return (
        <>
            <Head title={`Edit ${project.name}`} />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                            Edit project
                        </h1>
                        <p className="mt-1 text-sm leading-6 text-slate-500 md:text-base">
                            Update project details and availability for future allocation work.
                        </p>
                    </section>

                    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <ProjectForm
                            action={update.form(project.id)}
                            project={project}
                        >
                            Save project
                        </ProjectForm>
                    </article>
                </div>
            </div>
        </>
    );
}

AdminProjectsEdit.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'Projects', href: projectsIndex() },
        { title: 'Edit', href: '#' },
    ],
};
