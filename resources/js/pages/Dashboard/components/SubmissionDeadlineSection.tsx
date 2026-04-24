import { useEffect, useState } from 'react';
import { SubmissionDeadlineCard } from '@/pages/Dashboard/components/SubmissionDeadlineCard';

type SubmissionDeadlineSectionProps = {
    deadlineAt: string;
    isOverdue: boolean;
};

export function SubmissionDeadlineSection({
    deadlineAt,
    isOverdue,
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

    return (
        <SubmissionDeadlineCard
            currentTime={currentTime}
            deadlineAt={deadlineAt}
            isOverdue={isOverdue}
        />
    );
}
