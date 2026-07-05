import { MoneyDisplay } from '@/components/finance/money-display';
import { cn } from '@/lib/utils';
import { type MoneyValue } from '@/types/finance';

interface ProgressRowProps {
    label: string;
    value: MoneyValue;
    target: MoneyValue;
    tone?: 'blue' | 'green' | 'amber' | 'red';
    semantic?: 'budget' | 'saving';
}

const bars = {
    blue: 'bg-blue-600',
    green: 'bg-emerald-600',
    amber: 'bg-amber-500',
    red: 'bg-rose-600',
};

export function ProgressRow({ label, value, target, tone = 'blue', semantic }: ProgressRowProps) {
    const numericValue = Number(value ?? 0);
    const numericTarget = Number(target ?? 0);
    const percentage = numericTarget > 0 ? Math.min(100, Math.round((numericValue / numericTarget) * 100)) : 0;

    let finalTone = tone;
    if (semantic === 'budget') {
        if (percentage < 70) finalTone = 'green';
        else if (percentage < 90) finalTone = 'amber';
        else finalTone = 'red';
    } else if (semantic === 'saving') {
        if (percentage < 30) finalTone = 'red';
        else if (percentage < 70) finalTone = 'amber';
        else finalTone = 'green';
    }

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-800 dark:text-slate-100">{label}</span>
                <span className="text-muted-foreground">
                    <MoneyDisplay value={numericValue} compact /> / <MoneyDisplay value={numericTarget} compact />
                </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={cn('h-full rounded-full', bars[finalTone])} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}
