import { Form, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { index as projectsIndex } from '@/routes/admin/projects';
import type { RouteFormDefinition } from '@/wayfinder';

export type ProjectFormData = {
    code: string | null;
    description: string | null;
    isActive: boolean;
    name: string;
    stream: string;
};

type Props = {
    action: RouteFormDefinition<'post'>;
    children: ReactNode;
    project?: ProjectFormData;
};

export function ProjectForm({ action, children, project }: Props) {
    return (
        <Form {...action} className="space-y-5">
            {({ errors, processing }) => (
                <>
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-700">
                                Project name
                            </span>
                            <input
                                name="name"
                                defaultValue={project?.name ?? ''}
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                            {errors.name ? (
                                <p className="text-sm text-red-600">
                                    {errors.name}
                                </p>
                            ) : null}
                        </label>

                        <label className="space-y-2">
                            <span className="text-sm font-medium text-slate-700">
                                Project code
                            </span>
                            <input
                                name="code"
                                defaultValue={project?.code ?? ''}
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                            {errors.code ? (
                                <p className="text-sm text-red-600">
                                    {errors.code}
                                </p>
                            ) : null}
                        </label>
                    </div>

                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                            Stream
                        </span>
                        <input
                            name="stream"
                            defaultValue={project?.stream ?? ''}
                            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                        {errors.stream ? (
                            <p className="text-sm text-red-600">
                                {errors.stream}
                            </p>
                        ) : null}
                    </label>

                    <label className="space-y-2">
                        <span className="text-sm font-medium text-slate-700">
                            Description
                        </span>
                        <textarea
                            name="description"
                            defaultValue={project?.description ?? ''}
                            rows={5}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                        />
                    </label>

                    <label className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            value="1"
                            defaultChecked={project?.isActive ?? true}
                            className="size-4 rounded border-slate-300 text-emerald-700"
                        />
                        <span className="text-sm font-medium text-slate-700">
                            Active project
                        </span>
                    </label>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-5">
                        <Link
                            href={projectsIndex()}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing ? 'Saving...' : children}
                        </button>
                    </div>
                </>
            )}
        </Form>
    );
}
