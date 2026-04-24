import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';
import {
    formatCountdown,
    getTimeDifference,
} from '@/pages/Dashboard/components/submission-deadline';

type OverdueSubmissionDeadlineCardProps = {
    currentTime: Date;
    deadline: Date;
};

export function OverdueSubmissionDeadlineCard({
    currentTime,
    deadline,
}: OverdueSubmissionDeadlineCardProps) {
    const overdueDuration = getTimeDifference(deadline, currentTime);
    const overdueLabel =
        overdueDuration.days > 0
            ? `${overdueDuration.days}d ${overdueDuration.hours}h`
            : formatCountdown(overdueDuration);

    return (
        <article className="h-full min-h-0 rounded-xl border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-red-50 p-2.5 text-slate-900 shadow-sm shadow-amber-100/80 sm:p-3">
            <div className="flex items-start justify-between gap-2">
                <div
                    className="flex size-7 items-center justify-center rounded-lg bg-amber-100 text-amber-700 ring-1 ring-amber-200 ring-inset sm:size-8 sm:rounded-xl"
                    aria-hidden
                >
                    <AlertTriangle className="size-3.5" />
                </div>
                <span className="rounded-full border border-amber-200 bg-white/80 px-1.5 py-0.5 text-[0.55rem] font-semibold tracking-[0.12em] text-amber-800 uppercase sm:px-2 sm:py-1 sm:text-[0.58rem] sm:tracking-[0.18em]">
                    Past deadline
                </span>
            </div>

            <div className="mt-2 space-y-0.5 sm:mt-2.5 sm:space-y-1">
                <div className="flex flex-wrap items-end justify-between gap-x-2 gap-y-0.5">
                    <p className="text-sm font-semibold tracking-tight text-slate-900 tabular-nums sm:text-base">
                        +{overdueLabel}
                    </p>
                    <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.58rem] font-semibold tracking-[0.1em] text-amber-800 uppercase sm:px-2 sm:py-1 sm:tracking-[0.18em]">
                        Since {format(deadline, 'EEE h:mm a')}
                    </span>
                </div>
                <p className="text-[0.6rem] font-semibold tracking-[0.12em] text-slate-500 uppercase sm:text-[0.62rem] sm:tracking-[0.16em]">
                    Overdue
                </p>
                <p className="text-[0.7rem] leading-snug text-slate-600 sm:text-xs">
                    Due {format(deadline, 'EEE, MMM d')} at {format(deadline, 'h:mm a')}.
                </p>
            </div>
        </article>
    );
}
