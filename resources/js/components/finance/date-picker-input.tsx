import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarDays } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

interface DatePickerInputProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    min?: string;
    max?: string;
}

interface MonthPickerInputProps extends Omit<DatePickerInputProps, 'placeholder'> {
    placeholder?: string;
}

interface DateRangePickerInputProps {
    startValue: string;
    endValue: string;
    onStartChange: (value: string) => void;
    onEndChange: (value: string) => void;
    className?: string;
}

function parseDateValue(value: string): Date | undefined {
    if (!value) {
        return undefined;
    }

    const [year, month, day] = value.split('-').map(Number);

    if (!year || !month || !day) {
        return undefined;
    }

    return new Date(year, month - 1, day);
}

function toDateValue(date: Date | undefined): string {
    if (!date) {
        return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function formatDateOnly(value: string, fallback = 'Pilih tanggal', options: { fullYear?: boolean } = {}): string {
    const date = parseDateValue(value);

    if (!date) {
        return fallback;
    }

    const parts = new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: '2-digit',
        month: 'long',
        year: options.fullYear ? 'numeric' : '2-digit',
    })
        .formatToParts(date)
        .reduce<Record<string, string>>((carry, part) => {
            carry[part.type] = part.value;

            return carry;
        }, {});

    return `${parts.day} ${parts.month} ${parts.year}`;
}

function formatMonth(value: string, fallback = 'Pilih periode'): string {
    if (!value) {
        return fallback;
    }

    const date = new Date(`${value}-01T00:00:00+07:00`);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    return new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Jakarta',
        month: 'long',
        year: 'numeric',
    }).format(date);
}

function rangeLabel(startValue: string, endValue: string): string {
    if (!startValue && !endValue) {
        return 'Pilih periode';
    }

    return `${formatDateOnly(startValue, 'Pilih mulai', { fullYear: true })} s/d ${formatDateOnly(endValue, 'Pilih selesai', {
        fullYear: true,
    })}`;
}

/** Year range for dropdown: 5 years back and 5 years forward from today. */
const DROPDOWN_START_MONTH = new Date(new Date().getFullYear() - 5, 0);
const DROPDOWN_END_MONTH = new Date(new Date().getFullYear() + 5, 11);

const DATE_PRESETS: { label: string; offset: number }[] = [
    { label: 'Hari ini', offset: 0 },
    { label: 'Besok', offset: 1 },
    { label: '3 Hari', offset: 3 },
    { label: '1 Minggu', offset: 7 },
    { label: '2 Minggu', offset: 14 },
];

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);

    return result;
}

export function DatePickerInput({ value, onValueChange, placeholder, className, min, max }: DatePickerInputProps) {
    const [open, setOpen] = useState(false);
    const selectedDate = parseDateValue(value);
    const minDate = parseDateValue(min ?? '');
    const maxDate = parseDateValue(max ?? '');

    function selectPreset(offset: number) {
        const date = addDays(new Date(), offset);
        onValueChange(toDateValue(date));
        setOpen(false);
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" className={cn('h-12 w-full justify-between px-4 text-left', className)}>
                    <span className={cn('truncate tabular-nums', !value && 'text-muted-foreground')}>{formatDateOnly(value, placeholder)}</span>
                    <CalendarDays className="text-muted-foreground size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[276px] p-0" align="start">
                <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    fixedWeeks
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    startMonth={DROPDOWN_START_MONTH}
                    endMonth={DROPDOWN_END_MONTH}
                    disabled={(date) => Boolean((minDate && date < minDate) || (maxDate && date > maxDate))}
                    onSelect={(date) => {
                        onValueChange(toDateValue(date));
                        setOpen(false);
                    }}
                />
                <div className="border-t px-3 pb-3 pt-2">
                    <div className="flex flex-wrap gap-2">
                        {DATE_PRESETS.map((preset) => (
                            <Button
                                key={preset.label}
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1 text-xs"
                                onClick={() => selectPreset(preset.offset)}
                            >
                                {preset.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

export function MonthPickerInput({ value, onValueChange, placeholder, className, min, max }: MonthPickerInputProps) {
    return (
        <input
            type="month"
            value={value}
            min={min}
            max={max}
            onChange={(event) => onValueChange(event.target.value)}
            aria-label={placeholder ?? 'Pilih periode'}
            className={cn(
                'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring h-12 w-full rounded-md border px-4 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50',
                className,
            )}
            title={formatMonth(value, placeholder)}
        />
    );
}

export function DateRangePickerInput({ startValue, endValue, onStartChange, onEndChange, className }: DateRangePickerInputProps) {
    const [open, setOpen] = useState(false);
    const selectedRange: DateRange | undefined = {
        from: parseDateValue(startValue),
        to: parseDateValue(endValue),
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button type="button" variant="outline" className={cn('h-12 w-full justify-between px-4 text-left', className)}>
                    <span className={cn('truncate tabular-nums', !startValue && !endValue && 'text-muted-foreground')}>
                        {rangeLabel(startValue, endValue)}
                    </span>
                    <CalendarDays className="text-muted-foreground size-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="range"
                    captionLayout="dropdown"
                    numberOfMonths={2}
                    selected={selectedRange}
                    defaultMonth={selectedRange.from}
                    startMonth={DROPDOWN_START_MONTH}
                    endMonth={DROPDOWN_END_MONTH}
                    onSelect={(range) => {
                        onStartChange(toDateValue(range?.from));
                        onEndChange(toDateValue(range?.to));

                        if (range?.from && range?.to) {
                            setOpen(false);
                        }
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
