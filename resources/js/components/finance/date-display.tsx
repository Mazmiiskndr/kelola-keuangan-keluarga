interface DateTimeDisplayProps {
    value?: string | null;
    fallback?: string;
    dateOnly?: boolean;
    timeSource?: string | null;
}

const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;
const jakartaTimeZone = 'Asia/Jakarta';

function isDateOnly(value: string): boolean {
    return dateOnlyPattern.test(value);
}

function dateFromValue(value: string): Date {
    return new Date(isDateOnly(value) ? `${value}T00:00:00+07:00` : value);
}

function formatDateOnly(value: string, fallback: string): string {
    const date = dateFromValue(value);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    const parts = new Intl.DateTimeFormat('id-ID', {
        timeZone: jakartaTimeZone,
        month: 'long',
        year: '2-digit',
        day: '2-digit',
    })
        .formatToParts(date)
        .reduce<Record<string, string>>((carry, part) => {
            carry[part.type] = part.value;

            return carry;
        }, {});

    return `${parts.day} ${parts.month} ${parts.year}`;
}

function dateWithJakartaTime(value: string, timeSource?: string | null): Date | null {
    if (!timeSource) {
        return null;
    }

    const valueDate = dateFromValue(value);
    const sourceDate = new Date(timeSource);

    if (Number.isNaN(valueDate.getTime()) || Number.isNaN(sourceDate.getTime())) {
        return null;
    }

    const dateParts = new Intl.DateTimeFormat('id-ID', {
        timeZone: jakartaTimeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    })
        .formatToParts(valueDate)
        .reduce<Record<string, string>>((carry, part) => {
            carry[part.type] = part.value;

            return carry;
        }, {});

    const timeParts = new Intl.DateTimeFormat('id-ID', {
        timeZone: jakartaTimeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    })
        .formatToParts(sourceDate)
        .reduce<Record<string, string>>((carry, part) => {
            carry[part.type] = part.value;

            return carry;
        }, {});

    const date = new Date(`${dateParts.year}-${dateParts.month}-${dateParts.day}T${timeParts.hour}:${timeParts.minute}:${timeParts.second}+07:00`);

    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(date: Date, fallback: string): string {
    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    const parts = new Intl.DateTimeFormat('id-ID', {
        timeZone: jakartaTimeZone,
        month: 'long',
        year: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hourCycle: 'h23',
    })
        .formatToParts(date)
        .reduce<Record<string, string>>((carry, part) => {
            carry[part.type] = part.value;

            return carry;
        }, {});

    return `${parts.day} ${parts.month} ${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function formatDateTime(value?: string | null, fallback = '-', timeSource?: string | null, dateOnly = false): string {
    if (!value) {
        return fallback;
    }

    if (timeSource) {
        const dateWithTime = dateWithJakartaTime(value, timeSource);

        if (dateWithTime) {
            return formatDate(dateWithTime, fallback);
        }
    }

    if (dateOnly || isDateOnly(value)) {
        return formatDateOnly(value, fallback);
    }

    return formatDate(new Date(value), fallback);
}

export function DateTimeDisplay({ value, fallback = '-', dateOnly = false, timeSource }: DateTimeDisplayProps) {
    return <>{formatDateTime(value, fallback, timeSource, dateOnly)}</>;
}
