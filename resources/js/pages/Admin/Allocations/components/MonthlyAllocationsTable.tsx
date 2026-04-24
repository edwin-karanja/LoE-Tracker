import { router } from '@inertiajs/react';
import { PencilLine, Save, Search, UserRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { update as updateAllocations } from '@/routes/admin/allocations';

export type AllocationUser = {
    email: string;
    id: number;
    isAdmin: boolean;
    name: string;
};

export type AllocationProject = {
    code: string | null;
    id: number;
    name: string;
    stream: string;
};

type Props = {
    allocationValues: Record<string, number>;
    currentMonth: {
        label: string;
        value: string;
    };
    month: {
        label: string;
        value: string;
    };
    monthViewState: 'current' | 'future' | 'past';
    projects: AllocationProject[];
    users: AllocationUser[];
};

export function MonthlyAllocationsTable({
    allocationValues,
    currentMonth,
    month,
    monthViewState,
    projects,
    users,
}: Props) {
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<AllocationUser | null>(null);
    const [draftValues, setDraftValues] = useState<Record<number, number>>({});
    const [isSaving, setIsSaving] = useState(false);

    const filteredUsers = useMemo(() => {
        const normalizedSearchTerm = userSearchTerm.trim().toLowerCase();

        if (!normalizedSearchTerm) {
            return users;
        }

        return users.filter((user) =>
            user.email.toLowerCase().includes(normalizedSearchTerm),
        );
    }, [userSearchTerm, users]);

    const allocationKey = (userId: number, projectId: number) =>
        `${userId}:${projectId}`;

    const parseAllocationValue = (value: string) => {
        const parsedValue = value === '' ? 0 : Number.parseInt(value, 10) || 0;

        return Math.max(0, Math.min(200, parsedValue));
    };

    const totalForUser = (userId: number) =>
        projects.reduce(
            (total, project) =>
                total +
                (allocationValues[allocationKey(userId, project.id)] ?? 0),
            0,
        );

    const openEditModal = (user: AllocationUser) => {
        setEditingUser(user);
        setDraftValues(
            Object.fromEntries(
                projects.map((project) => [
                    project.id,
                    allocationValues[allocationKey(user.id, project.id)] ?? 0,
                ]),
            ),
        );
    };

    const closeEditModal = () => {
        setEditingUser(null);
        setDraftValues({});
    };

    const updateDraftValue = (projectId: number, value: string) => {
        setDraftValues((current) => ({
            ...current,
            [projectId]: parseAllocationValue(value),
        }));
    };

    const draftTotal = projects.reduce(
        (total, project) => total + (draftValues[project.id] ?? 0),
        0,
    );

    const monthStateUi =
        monthViewState === 'past'
            ? {
                  badge: 'Archived month',
                  badgeClass:
                      'border-amber-200 bg-amber-100 text-amber-800',
                  bannerClass:
                      'border-amber-200/80 bg-amber-50/60',
                  emphasisClass: 'text-amber-800',
                  messagePrefix: 'You are editing archived allocations for',
                  messageSuffix: `instead of the current month of ${currentMonth.label}.`,
              }
            : monthViewState === 'future'
              ? {
                    badge: 'Future month',
                    badgeClass:
                        'border-sky-200 bg-sky-100 text-sky-800',
                    bannerClass:
                        'border-sky-200/80 bg-sky-50/60',
                    emphasisClass: 'text-sky-800',
                    messagePrefix: 'You are planning allocations for',
                    messageSuffix: `before the current month of ${currentMonth.label} begins.`,
                }
              : null;

    const metricHeaderClass =
        'min-w-24 px-3 py-2.5 text-center bg-emerald-50/80 text-emerald-800';
    const metricCellClass =
        'px-3 py-2.5 text-center bg-emerald-50/45 align-middle';

    const saveAllocationsForUser = () => {
        if (!editingUser) {
            return;
        }

        setIsSaving(true);

        router.visit(updateAllocations(month.value), {
            data: {
                allocations: projects.map((project) => ({
                    allocation_percent: draftValues[project.id] ?? 0,
                    project_id: project.id,
                    user_id: editingUser.id,
                })),
            },
            preserveScroll: true,
            preserveState: false,
            onSuccess: () => closeEditModal(),
            onFinish: () => setIsSaving(false),
        });
    };

    return (
        <>
            <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-950">
                            {month.label}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Use the row action to edit a member&apos;s allocations. Empty values are treated as 0%.
                        </p>
                    </div>
                    <label className="w-full max-w-sm">
                        <span className="sr-only">Search members by email</span>
                        <div className="relative">
                            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={userSearchTerm}
                                onChange={(event) =>
                                    setUserSearchTerm(event.target.value)
                                }
                                placeholder="Search member email"
                                className="h-9 rounded-lg border-slate-200 bg-white pr-9 pl-9 text-sm shadow-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                            {userSearchTerm ? (
                                <button
                                    type="button"
                                    onClick={() => setUserSearchTerm('')}
                                    className="absolute top-1/2 right-2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                    aria-label="Clear member email search"
                                >
                                    <X className="size-3.5" />
                                </button>
                            ) : null}
                        </div>
                    </label>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[0.68rem] leading-none font-semibold tracking-[0.1em] text-slate-500 uppercase">
                                <th className="sticky left-0 z-30 min-w-56 bg-slate-50 px-4 py-2.5 pr-6 shadow-[10px_0_16px_-16px_rgba(15,23,42,0.55)] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-slate-300 after:content-['']">
                                    Member
                                </th>
                                <th className="min-w-24 px-3 py-2.5 text-center">
                                    Action
                                </th>
                                <th className={metricHeaderClass}>Total</th>
                                <th className="min-w-28 px-3 py-2.5 text-center bg-sky-50/85 text-sky-800">
                                    Availability
                                </th>
                                {projects.map((project) => (
                                    <th
                                        key={project.id}
                                        className="min-w-36 px-3 py-2.5 text-center"
                                    >
                                        <span className="block truncate text-xs leading-none font-semibold tracking-normal text-slate-700 normal-case">
                                            {project.name}
                                        </span>
                                        <span className="mt-1 block truncate text-[0.62rem] leading-none tracking-normal text-slate-400 normal-case">
                                            {project.code ?? project.stream}
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.map((user) => {
                                const total = totalForUser(user.id);

                                return (
                                    <tr
                                        key={user.id}
                                        className="text-sm transition hover:bg-slate-50/70"
                                    >
                                        <td className="sticky left-0 z-20 bg-white px-4 py-2.5 pr-6 shadow-[10px_0_16px_-16px_rgba(15,23,42,0.55)] after:absolute after:top-0 after:right-0 after:h-full after:w-1 after:bg-slate-300 after:content-['']">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(user)}
                                                className="text-left text-sm leading-5 font-medium text-slate-800 transition hover:text-slate-950 hover:underline"
                                            >
                                                {user.name}
                                            </button>
                                            <p className="text-xs leading-4 text-slate-500">
                                                {user.email}
                                            </p>
                                            {user.isAdmin ? (
                                                <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[0.62rem] font-semibold text-slate-600">
                                                    Admin
                                                </span>
                                            ) : null}
                                        </td>
                                        <td className="px-3 py-2.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => openEditModal(user)}
                                                className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                                            >
                                                <PencilLine className="size-3.5" />
                                                Edit
                                            </button>
                                        </td>
                                        <td className={`${metricCellClass} text-sm font-bold text-emerald-900`}>
                                            {total}%
                                        </td>
                                        <td className="px-3 py-2.5 text-center text-sm font-semibold text-sky-700 bg-sky-50/55">
                                            {Math.max(0, 100 - total)}%
                                        </td>
                                        {projects.map((project) => (
                                            <td
                                                key={project.id}
                                                className="px-3 py-2.5 text-center"
                                            >
                                                <div className="mx-auto w-16">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        tabIndex={-1}
                                                        value={`${
                                                            allocationValues[
                                                                allocationKey(
                                                                    user.id,
                                                                    project.id,
                                                                )
                                                            ] ?? 0
                                                        }%`}
                                                        className="h-8 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-center text-xs font-semibold text-slate-700 outline-none"
                                                    />
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={projects.length + 4}
                                        className="px-4 py-8 text-center text-sm text-slate-500"
                                    >
                                        No members match that email search.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>
                </div>
            </article>

            <Dialog
                open={editingUser !== null}
                onOpenChange={(isOpen) => {
                    if (!isOpen) {
                        closeEditModal();
                    }
                }}
            >
                <DialogContent className="overflow-hidden border-slate-200 bg-white p-0 shadow-2xl sm:max-w-4xl">
                    <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                        <DialogHeader className="gap-3">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex min-w-0 items-center gap-4">
                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                                        <UserRound className="size-5 text-slate-700" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl text-slate-950">
                                            Edit monthly allocations
                                        </DialogTitle>
                                        <DialogDescription className="mt-1 text-slate-500">
                                            {editingUser
                                                ? `${editingUser.name} • ${editingUser.email}`
                                                : 'Update project allocations for the selected month.'}
                                        </DialogDescription>
                                    </div>
                                </div>
                                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-semibold tracking-[0.18em] text-slate-700 uppercase">
                                    {month.label}
                                </div>
                            </div>
                            {monthStateUi ? (
                                <div
                                    className={`rounded-2xl border px-4 py-3 ${monthStateUi.bannerClass}`}
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span
                                            className={`inline-flex rounded-full border px-3 py-1 text-[0.68rem] font-semibold tracking-[0.16em] uppercase ${monthStateUi.badgeClass}`}
                                        >
                                            {monthStateUi.badge}
                                        </span>
                                        <p className="text-sm font-medium text-slate-800">
                                            {monthStateUi.messagePrefix}
                                            {' '}
                                            <span
                                                className={
                                                    monthStateUi.emphasisClass
                                                }
                                            >
                                                {month.label}
                                            </span>
                                            {' '}
                                            {monthStateUi.messageSuffix}
                                        </p>
                                    </div>
                                </div>
                            ) : null}
                        </DialogHeader>
                    </div>

                    <div className="space-y-4 px-6 py-4">
                        <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:grid-cols-3">
                            <div>
                                <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                    Total allocation
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-slate-950">
                                    {draftTotal}%
                                </p>
                            </div>
                            <div>
                                <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                    Availability
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-slate-950">
                                    {Math.max(0, 100 - draftTotal)}%
                                </p>
                            </div>
                            <div>
                                <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                    Guidance
                                </p>
                                <p className="mt-1 text-sm leading-5 text-slate-600">
                                    Adjust the percentages, then save only when
                                    this row looks right.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="grid grid-cols-[minmax(0,1fr)_6.75rem] border-b border-slate-200 bg-slate-50 px-4 py-2 text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                                <span>Project assignment</span>
                                <span className="text-right">LoE %</span>
                            </div>

                            <div className="max-h-[48vh] divide-y divide-slate-100 overflow-y-auto">
                                {projects.map((project) => (
                                    <div
                                        key={project.id}
                                        className="grid grid-cols-[minmax(0,1fr)_6.75rem] items-center gap-4 px-4 py-2"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold leading-5 text-slate-950">
                                                {project.name}
                                            </p>
                                            <p className="truncate text-xs leading-4 text-slate-500">
                                                {project.code ?? project.stream}
                                            </p>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max="200"
                                                value={
                                                    draftValues[project.id] ?? 0
                                                }
                                                onChange={(event) =>
                                                    updateDraftValue(
                                                        project.id,
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 pr-6 text-right text-sm font-semibold text-slate-800 [appearance:textfield] outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                            />
                                            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                                %
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-slate-200 bg-slate-50 px-6 py-4">
                        <button
                            type="button"
                            onClick={closeEditModal}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={saveAllocationsForUser}
                            disabled={isSaving || !editingUser}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            <Save className="size-4" />
                            {isSaving ? 'Saving...' : 'Save allocations'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
