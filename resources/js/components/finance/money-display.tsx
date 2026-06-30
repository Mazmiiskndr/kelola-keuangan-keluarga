import { cn } from '@/lib/utils';
import { type MoneyValue } from '@/types/finance';

interface MoneyDisplayProps {
    value: MoneyValue;
    className?: string;
    compact?: boolean;
}

export function formatMoney(value: MoneyValue, compact = false): string {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
        notation: compact ? 'compact' : 'standard',
    }).format(amount);
}

export function MoneyDisplay({ value, className, compact = false }: MoneyDisplayProps) {
    return <span className={cn('tabular-nums', className)}>{formatMoney(value, compact)}</span>;
}
