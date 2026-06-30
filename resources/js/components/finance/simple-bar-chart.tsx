import { MoneyDisplay } from '@/components/finance/money-display';

interface SimpleBarChartProps {
    data: Array<{ key?: string; label: string; income: number; expense: number }>;
}

export function SimpleBarChart({ data }: SimpleBarChartProps) {
    const max = Math.max(...data.flatMap((item) => [item.income, item.expense]), 1);

    return (
        <div className="flex h-64 items-end gap-4">
            {data.map((item, index) => (
                <div key={`${item.key ?? item.label}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                    <div className="flex h-48 w-full items-end justify-center gap-1">
                        <div
                            className="w-3 rounded-t bg-emerald-500"
                            title={`Pemasukan ${item.label}`}
                            style={{ height: `${Math.max(4, (item.income / max) * 100)}%` }}
                        />
                        <div
                            className="w-3 rounded-t bg-rose-500"
                            title={`Pengeluaran ${item.label}`}
                            style={{ height: `${Math.max(4, (item.expense / max) * 100)}%` }}
                        />
                    </div>
                    <span className="text-muted-foreground text-xs">{item.label}</span>
                    <span className="sr-only">
                        <MoneyDisplay value={item.income} /> pemasukan, <MoneyDisplay value={item.expense} /> pengeluaran
                    </span>
                </div>
            ))}
        </div>
    );
}
