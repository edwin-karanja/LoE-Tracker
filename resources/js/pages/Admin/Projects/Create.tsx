import { Head } from '@inertiajs/react';
import { dashboard as adminDashboard } from '@/routes/admin';
import { index as projectsIndex, store } from '@/routes/admin/projects';
import { ProjectForm } from './components/ProjectForm';

export default function AdminProjectsCreate() {
    return (
        <>
            <Head title="Create Project" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                            Add project
                        </h1>
                        <p className="mt-1 text-sm leading-6 text-slate-500 md:text-base">
                            Create a project administrators can allocate and contributors can log LoE against.
                        </p>
                    </section>

                    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <ProjectForm action={store.form()}>
                            Create project
                        </ProjectForm>
                    </article>
                </div>
            </div>
        </>
    );
}

AdminProjectsCreate.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'Projects', href: projectsIndex() },
        { title: 'Create', href: '#' },
    ],
};
