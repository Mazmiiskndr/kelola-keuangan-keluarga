interface DateTimeDisplayProps {
    value?: string | null;
    fallback?: string;
}

export function formatDateTime(value?: string | null, fallback = '-'): string {
    if (!value) {
        return fallback;
    }

    const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00+07:00` : value;
    const date = new Date(normalizedValue);

    if (Number.isNaN(date.getTime())) {
        return fallback;
    }

    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        month: 'long',
        year: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    })
        .formatToParts(date)
        .reduce<Record<string, string>>((carry, part) => {
            carry[part.type] = part.value;

            return carry;
        }, {});

    return `${parts.month}-${parts.day}-${parts.year} ${parts.hour}:${parts.minute}:${parts.second}`;
}

export function DateTimeDisplay({ value, fallback = '-' }: DateTimeDisplayProps) {
    return <>{formatDateTime(value, fallback)}</>;
}
