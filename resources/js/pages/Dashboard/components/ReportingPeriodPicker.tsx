import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

type ReportingPeriodPickerProps = {
    defaultMonth: Date;
    reportingPeriod: DateRange | undefined;
    onSelect: (date: Date | undefined) => void;
    /** Compact trigger for dense layouts (e.g. table headers). */
    size?: 'default' | 'compact';
    /**
     * When true (default), non-compact trigger shows the "Reporting period: …" prefix.
     * Compact mode always shows only the date range — pair with a nearby heading.
     */
    showLabel?: boolean;
};

export function ReportingPeriodPicker({
    defaultMonth,
    reportingPeriod,
    onSelect,
    size = 'default',
    showLabel = true,
}: ReportingPeriodPickerProps) {
    const reportingPeriodLabel =
        reportingPeriod?.from && reportingPeriod?.to
            ? `${format(reportingPeriod.from, 'MMM d')} - ${format(
                  reportingPeriod.to,
                  'MMM d',
              )}`
            : 'Select dates';

    const isCompact = size === 'compact';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className={
                        isCompact
                            ? 'inline-flex min-h-9 w-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs shadow-sm transition hover:bg-slate-50 sm:min-w-[12.5rem] sm:w-auto'
                            : 'inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50'
                    }
                >
                    <div
                        className={
                            isCompact
                                ? 'flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-700'
                                : 'flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700'
                        }
                    >
                        <CalendarDays
                            className={isCompact ? 'size-3.5' : 'size-4.5'}
                        />
                    </div>
                    <div
                        className={
                            isCompact
                                ? 'min-w-0 truncate text-[0.8125rem] font-semibold text-slate-800 tabular-nums'
                                : 'text-sm font-semibold tracking-[0.14em] text-slate-700 uppercase'
                        }
                    >
                        {showLabel && !isCompact
                            ? `Reporting period: ${reportingPeriodLabel}`
                            : reportingPeriodLabel}
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                className="w-auto rounded-2xl border-slate-200 bg-white p-0"
            >
                <Calendar
                    mode="single"
                    defaultMonth={defaultMonth}
                    selected={reportingPeriod?.from}
                    onSelect={onSelect}
                    numberOfMonths={1}
                    weekStartsOn={1}
                    modifiers={{
                        range_start: reportingPeriod?.from,
                        range_end: reportingPeriod?.to,
                        range_middle:
                            reportingPeriod?.from && reportingPeriod?.to
                                ? {
                                      after: reportingPeriod.from,
                                      before: reportingPeriod.to,
                                  }
                                : undefined,
                        selected:
                            reportingPeriod?.from && reportingPeriod?.to
                                ? {
                                      from: reportingPeriod.from,
                                      to: reportingPeriod.to,
                                  }
                                : undefined,
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
