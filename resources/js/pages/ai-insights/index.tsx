import { DateTimeDisplay } from '@/components/finance/date-display';
import { MonthPickerInput } from '@/components/finance/date-picker-input';
import { FinanceBadge } from '@/components/finance/finance-badge';
import { FormError } from '@/components/finance/form-error';
import { MoneyDisplay } from '@/components/finance/money-display';
import { PageHeader, SubmitButton } from '@/components/finance/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { type AiAnalysis } from '@/types/finance';
import { Head, useForm } from '@inertiajs/react';
import { Activity, AlertCircle, ArrowRight, Bot, Lightbulb, Sparkles, Target, TrendingUp } from 'lucide-react';
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

const modelLabels: Record<string, string> = {
    'gemini-2.5-flash': 'Gemini 2.5 Flash',
    'gemini-3-flash-preview': 'Gemini 3 Flash Preview',
    'gemini-3.5-flash': 'Gemini 3.5 Flash',
    'gemini-3.1-pro-preview': 'Gemini 3.1 Pro Preview',
    'gemini-2.5-pro': 'Gemini 2.5 Pro',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4o': 'GPT-4o',
    'o1-mini': 'o1 Mini',
    'o3-mini': 'o3 Mini',
    'claude-3-5-haiku-latest': 'Claude 3.5 Haiku',
    'claude-3-5-sonnet-latest': 'Claude 3.5 Sonnet',
    'deterministic-rules': 'Deterministic Rules',
};

function modelDisplayName(modelName?: string | null): string {
    const model = modelName?.split(':').pop() || 'deterministic-rules';

    return modelLabels[model] || model;
}

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
                                    <SubmitButton processing={form.processing} className="w-full">
                                        Analisis Sekarang
                                    </SubmitButton>
                                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                                        Data dijamin aman dan hanya digunakan untuk memberikan metrik rekomendasi.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {analyses.length === 0 ? (
                            <Card className="flex flex-col items-center justify-center border-2 border-dashed bg-slate-50/50 p-12 text-center dark:bg-slate-900/50">
                                <Bot className="mb-4 size-12 text-slate-300" />
                                <h3 className="text-lg font-medium">Belum Ada Analisis</h3>
                                <p className="mt-2 max-w-sm text-slate-500">
                                    Mulai analisis data keuanganmu bulan ini untuk mendapatkan insight menarik dari AI.
                                </p>
                            </Card>
                        ) : (
                            analyses.map((analysis) => {
                                const recommendations = analysis.aiRecommendations ?? analysis.recommendations ?? [];

                                return (
                                    <div key={analysis.id} className="space-y-6">
                                        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                            <div>
                                                <h2 className="flex items-center gap-2 text-xl font-semibold">
                                                    Analisis <DateTimeDisplay value={analysis.period_start} dateOnly format="MMMM yyyy" />
                                                </h2>
                                                <div className="border-input mt-2 inline-flex min-h-10 items-center rounded-md border bg-white px-3 text-base text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white">
                                                    {modelDisplayName(analysis.model_name)}
                                                </div>
                                            </div>
                                            {analysis.health_score !== undefined && (
                                                <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm dark:bg-slate-900">
                                                    <Activity className="size-4 text-emerald-500" />
                                                    <span className="text-sm font-semibold">Health Score:</span>
                                                    <span
                                                        className={`font-bold ${analysis.health_score >= 70 ? 'text-emerald-600' : analysis.health_score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}
                                                    >
                                                        {analysis.health_score}/100
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-50 via-white to-sky-50 shadow-md dark:from-indigo-950/40 dark:via-slate-900 dark:to-sky-950/20">
                                            <CardContent className="p-8">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-2xl border border-indigo-100 bg-white p-3 shadow-sm dark:border-indigo-900/50 dark:bg-slate-800">
                                                        <Sparkles className="size-6 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                                                            {analysis.headline || 'Insight Keuangan Utama'}
                                                        </h3>
                                                        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
                                                            {analysis.result_summary}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            {recommendations.map((recommendation, index) => {
                                                const shouldFillLastRow = recommendations.length % 2 === 1 && index === recommendations.length - 1;

                                                return (
                                                    <Card
                                                        key={recommendation.id}
                                                        className={`flex h-full flex-col transition-colors hover:border-slate-300 dark:hover:border-slate-700 ${
                                                            shouldFillLastRow ? 'md:col-span-2' : ''
                                                        }`}
                                                    >
                                                        <CardHeader className="pb-3">
                                                            <div className="mb-2 flex items-start justify-between gap-2">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="rounded-md bg-slate-100 p-1.5 dark:bg-slate-800">
                                                                        {typeIcons[recommendation.type] || <Bot className="size-4 text-slate-500" />}
                                                                    </div>
                                                                    <span className="text-xs font-medium tracking-wider text-slate-500 uppercase">
                                                                        {recommendation.type.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                                {recommendation.priority && <FinanceBadge value={recommendation.priority} />}
                                                            </div>
                                                            <CardTitle className="text-base leading-snug">{recommendation.title}</CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="flex flex-1 flex-col">
                                                            <div className="flex-1 space-y-3">
                                                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                                                    {recommendation.description}
                                                                </p>
                                                                {recommendation.why_it_matters && (
                                                                    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/50">
                                                                        <span className="mb-1 block font-semibold">Mengapa ini penting?</span>
                                                                        <span className="text-slate-600 dark:text-slate-400">
                                                                            {recommendation.why_it_matters}
                                                                        </span>
                                                                    </div>
                                                                )}
                                                                {recommendation.estimated_saving_amount ? (
                                                                    <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                                        <span>Potensi Hemat:</span>
                                                                        <MoneyDisplay value={recommendation.estimated_saving_amount} />
                                                                    </p>
                                                                ) : null}
                                                            </div>

                                                            {recommendation.next_action && (
                                                                <div className="mt-5 flex flex-col gap-3 border-t pt-4">
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
                                                );
                                            })}
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
