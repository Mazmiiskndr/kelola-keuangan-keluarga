import { DateTimeDisplay } from '@/components/finance/date-display';
import { MonthPickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AiAnalysis } from '@/types/finance';
import { Head, useForm } from '@inertiajs/react';
import { Bot, Activity, ArrowRight, Target, AlertCircle, Lightbulb, TrendingUp, Sparkles } from 'lucide-react';
import type React from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'AI Insight', href: '/ai-insights' }];

interface AiInsightsProps {
    analyses: AiAnalysis[];
}

const typeIcons: Record<string, React.ReactNode> = {
    alert: <AlertCircle className="size-4 text-rose-500" />,
    opportunity: <Lightbulb className="size-4 text-emerald-500" />,
    habit: <TrendingUp className="size-4 text-cyan-500" />,
    goal: <Target className="size-4 text-teal-500" />,
    next_step: <ArrowRight className="size-4 text-indigo-500" />,
};

export default function AiInsightsIndex({ analyses }: AiInsightsProps) {
    const form = useForm({ period: new Date().toISOString().slice(0, 7) });

    function submit(event: React.FormEvent) {
        event.preventDefault();
        form.post('/ai-insights', { preserveScroll: true });
    }

    function handleQuickAction(actionType: string) {
        window.alert(`Fitur ${actionType} sedang dalam pengembangan.`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="AI Insight">
            <Head title="AI Insight" />
            <div className="finance-page">
                <PageHeader
                    title="Financial Coach AI"
                    description="Dapatkan panduan keuangan personal dari AI berdasarkan data transaksi bulan ini."
                    icon={Bot}
                />
                <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
                    <div className="space-y-6">
                        <Card className="rounded-xl border-slate-200/60 shadow-sm dark:border-slate-800/60">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-lg">Analisis Baru</CardTitle>
                                <CardDescription>Pilih bulan untuk dianalisis</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form noValidate className="space-y-4" onSubmit={submit}>
                                    <div className="space-y-2">
                                        <Label>Bulan</Label>
                                        <MonthPickerInput value={form.data.period} onValueChange={(value) => form.setData('period', value)} />
                                        <FormError message={form.errors.period} />
                                    </div>
                                    <SubmitButton processing={form.processing} className="w-full">Analisis Sekarang</SubmitButton>
                                    <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                                        Data dijamin aman dan hanya digunakan untuk memberikan metrik rekomendasi.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {analyses.length === 0 ? (
                            <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/50">
                                <Bot className="size-12 text-slate-300 mb-4" />
                                <h3 className="font-medium text-lg">Belum Ada Analisis</h3>
                                <p className="text-slate-500 mt-2 max-w-sm">Mulai analisis data keuanganmu bulan ini untuk mendapatkan insight menarik dari AI.</p>
                            </Card>
                        ) : (
                            analyses.map((analysis) => {
                                const recommendations = analysis.aiRecommendations ?? analysis.recommendations ?? [];
                                
                                return (
                                    <div key={analysis.id} className="space-y-6">
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                                    Analisis <DateTimeDisplay value={analysis.period_start} dateOnly format="MMMM yyyy" />
                                                </h2>
                                                <p className="text-sm text-slate-500 mt-1">
                                                    {analysis.model_name || 'deterministic-rules'}
                                                </p>
                                            </div>
                                            {analysis.health_score !== undefined && (
                                                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border shadow-sm">
                                                    <Activity className="size-4 text-emerald-500" />
                                                    <span className="font-semibold text-sm">Health Score:</span>
                                                    <span className={`font-bold ${analysis.health_score >= 70 ? 'text-emerald-600' : analysis.health_score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                        {analysis.health_score}/100
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-sky-950/20">
                                            <CardContent className="p-8">
                                                <div className="flex items-start gap-4">
                                                    <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50">
                                                        <Sparkles className="size-6 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="space-y-2 flex-1">
                                                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                            {analysis.headline || 'Insight Keuangan Utama'}
                                                        </h3>
                                                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                                                            {analysis.result_summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            {recommendations.map((recommendation) => (
                                                <Card key={recommendation.id} className="h-full flex flex-col hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                                    <CardHeader className="pb-3">
                                                        <div className="flex justify-between items-start gap-2 mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-md">
                                                                    {typeIcons[recommendation.type] || <Bot className="size-4 text-slate-500" />}
                                                                </div>
                                                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                                                    {recommendation.type.replace('_', ' ')}
                                                                </span>
                                                            </div>
                                                            {recommendation.priority && (
                                                                <FinanceBadge value={recommendation.priority} />
                                                            )}
                                                        </div>
                                                        <CardTitle className="text-base leading-snug">{recommendation.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="flex-1 flex flex-col">
                                                        <div className="space-y-3 flex-1">
                                                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                                                {recommendation.description}
                                                            </p>
                                                            {recommendation.why_it_matters && (
                                                                <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm border border-slate-100 dark:border-slate-800">
                                                                    <span className="font-semibold block mb-1">Mengapa ini penting?</span>
                                                                    <span className="text-slate-600 dark:text-slate-400">{recommendation.why_it_matters}</span>
                                                                </div>
                                                            )}
                                                            {recommendation.estimated_saving_amount ? (
                                                                <p className="text-sm font-semibold flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                                                    <span>Potensi Hemat:</span>
                                                                    <MoneyDisplay value={recommendation.estimated_saving_amount} />
                                                                </p>
                                                            ) : null}
                                                        </div>
                                                        
                                                        {recommendation.next_action && (
                                                            <div className="mt-5 pt-4 border-t flex flex-col gap-3">
                                                                <p className="text-sm font-medium">Tindakan Lanjutan:</p>
                                                                <Button 
                                                                    variant="outline" 
                                                                    className="w-full justify-between hover:bg-slate-50 dark:hover:bg-slate-900"
                                                                    onClick={() => handleQuickAction(recommendation.next_action || '')}
                                                                >
                                                                    <span className="truncate">{recommendation.next_action}</span>
                                                                    <ArrowRight className="size-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
