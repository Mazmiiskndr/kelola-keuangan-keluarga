export function toFormString(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
}

export function toDateInputValue(value: string | null | undefined): string {
    if (!value) {
        return '';
    }

    return value.slice(0, 10);
}

function toLocalDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function currentMonthDateRange(): { start: string; end: string } {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return {
        start: toLocalDateValue(start),
        end: toLocalDateValue(end),
    };
}
