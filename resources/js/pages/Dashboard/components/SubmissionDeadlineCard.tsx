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
            <article className="rounded-[1.1rem] border border-slate-200 bg-white p-3.5 text-slate-900 shadow-sm">
                <p className="text-sm font-medium text-slate-600">
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
            <article className="rounded-[1.1rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-3.5 text-slate-900 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 ring-inset">
                        <Clock3 className="size-3.5" />
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-white/70 px-2 py-1 text-[0.58rem] font-semibold tracking-[0.18em] text-emerald-800 uppercase">
                        Deadline
                    </span>
                </div>

                <div className="mt-3.5 space-y-1.5">
                    <p className="text-[1.1rem] font-semibold tracking-tight text-slate-900">
                        {format(resolvedDeadline, 'EEE h:mm a')}
                    </p>
                    <p className="text-[0.62rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                        Deadline
                    </p>
                    <p className="text-xs text-slate-600">
                        Due {format(resolvedDeadline, 'EEE, MMM d')} at{' '}
                        {format(resolvedDeadline, 'h:mm a')}.
                    </p>
                </div>
            </article>
        );
    }

    const countdown = getTimeDifference(resolvedDeadline, currentTime);

    return (
        <article className="rounded-[1.1rem] border border-emerald-200/80 bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50 p-3.5 text-slate-900 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 ring-inset">
                    <Clock3 className="size-3.5" />
                </div>
                <span className="rounded-full border border-emerald-200 bg-white/70 px-2 py-1 text-[0.58rem] font-semibold tracking-[0.18em] text-emerald-800 uppercase">
                    Live countdown
                </span>
            </div>

            <div className="mt-3.5 space-y-1.5">
                <div className="flex items-end justify-between gap-3">
                    <p className="text-[1.35rem] font-semibold tracking-tight text-slate-900">
                        {formatCountdown(countdown)}
                    </p>
                    <span className="rounded-full bg-emerald-100 px-2 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-emerald-800 uppercase">
                        {format(resolvedDeadline, 'EEE h:mm a')}
                    </span>
                </div>
                <p className="text-[0.62rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Deadline
                </p>
                <p className="text-xs text-slate-600">
                    Due {format(resolvedDeadline, 'EEE, MMM d')} at{' '}
                    {format(resolvedDeadline, 'h:mm a')}.
                </p>
            </div>
        </article>
    );
}
