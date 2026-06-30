import { MoneyDisplay } from '@/components/finance/money-display';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type MoneyValue } from '@/types/finance';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: MoneyValue;
    description?: string;
    icon: LucideIcon;
    tone?: 'blue' | 'green' | 'red' | 'amber' | 'violet' | 'slate';
}

const tones = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    slate: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

export function StatCard({ title, value, description, icon: Icon, tone = 'slate' }: StatCardProps) {
    return (
        <Card className="overflow-hidden rounded-lg border-slate-200 shadow-sm dark:border-slate-800">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-muted-foreground text-xs font-medium">{title}</p>
                        <p className="mt-2 text-xl font-semibold tracking-normal text-slate-950 dark:text-white">
                            <MoneyDisplay value={value} compact />
                        </p>
                    </div>
                    <div className={cn('rounded-md p-2', tones[tone])}>
                        <Icon className="size-4" />
                    </div>
                </div>
                {description && <p className="text-muted-foreground mt-3 text-xs">{description}</p>}
            </CardContent>
        </Card>
    );
}
