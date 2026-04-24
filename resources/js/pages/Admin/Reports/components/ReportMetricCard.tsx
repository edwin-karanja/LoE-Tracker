import type { LucideIcon } from 'lucide-react';

type Props = {
    accentClass: string;
    icon: LucideIcon;
    label: string;
    supportingText: string;
    value: number | string;
};

export function ReportMetricCard({
    accentClass,
    icon: Icon,
    label,
    supportingText,
    value,
}: Props) {
    return (
        <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[0.68rem] font-semibold tracking-[0.18em] text-slate-500 uppercase">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold leading-none text-slate-950">
                        {value}
                    </p>
                </div>
                <div
                    className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accentClass}`}
                >
                    <Icon className="size-4.5" />
                </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500">
                {supportingText}
            </p>
        </article>
    );
}
