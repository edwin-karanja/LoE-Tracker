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

    return (
        <article className="rounded-[1.1rem] border border-amber-300 bg-gradient-to-br from-amber-50 via-white to-red-50 p-3.5 text-slate-900 shadow-sm shadow-amber-100/80">
            <div className="flex items-start justify-between gap-3">
                <div className="flex size-8 items-center justify-center rounded-xl bg-amber-100 text-amber-700 ring-1 ring-amber-200 ring-inset">
                    <AlertTriangle className="size-3.5" />
                </div>
                <span className="rounded-full border border-amber-200 bg-white/80 px-2 py-1 text-[0.58rem] font-semibold tracking-[0.18em] text-amber-800 uppercase">
                    Past deadline
                </span>
            </div>

            <div className="mt-3.5 space-y-1.5">
                <div className="flex items-end justify-between gap-3">
                    <p className="text-[1.35rem] font-semibold tracking-tight text-slate-900">
                        +{formatCountdown(overdueDuration)}
                    </p>
                    <span className="rounded-full bg-amber-100 px-2 py-1 text-[0.62rem] font-semibold tracking-[0.18em] text-amber-800 uppercase">
                        Since {format(deadline, 'EEE h:mm a')}
                    </span>
                </div>
                <p className="text-[0.62rem] font-semibold tracking-[0.16em] text-slate-500 uppercase">
                    Overdue by
                </p>
                <p className="text-xs text-slate-600">
                    Your weekly pulse was due {format(deadline, 'EEE, MMM d')}{' '}
                    at {format(deadline, 'h:mm a')} and is still awaiting
                    submission.
                </p>
            </div>
        </article>
    );
}
