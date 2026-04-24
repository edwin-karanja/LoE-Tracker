import { router } from '@inertiajs/react';
import { Check, FolderPlus, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { store as storeUserProject } from '@/routes/user-projects';

type AvailableProject = {
    id: number;
    name: string;
};

type AddProjectDialogProps = {
    availableProjects: AvailableProject[];
    canAddProject: boolean;
    reportingWeekStartDate: string;
};

export function AddProjectDialog({
    availableProjects,
    canAddProject,
    reportingWeekStartDate,
}: AddProjectDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredProjects = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        if (!normalizedSearchTerm) {
            return availableProjects;
        }

        return availableProjects.filter((project) =>
            project.name.toLowerCase().includes(normalizedSearchTerm),
        );
    }, [availableProjects, searchTerm]);

    const handleAddProject = () => {
        if (!selectedProject) {
            return;
        }

        router.post(
            storeUserProject.url({
                query: { week: reportingWeekStartDate },
            }),
            {
                project_id: Number(selectedProject),
            },
            {
                preserveState: false,
                onSuccess: () => {
                    setSelectedProject('');
                    setSearchTerm('');
                    setIsOpen(false);
                },
            },
        );
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(nextIsOpen) => {
                setIsOpen(nextIsOpen);

                if (!nextIsOpen) {
                    setSearchTerm('');
                }
            }}
        >
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    disabled={!canAddProject}
                >
                    <Plus className="size-4" />
                    Add project
                </button>
            </DialogTrigger>
            <DialogContent className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-0 shadow-xl sm:max-w-xl">
                <DialogHeader className="gap-4 px-7 pt-7">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-4">
                            <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                                <FolderPlus className="size-6 text-slate-700" />
                            </div>
                            <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                                Add project to weekly pulse
                            </DialogTitle>
                        </div>
                        <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-[0.68rem] font-semibold tracking-[0.24em] text-slate-700 uppercase">
                            Project list
                        </div>
                    </div>
                    <DialogDescription className="max-w-lg text-sm leading-6 text-slate-600">
                        Search available projects, then add one to this
                        month&apos;s weekly pulse without leaving the tracker.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-7 py-6">
                    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                        <label
                            htmlFor="project-search"
                            className="text-sm font-semibold tracking-[0.18em] text-slate-900 uppercase"
                        >
                            Find a project
                        </label>
                        <div className="relative mt-3">
                            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                id="project-search"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(event.target.value)
                                }
                                placeholder="Search by project name"
                                className="h-11 rounded-xl border-slate-200 bg-white pl-11 text-sm shadow-none"
                            />
                        </div>

                        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                            {filteredProjects.length > 0 ? (
                                filteredProjects.map((project) => {
                                    const isSelected =
                                        selectedProject === String(project.id);

                                    return (
                                        <button
                                            key={project.id}
                                            type="button"
                                            onClick={() =>
                                                setSelectedProject(
                                                    String(project.id),
                                                )
                                            }
                                            className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                                isSelected
                                                    ? 'border-slate-900 bg-slate-900 text-white'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="text-sm font-medium">
                                                {project.name}
                                            </span>
                                            <span
                                                className={`flex size-6 items-center justify-center rounded-full border ${
                                                    isSelected
                                                        ? 'border-white/30 bg-white/10 text-white'
                                                        : 'border-slate-200 bg-slate-50 text-slate-400'
                                                }`}
                                            >
                                                <Check className="size-3.5" />
                                            </span>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm leading-6 text-slate-500">
                                    No projects match your search yet. Try a
                                    different project name.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t border-slate-200 bg-slate-50 px-7 py-5">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            setIsOpen(false);
                            setSearchTerm('');
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={!selectedProject}
                        onClick={handleAddProject}
                    >
                        Add project
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
