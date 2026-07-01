import { formatMoney } from '@/components/finance/money-display';
import { useId } from 'react';

interface SimpleBarChartProps {
    data: Array<{ key?: string; label: string; income: number; expense: number }>;
}

type TrendPoint = {
    x: number;
    y: number;
    label: string;
    value: number;
};

const chart = {
    width: 720,
    height: 300,
    top: 22,
    right: 28,
    bottom: 54,
    left: 82,
};

const plotWidth = chart.width - chart.left - chart.right;
const plotHeight = chart.height - chart.top - chart.bottom;
const tickRatios = [1, 0.75, 0.5, 0.25, 0];

export function SimpleBarChart({ data }: SimpleBarChartProps) {
    const incomeGradientId = useId();
    const expenseGradientId = useId();
    const maxValue = Math.max(...data.flatMap((item) => [Number(item.income), Number(item.expense)]), 1);
    const scaleMax = Math.max(1, Math.ceil(maxValue / 100000) * 100000);
    const baselineY = chart.top + plotHeight;
    const incomePoints = toPoints(data, 'income', scaleMax);
    const expensePoints = toPoints(data, 'expense', scaleMax);

    return (
        <div className="w-full">
            <div className="h-72 w-full overflow-hidden">
                <svg className="h-full w-full" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Tren pemasukan dan pengeluaran">
                    <defs>
                        <linearGradient id={incomeGradientId} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                        <linearGradient id={expenseGradientId} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {tickRatios.map((ratio) => {
                        const y = chart.top + plotHeight * (1 - ratio);
                        const value = scaleMax * ratio;

                        return (
                            <g key={ratio}>
                                <line
                                    x1={chart.left}
                                    x2={chart.width - chart.right}
                                    y1={y}
                                    y2={y}
                                    className="stroke-slate-200 dark:stroke-slate-800"
                                    strokeDasharray={ratio === 0 ? undefined : '4 6'}
                                />
                                <text x={chart.left - 12} y={y + 4} textAnchor="end" className="fill-slate-500 text-[11px] dark:fill-slate-400">
                                    {formatMoney(value, true)}
                                </text>
                            </g>
                        );
                    })}

                    <line
                        x1={chart.left}
                        x2={chart.left}
                        y1={chart.top}
                        y2={baselineY}
                        className="stroke-slate-200 dark:stroke-slate-800"
                    />

                    {data.map((item, index) => (
                        <text
                            key={`${item.key ?? item.label}-${index}`}
                            x={xForIndex(index, data.length)}
                            y={chart.height - 18}
                            textAnchor="middle"
                            className="fill-slate-500 text-[12px] dark:fill-slate-400"
                        >
                            {item.label}
                        </text>
                    ))}

                    <path d={areaPath(incomePoints, baselineY)} fill={`url(#${incomeGradientId})`} />
                    <path d={areaPath(expensePoints, baselineY)} fill={`url(#${expenseGradientId})`} />
                    <path d={linePath(incomePoints)} fill="none" stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                    <path d={linePath(expensePoints)} fill="none" stroke="#f43f5e" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />

                    {incomePoints.map((point, index) => (
                        <circle key={`income-${point.label}-${index}`} cx={point.x} cy={point.y} r="5" fill="#10b981" stroke="white" strokeWidth="3">
                            <title>{`Pemasukan ${point.label}: ${formatMoney(point.value)}`}</title>
                        </circle>
                    ))}
                    {expensePoints.map((point, index) => (
                        <circle key={`expense-${point.label}-${index}`} cx={point.x} cy={point.y} r="5" fill="#f43f5e" stroke="white" strokeWidth="3">
                            <title>{`Pengeluaran ${point.label}: ${formatMoney(point.value)}`}</title>
                        </circle>
                    ))}
                </svg>
            </div>
        </div>
    );
}

function toPoints(data: SimpleBarChartProps['data'], key: 'income' | 'expense', scaleMax: number): TrendPoint[] {
    return data.map((item, index) => {
        const value = Number(item[key] ?? 0);

        return {
            x: xForIndex(index, data.length),
            y: chart.top + plotHeight - (value / scaleMax) * plotHeight,
            label: item.label,
            value,
        };
    });
}

function xForIndex(index: number, length: number): number {
    if (length <= 1) {
        return chart.left + plotWidth / 2;
    }

    return chart.left + (plotWidth / (length - 1)) * index;
}

function linePath(points: TrendPoint[]): string {
    return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function areaPath(points: TrendPoint[], baselineY: number): string {
    if (points.length === 0) {
        return '';
    }

    return `${linePath(points)} L ${points[points.length - 1].x} ${baselineY} L ${points[0].x} ${baselineY} Z`;
}
