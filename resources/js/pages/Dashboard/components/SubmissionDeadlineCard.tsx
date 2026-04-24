import { format } from 'date-fns';
import { Clock3 } from 'lucide-react';
import { OverdueSubmissionDeadlineCard } from '@/pages/Dashboard/components/OverdueSubmissionDeadlineCard';
import {
    formatCountdown,
    getTimeDifference,
} from '@/pages/Dashboard/components/submission-deadline';

type SubmissionDeadlineCardProps = {
    currentTime: Date | null;
    deadlineAt: string;
    isOverdue: boolean;
};

export function SubmissionDeadlineCard({
    currentTime,
    deadlineAt,
    isOverdue,
}: SubmissionDeadlineCardProps) {
    const resolvedDeadline = new Date(deadlineAt);
    const hasValidDeadline = !Number.isNaN(resolvedDeadline.getTime());

    if (!hasValidDeadline) {
        return (
            <article className="h-full rounded-xl border border-slate-200 bg-white p-2.5 text-slate-900 shadow-sm sm:p-3">
                <p className="text-xs font-medium text-slate-600 sm:text-sm">
                    Deadline unavailable right now.
                </p>
            </article>
        );
    }

    if (isOverdue && currentTime) {
        return (
            <OverdueSubmissionDeadlineCard
                currentTime={currentTime}
                deadline={resolvedDeadline}
            />
        );
    }

    if (!currentTime) {
        return (
            <article className="h-full rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-2.5 text-slate-900 shadow-sm sm:p-3">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 ring-inset sm:size-8 sm:rounded-xl">
                        <Clock3 className="size-3.5" />
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-white/70 px-1.5 py-0.5 text-[0.55rem] font-semibold tracking-[0.14em] text-emerald-800 uppercase sm:px-2 sm:py-1 sm:text-[0.58rem] sm:tracking-[0.18em]">
                        Deadline
                    </span>
                </div>

                <div className="mt-2 space-y-0.5 sm:mt-2.5 sm:space-y-1">
                    <p className="text-base font-semibold tracking-tight text-slate-900 sm:text-[1.1rem]">
                        {format(resolvedDeadline, 'EEE h:mm a')}
                    </p>
                    <p className="text-[0.6rem] font-semibold tracking-[0.12em] text-slate-500 uppercase sm:text-[0.62rem] sm:tracking-[0.16em]">
                        Deadline
                    </p>
                    <p className="text-[0.7rem] leading-snug text-slate-600 sm:text-xs">
                        Due {format(resolvedDeadline, 'EEE, MMM d')} at{' '}
                        {format(resolvedDeadline, 'h:mm a')}.
                    </p>
                </div>
            </article>
        );
    }

    const countdown = getTimeDifference(resolvedDeadline, currentTime);

    return (
        <article className="h-full rounded-xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-2.5 text-slate-900 shadow-sm sm:p-3">
            <div className="flex items-start justify-between gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 ring-inset sm:size-8 sm:rounded-xl">
                    <Clock3 className="size-3.5" />
                </div>
                <span className="rounded-full border border-emerald-200 bg-white/70 px-1.5 py-0.5 text-[0.55rem] font-semibold tracking-[0.12em] text-emerald-800 uppercase sm:px-2 sm:py-1 sm:text-[0.58rem] sm:tracking-[0.18em]">
                    Live countdown
                </span>
            </div>

            <div className="mt-2 space-y-0.5 sm:mt-2.5 sm:space-y-1">
                <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-0.5">
                    <p className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                        {formatCountdown(countdown)}
                    </p>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[0.58rem] font-semibold tracking-[0.1em] text-emerald-800 uppercase sm:px-2 sm:py-1 sm:tracking-[0.18em]">
                        {format(resolvedDeadline, 'EEE h:mm a')}
                    </span>
                </div>
                <p className="text-[0.6rem] font-semibold tracking-[0.12em] text-slate-500 uppercase sm:text-[0.62rem] sm:tracking-[0.16em]">
                    Deadline
                </p>
                <p className="text-[0.7rem] leading-snug text-slate-600 sm:text-xs">
                    Due {format(resolvedDeadline, 'EEE, MMM d')} at{' '}
                    {format(resolvedDeadline, 'h:mm a')}.
                </p>
            </div>
        </article>
    );
}
