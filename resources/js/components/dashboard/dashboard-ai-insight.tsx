import { DateTimeDisplay } from '@/components/finance/date-display';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type AiRecommendation } from '@/types/finance';
import { Link } from '@inertiajs/react';
import { Activity, AlertCircle, ArrowRight, Bot, Lightbulb, Sparkles, Target, TrendingUp } from 'lucide-react';
import type React from 'react';
import { type DashboardAiAnalysis } from './dashboard-types';

interface DashboardAiInsightProps {
    analysis: DashboardAiAnalysis | null;
    configuredModelLabel: string;
}

const aiTypeIcons: Record<string, React.ReactNode> = {
    alert: <AlertCircle className="size-4 text-rose-500" />,
    opportunity: <Lightbulb className="size-4 text-emerald-500" />,
    habit: <TrendingUp className="size-4 text-cyan-500" />,
    goal: <Target className="size-4 text-teal-500" />,
    next_step: <ArrowRight className="size-4 text-indigo-500" />,
};

function poweredByLabel(analysis: DashboardAiAnalysis, configuredModelLabel: string): string {
    if (!analysis.model_name || analysis.model_name === 'deterministic-rules') {
        return configuredModelLabel;
    }

    return analysis.model_label || analysis.model_name;
}

export function DashboardAiInsight({ analysis, configuredModelLabel }: DashboardAiInsightProps) {
    const recommendations: AiRecommendation[] = analysis
        ? (analysis.aiRecommendations ?? analysis.ai_recommendations ?? analysis.recommendations ?? [])
        : [];

    if (!analysis) {
        return (
            <Card className="mt-8 flex flex-col items-center justify-center border-2 border-dashed bg-slate-50/50 p-8 text-center dark:bg-slate-900/50">
                <Bot className="mb-3 size-10 text-slate-300" />
                <h3 className="text-base font-medium">Belum Ada Analisis AI</h3>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                    Dapatkan insight dan panduan keuangan khusus untuk Anda dengan menjalankan analisis bulan ini.
                </p>
                <Button asChild className="mt-4 bg-indigo-600 hover:bg-indigo-700">
                    <Link href="/ai-insights">Mulai Analisis AI Sekarang</Link>
                </Button>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden border border-indigo-100/50 bg-gradient-to-br from-indigo-50/50 to-white shadow-md dark:border-indigo-900/50 dark:from-indigo-950/20 dark:to-slate-950">
            <div className="pointer-events-none absolute top-0 right-0 p-8 opacity-5">
                <Bot className="size-32" />
            </div>
            <CardHeader className="border-b border-indigo-100/50 bg-white/50 pb-3 dark:border-indigo-900/50 dark:bg-slate-900/50">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-xl text-indigo-950 dark:text-indigo-100">
                            Insight AI Terbaru <DateTimeDisplay value={analysis.period_start} dateOnly />
                        </CardTitle>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                            <Sparkles className="size-3" />
                            Powered by {poweredByLabel(analysis, configuredModelLabel)}
                        </p>
                    </div>
                    {analysis.health_score !== undefined && (
                        <div className="flex items-center gap-2 rounded-full border border-slate-200/50 bg-white/80 px-3 py-1.5 shadow-sm dark:border-slate-700/50 dark:bg-slate-800/80">
                            <Activity className="size-3.5 text-emerald-500" />
                            <span className="text-xs font-semibold">Score:</span>
                            <span
                                className={`text-xs font-bold ${analysis.health_score >= 70 ? 'text-emerald-600' : analysis.health_score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}
                            >
                                {analysis.health_score}/100
                            </span>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="relative z-10 grid gap-6 p-6 md:grid-cols-2">
                <div className="space-y-3">
                    <h3 className="text-lg leading-tight font-bold text-slate-900 dark:text-white">
                        {analysis.headline || 'Insight Keuangan Utama'}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{analysis.result_summary}</p>
                    <Button
                        asChild
                        variant="outline"
                        className="mt-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-800/50 dark:hover:bg-indigo-950/50"
                    >
                        <Link href="/ai-insights">
                            Lihat Detail Analisis Lengkap <ArrowRight className="ml-2 size-3" />
                        </Link>
                    </Button>
                </div>
                <div className="space-y-3">
                    <h4 className="mb-2 text-sm font-semibold tracking-wider text-slate-500 uppercase">Top Rekomendasi</h4>
                    {recommendations.slice(0, 2).map((recommendation) => (
                        <div
                            key={recommendation.id}
                            className="flex gap-3 rounded-lg border border-slate-100 bg-white/60 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                        >
                            <div className="h-fit shrink-0 rounded-md bg-slate-100 p-1.5 dark:bg-slate-800">
                                {aiTypeIcons[recommendation.type] || <Bot className="size-4 text-slate-500" />}
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{recommendation.title}</p>
                                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">{recommendation.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
