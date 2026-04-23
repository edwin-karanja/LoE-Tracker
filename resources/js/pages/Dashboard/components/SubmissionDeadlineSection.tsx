import { AlertTriangle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { SubmissionDeadlineCard } from '@/pages/Dashboard/components/SubmissionDeadlineCard';

type SubmissionDeadlineSectionProps = {
    deadlineAt: string;
    isOverdue: boolean;
    pulseStatus: string;
};

export function SubmissionDeadlineSection({
    deadlineAt,
    isOverdue,
    pulseStatus,
}: SubmissionDeadlineSectionProps) {
    const [currentTime, setCurrentTime] = useState<Date | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            setCurrentTime(new Date());
        }, 0);

        const intervalId = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearInterval(intervalId);
        };
    }, []);

    const shouldShowReminder = useMemo(
        () => pulseStatus === 'draft' && isOverdue,
        [isOverdue, pulseStatus],
    );

    return (
        <div className="space-y-3">
            {shouldShowReminder ? (
                <div className="flex items-start gap-3 rounded-[1.25rem] border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-red-50 px-4 py-3.5 shadow-sm">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                        <AlertTriangle className="size-4" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-900">
                            Your weekly pulse is still waiting for submission.
                        </p>
                        <p className="text-sm leading-6 text-slate-600">
                            The Thursday 5:00 PM deadline has passed, and this
                            week&apos;s pulse is still in draft. Review your
                            entries and submit it as soon as possible.
                        </p>
                    </div>
                </div>
            ) : null}

            <SubmissionDeadlineCard
                currentTime={currentTime}
                deadlineAt={deadlineAt}
                isOverdue={isOverdue}
            />
        </div>
    );
}
