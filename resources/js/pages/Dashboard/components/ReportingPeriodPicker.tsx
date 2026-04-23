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
};

export function ReportingPeriodPicker({
    defaultMonth,
    reportingPeriod,
    onSelect,
}: ReportingPeriodPickerProps) {
    const reportingPeriodLabel =
        reportingPeriod?.from && reportingPeriod?.to
            ? `${format(reportingPeriod.from, 'MMM d')} - ${format(
                  reportingPeriod.to,
                  'MMM d',
              )}`
            : 'Select dates';

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="inline-flex min-h-12 items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-left shadow-sm transition hover:bg-slate-50"
                >
                    <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                        <CalendarDays className="size-4.5" />
                    </div>
                    <div className="text-sm font-semibold tracking-[0.14em] text-slate-700 uppercase">
                        Reporting period: {reportingPeriodLabel}
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
