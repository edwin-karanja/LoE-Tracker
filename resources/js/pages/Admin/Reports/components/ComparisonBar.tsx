type Props = {
    maxValue?: number;
    submitted: number;
    planned: number;
};

export function ComparisonBar({ maxValue = 100, planned, submitted }: Props) {
    const safeMax = Math.max(maxValue, planned, submitted, 1);
    const plannedWidth = `${Math.min(100, (planned / safeMax) * 100)}%`;
    const submittedWidth = `${Math.min(100, (submitted / safeMax) * 100)}%`;

    return (
        <div className="space-y-1.5">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: plannedWidth }}
                />
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: submittedWidth }}
                />
            </div>
        </div>
    );
}
