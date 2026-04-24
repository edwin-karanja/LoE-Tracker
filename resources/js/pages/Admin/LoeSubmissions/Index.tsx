import { Head, Link, router } from '@inertiajs/react';
import { Check, ChevronDown, Eye, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { dashboard as adminDashboard } from '@/routes/admin';
import {
    index as loeSubmissionsIndex,
    show as showSubmission,
} from '@/routes/admin/loe-submissions';

type FilterOption = {
    id: number;
    name: string;
};

type Submission = {
    id: number;
    projectsCount: number;
    status: string;
    submittedAt: string | null;
    totalAllocationPercent: number;
    user: {
        email: string | null;
        name: string | null;
    };
    weekEndDate: string;
    weekStartDate: string;
    weeklySummary: string | null;
};

type Props = {
    filters: {
        month: string;
        project: number | string;
        status: string;
        user: number | string;
    };
    projects: FilterOption[];
    submissions: Submission[];
    users: FilterOption[];
};

type SearchableFilterOption = {
    label: string;
    value: string;
};

type SearchableFilterProps = {
    label: string;
    onChange: (value: string) => void;
    options: SearchableFilterOption[];
    placeholder: string;
    searchPlaceholder: string;
    value: number | string;
};

function SearchableFilter({
    label,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    value,
}: SearchableFilterProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const normalizedValue = String(value ?? '');
    const selectedOption = options.find(
        (option) => option.value === normalizedValue,
    );

    const filteredOptions = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        if (!normalizedSearchTerm) {
            return options;
        }

        return options.filter((option) =>
            option.label.toLowerCase().includes(normalizedSearchTerm),
        );
    }, [options, searchTerm]);

    return (
        <label className="space-y-2">
            <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                {label}
            </span>
            <Popover
                open={isOpen}
                onOpenChange={(nextIsOpen) => {
                    setIsOpen(nextIsOpen);

                    if (!nextIsOpen) {
                        setSearchTerm('');
                    }
                }}
            >
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="flex h-10 w-full items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                    >
                        <span
                            className={
                                selectedOption
                                    ? 'truncate font-medium text-slate-800'
                                    : 'truncate text-slate-400'
                            }
                        >
                            {selectedOption?.label ?? placeholder}
                        </span>
                        <ChevronDown className="size-4 shrink-0 text-slate-400" />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-[--radix-popover-trigger-width] rounded-xl border-slate-200 bg-white p-2 shadow-lg"
                >
                    <div className="relative">
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder={searchPlaceholder}
                            className="h-9 rounded-lg border-slate-200 pl-9 text-sm shadow-none"
                        />
                    </div>

                    <div className="mt-2 max-h-56 overflow-y-auto pr-1">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('');
                                setIsOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                                !normalizedValue
                                    ? 'bg-slate-100 font-medium text-slate-950'
                                    : 'text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {placeholder}
                            {!normalizedValue ? (
                                <Check className="size-4 text-emerald-700" />
                            ) : null}
                        </button>

                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected =
                                    option.value === normalizedValue;

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value);
                                            setIsOpen(false);
                                        }}
                                        className={`mt-1 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                                            isSelected
                                                ? 'bg-emerald-50 font-medium text-emerald-900'
                                                : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                        {isSelected ? (
                                            <Check className="size-4 shrink-0 text-emerald-700" />
                                        ) : null}
                                    </button>
                                );
                            })
                        ) : (
                            <div className="mt-2 rounded-lg border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500">
                                No matches found.
                            </div>
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </label>
    );
}

export default function AdminLoeSubmissionsIndex({
    filters,
    projects,
    submissions,
    users,
}: Props) {
    const hasSelectedFilters = Boolean(
        filters.status || filters.user || filters.project,
    );

    const statusOptions = [
        { label: 'Draft', value: 'draft' },
        { label: 'Submitted', value: 'submitted' },
    ];

    const userOptions = users.map((user) => ({
        label: user.name,
        value: String(user.id),
    }));

    const projectOptions = projects.map((project) => ({
        label: project.name,
        value: String(project.id),
    }));

    const updateFilter = (key: keyof Props['filters'], value: string) => {
        router.visit(
            loeSubmissionsIndex({
                query: {
                    ...filters,
                    [key]: value || undefined,
                },
            }),
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    const clearFilters = () => {
        if (!hasSelectedFilters) {
            return;
        }

        router.visit(
            loeSubmissionsIndex({
                query: {
                    month: filters.month,
                },
            }),
            {
                preserveScroll: true,
                preserveState: false,
            },
        );
    };

    return (
        <>
            <Head title="LoE Submissions" />

            <div className="flex flex-1 flex-col bg-stone-100">
                <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
                    <section>
                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-[2.35rem]">
                            LoE submissions
                        </h1>
                        <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500 md:text-base">
                            Review weekly LoE submissions, summaries, and project-level allocation percentages.
                        </p>
                    </section>

                    <section className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                        <label className="space-y-2">
                            <span className="text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                Month
                            </span>
                            <input
                                type="month"
                                value={filters.month}
                                onChange={(event) =>
                                    updateFilter('month', event.target.value)
                                }
                                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                            />
                        </label>
                        <SearchableFilter
                            label="Status"
                            value={filters.status}
                            options={statusOptions}
                            placeholder="All statuses"
                            searchPlaceholder="Search statuses"
                            onChange={(value) => updateFilter('status', value)}
                        />
                        <SearchableFilter
                            label="Member"
                            value={filters.user}
                            options={userOptions}
                            placeholder="All members"
                            searchPlaceholder="Search members"
                            onChange={(value) => updateFilter('user', value)}
                        />
                        <SearchableFilter
                            label="Project"
                            value={filters.project}
                            options={projectOptions}
                            placeholder="All projects"
                            searchPlaceholder="Search projects"
                            onChange={(value) =>
                                updateFilter('project', value)
                            }
                        />
                        <div className="flex items-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                disabled={!hasSelectedFilters}
                                className="h-10 w-full border-slate-200 text-slate-600 hover:bg-slate-50 xl:w-auto"
                            >
                                <X className="size-4" />
                                Clear
                            </Button>
                        </div>
                    </section>

                    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold tracking-[0.16em] text-slate-500 uppercase">
                                        <th className="px-5 py-4">Member</th>
                                        <th className="px-5 py-4">Week</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Total</th>
                                        <th className="px-5 py-4">Summary</th>
                                        <th className="px-5 py-4 text-right">View</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {submissions.map((submission) => (
                                        <tr key={submission.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-slate-950">
                                                    {submission.user.name}
                                                </p>
                                                <p className="text-sm text-slate-500">
                                                    {submission.user.email}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {submission.weekStartDate} to {submission.weekEndDate}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        submission.status === 'submitted'
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}
                                                >
                                                    {submission.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                                                {submission.totalAllocationPercent}%
                                            </td>
                                            <td className="max-w-xs px-5 py-4 text-sm text-slate-500">
                                                <span className="line-clamp-2">
                                                    {submission.weeklySummary ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={showSubmission(submission.id)}
                                                    className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50"
                                                    aria-label="View submission"
                                                >
                                                    <Eye className="size-4" />
                                                </Link>
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

AdminLoeSubmissionsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: adminDashboard() },
        { title: 'LoE submissions', href: loeSubmissionsIndex() },
    ],
};
