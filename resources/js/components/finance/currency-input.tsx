import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type ComponentProps } from 'react';

interface CurrencyInputProps extends Omit<ComponentProps<typeof Input>, 'type' | 'value' | 'onChange'> {
    value: string;
    onValueChange: (value: string) => void;
}

function normalizeCurrencyDigits(value: string): string {
    const normalized = value.trim().replace(/\s/g, '');
    const backendDecimal = normalized.match(/^(\d+)[,.]\d{1,2}$/);

    if (backendDecimal) {
        return backendDecimal[1];
    }

    return normalized.replace(/\D/g, '');
}

function formatThousands(value: string): string {
    const digits = normalizeCurrencyDigits(value);

    if (!digits) {
        return '';
    }

    return new Intl.NumberFormat('id-ID', {
        maximumFractionDigits: 0,
    }).format(Number(digits));
}

export function CurrencyInput({ value, onValueChange, className, placeholder = '0', ...props }: CurrencyInputProps) {
    return (
        <div className="relative">
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm font-medium">Rp.</span>
            <Input
                {...props}
                type="text"
                inputMode="numeric"
                value={formatThousands(value)}
                onChange={(event) => onValueChange(normalizeCurrencyDigits(event.target.value))}
                placeholder={placeholder}
                className={cn('pl-12 tabular-nums', className)}
            />
        </div>
    );
}
