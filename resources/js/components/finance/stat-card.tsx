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
    sparkline?: number[];
}

const tones = {
    blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    red: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
    slate: 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
};

const lines = {
    blue: 'stroke-blue-500',
    green: 'stroke-emerald-500',
    red: 'stroke-rose-500',
    amber: 'stroke-amber-500',
    violet: 'stroke-violet-500',
    slate: 'stroke-slate-500',
};

export function StatCard({ title, value, description, icon: Icon, tone = 'slate', sparkline }: StatCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-start gap-3">
                    <div className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', tones[tone])}>
                        <Icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{title}</p>
                        <p className="mt-3 text-2xl font-semibold tracking-normal text-slate-950 dark:text-white">
                            <MoneyDisplay value={value} />
                        </p>
                        {description && <p className="text-muted-foreground mt-2 text-xs">{description}</p>}
                    </div>
                </div>
                <Sparkline data={sparkline} tone={tone} />
            </CardContent>
        </Card>
    );
}

function Sparkline({ data, tone }: { data?: number[]; tone: NonNullable<StatCardProps['tone']> }) {
    const points = data && data.length >= 2 ? data : [2, 3, 4, 4, 5, 5, 6, 6];
    const max = Math.max(...points);
    const min = Math.min(...points);
    const spread = max - min || 1;
    const path = points
        .map((value, index) => {
            const x = (index / (points.length - 1)) * 100;
            const y = 24 - ((value - min) / spread) * 18;

            return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');

    return (
        <svg className="mt-2 h-8 w-full" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
            <path d={path} fill="none" className={cn(lines[tone])} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
