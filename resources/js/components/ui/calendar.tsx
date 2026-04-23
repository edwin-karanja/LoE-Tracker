import { ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { DayPicker } from 'react-day-picker';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function Calendar({
    className,
    classNames,
    showOutsideDays = true,
    ...props
}: React.ComponentProps<typeof DayPicker>) {
    return (
        <DayPicker
            showOutsideDays={showOutsideDays}
            className={cn('relative p-3 pt-12', className)}
            classNames={{
                months:
                    'flex flex-col gap-4 sm:flex-row relative justify-center',
                month: 'flex w-full flex-col gap-4',
                month_caption:
                    'flex h-9 items-center justify-center px-12',
                caption_label: 'text-sm font-medium text-slate-900',
                nav: 'pointer-events-none absolute top-3 right-3 left-3 z-10 flex items-center justify-between',
                button_previous: cn(
                    buttonVariants({ variant: 'outline' }),
                    'pointer-events-auto size-7 bg-white p-0 opacity-70 shadow-none hover:opacity-100',
                ),
                button_next: cn(
                    buttonVariants({ variant: 'outline' }),
                    'pointer-events-auto size-7 bg-white p-0 opacity-70 shadow-none hover:opacity-100',
                ),
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday:
                    'text-slate-500 rounded-md w-9 font-normal text-[0.8rem]',
                week: 'mt-2 flex w-full',
                day: 'h-9 w-9 p-0 text-center text-sm relative',
                day_button: cn(
                    buttonVariants({ variant: 'ghost' }),
                    'size-9 p-0 font-normal aria-selected:opacity-100',
                ),
                range_start:
                    'bg-slate-900 text-white rounded-l-md aria-selected:text-white',
                range_middle: 'bg-slate-100 aria-selected:bg-slate-100',
                range_end:
                    'bg-slate-900 text-white rounded-r-md aria-selected:text-white',
                selected:
                    'bg-slate-900 text-white hover:bg-slate-900 hover:text-white focus:bg-slate-900 focus:text-white',
                today: 'bg-slate-100 text-slate-900',
                outside: 'text-slate-400 opacity-50',
                disabled: 'text-slate-300 opacity-50',
                hidden: 'invisible',
                ...classNames,
            }}
            components={{
                Chevron: ({ className: chevronClassName, orientation, ...rest }) =>
                    orientation === 'left' ? (
                        <ChevronLeft
                            className={cn('size-4', chevronClassName)}
                            {...rest}
                        />
                    ) : (
                        <ChevronRight
                            className={cn('size-4', chevronClassName)}
                            {...rest}
                        />
                    ),
            }}
            {...props}
        />
    );
}

export { Calendar };
