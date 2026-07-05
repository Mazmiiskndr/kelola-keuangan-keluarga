import { FinanceSelect } from '@/components/finance/finance-select';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { AlertCircle, CheckCircle2, LoaderCircle, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan AI',
        href: '/settings/ai',
    },
];

interface AiSettingsProps {
    ai_provider: string | null;
    ai_model: string | null;
    has_api_key: boolean;
    provider_options: ProviderOptions;
}

interface AiSettingsForm {
    ai_provider: string;
    ai_model: string;
    ai_api_key: string;
    verification_token: string;
    clear_api_key: boolean;
}

interface AiModelOption {
    value: string;
    label: string;
}

interface ProviderOption {
    label: string;
    default_model: string;
    models: AiModelOption[];
}

type ProviderOptions = Record<string, ProviderOption>;

interface AiTestResponse {
    success: boolean;
    message: string;
    provider: string;
    model: string;
    response_preview?: string | null;
    verification_token?: string;
}

interface TestResult {
    type: 'success' | 'error' | 'info';
    title: string;
    message: string;
    responsePreview?: string | null;
}

const MASKED_KEY = '****************';

function fieldSignature(provider: string, model: string, apiKey: string): string {
    return [provider, model, apiKey].join('|');
}

function axiosMessage(error: unknown): string {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;

    return (
        axiosError.response?.data?.errors?.ai_api_key?.[0] ||
        axiosError.response?.data?.errors?.verification_token?.[0] ||
        axiosError.response?.data?.message ||
        axiosError.message ||
        'Gagal terhubung ke AI'
    );
}

export default function AiSettings({ ai_provider, ai_model, has_api_key, provider_options }: AiSettingsProps) {
    const { flash } = usePage<SharedData>().props;
    const defaultProvider = provider_options[ai_provider || ''] ? (ai_provider as string) : 'gemini';
    const defaultModel =
        ai_model && provider_options[defaultProvider]?.models.some((model) => model.value === ai_model)
            ? ai_model
            : provider_options[defaultProvider]?.default_model;
    const { data, setData, put, transform, errors, processing } = useForm<AiSettingsForm>({
        ai_provider: defaultProvider,
        ai_model: defaultModel || '',
        ai_api_key: '',
        verification_token: '',
        clear_api_key: false,
    });

    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<TestResult | null>(null);
    const [verifiedSignature, setVerifiedSignature] = useState('');

    const providerOptions = useMemo(
        () => Object.entries(provider_options).map(([value, option]) => ({ value, label: option.label })),
        [provider_options],
    );
    const currentModelOptions = provider_options[data.ai_provider]?.models || [];
    const currentSignature = fieldSignature(data.ai_provider, data.ai_model, data.ai_api_key);
    const isVerified = Boolean(data.verification_token) && verifiedSignature === currentSignature;
    const canClearKey = has_api_key && data.clear_api_key;
    const hasApiKeyInput = data.ai_api_key.trim() !== '';
    const useStoredApiKey = has_api_key && !hasApiKeyInput && !data.clear_api_key;
    const hasApiKeyForSave = hasApiKeyInput || useStoredApiKey;
    const canSubmit = (hasApiKeyForSave || canClearKey) && !processing && !testing;

    function apiKeyForRequest(formData: AiSettingsForm = data): string {
        if (has_api_key && formData.ai_api_key.trim() === '' && !formData.clear_api_key) {
            return MASKED_KEY;
        }

        return formData.ai_api_key;
    }

    function clearVerification() {
        setData('verification_token', '');
        setVerifiedSignature('');
        setTestResult(null);
    }

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        if (!isVerified && !canClearKey) {
            setTestResult({
                type: 'info',
                title: 'Memvalidasi sebelum menyimpan',
                message: 'Server akan mengirim prompt uji ke AI sebelum pengaturan disimpan.',
            });
        }
        transform((formData) => ({
            ...formData,
            ai_api_key: apiKeyForRequest(formData),
        }));
        put(route('ai.update'), {
            preserveScroll: true,
            onError: () => {
                setTestResult({
                    type: 'error',
                    title: 'Pengaturan belum tersimpan',
                    message: 'Periksa kembali validasi form dan pastikan koneksi API sudah berhasil diuji.',
                });
            },
        });
    };

    const testConnection = async () => {
        setTesting(true);
        setTestResult(null);

        try {
            const response = await axios.post<AiTestResponse>(route('ai.test'), {
                ai_provider: data.ai_provider,
                ai_model: data.ai_model,
                ai_api_key: apiKeyForRequest(),
            });

            setData('verification_token', response.data.verification_token || '');
            setVerifiedSignature(currentSignature);
            setTestResult({
                type: 'success',
                title: 'Koneksi API valid',
                message: response.data?.message || 'API Key valid dan AI memberikan respons.',
                responsePreview: response.data?.response_preview,
            });
        } catch (error: unknown) {
            setData('verification_token', '');
            setVerifiedSignature('');
            setTestResult({
                type: 'error',
                title: 'Koneksi API gagal',
                message: axiosMessage(error),
            });
        } finally {
            setTesting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Pengaturan AI">
            <Head title="Pengaturan AI" />

            <SettingsLayout>
                <div className="app-surface space-y-6 rounded-lg p-6">
                    <HeadingSmall title="AI Insight" description="Konfigurasi API Key kustom Anda untuk fitur rekomendasi finansial berbasis AI." />

                    <form noValidate onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="ai_provider">Provider AI</Label>
                            <FinanceSelect
                                value={data.ai_provider}
                                onValueChange={(value) => {
                                    setData({
                                        ...data,
                                        ai_provider: value,
                                        ai_model: provider_options[value]?.default_model || '',
                                        verification_token: '',
                                    });
                                    setVerifiedSignature('');
                                    setTestResult(null);
                                }}
                                options={providerOptions}
                                placeholder="Pilih Provider"
                            />
                            <InputError className="mt-2" message={errors.ai_provider} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ai_model">Model</Label>
                            <FinanceSelect
                                value={data.ai_model}
                                onValueChange={(value) => {
                                    setData('ai_model', value);
                                    clearVerification();
                                }}
                                options={currentModelOptions}
                                placeholder="Pilih model"
                            />
                            <p className="text-muted-foreground text-xs">Pastikan model valid sesuai provider yang Anda pilih.</p>
                            <InputError className="mt-2" message={errors.ai_model} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ai_api_key">API Key</Label>
                            <Input
                                id="ai_api_key"
                                type="password"
                                className="mt-1 block w-full"
                                value={data.ai_api_key}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setData({
                                        ...data,
                                        ai_api_key: value,
                                        clear_api_key: false,
                                        verification_token: '',
                                    });
                                    setVerifiedSignature('');
                                    setTestResult(null);
                                }}
                                disabled={data.clear_api_key}
                                placeholder={has_api_key ? 'Kosong demi keamanan. Masukkan API Key baru jika ingin mengganti.' : 'Masukkan API Key'}
                            />
                            {has_api_key && !data.clear_api_key && (
                                <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                                    API Key sudah terdaftar. Kolom sengaja dikosongkan demi keamanan.
                                </div>
                            )}
                            {has_api_key && (
                                <label className="flex items-start gap-3 rounded-md border px-3 py-2 text-sm">
                                    <Checkbox
                                        checked={data.clear_api_key}
                                        onCheckedChange={(checked) => {
                                            setData({
                                                ...data,
                                                ai_api_key: '',
                                                clear_api_key: checked === true,
                                                verification_token: '',
                                            });
                                            setVerifiedSignature('');
                                            setTestResult(null);
                                        }}
                                    />
                                    <span className="leading-5">Hapus API Key tersimpan dari database.</span>
                                </label>
                            )}
                            <p className="text-muted-foreground text-xs">
                                Kunci disimpan terenkripsi dan hanya dipakai di server Laravel. Jika langsung disimpan, server tetap akan memvalidasi
                                koneksi AI terlebih dahulu.
                            </p>
                            <InputError className="mt-2" message={errors.ai_api_key} />
                            <InputError className="mt-2" message={errors.verification_token} />
                        </div>

                        {testing && (
                            <Alert className="border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
                                <LoaderCircle className="size-4 animate-spin" />
                                <AlertTitle>Mengirim prompt uji ke AI...</AlertTitle>
                                <AlertDescription>
                                    Server sedang memastikan API Key, provider, dan model benar-benar bisa menghasilkan respons.
                                </AlertDescription>
                            </Alert>
                        )}

                        {testResult && (
                            <Alert
                                className={
                                    testResult.type === 'success'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                                        : testResult.type === 'info'
                                          ? 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200'
                                          : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'
                                }
                            >
                                {testResult.type === 'success' ? (
                                    <CheckCircle2 className="size-4" />
                                ) : testResult.type === 'info' ? (
                                    <LoaderCircle className="size-4 animate-spin" />
                                ) : (
                                    <AlertCircle className="size-4" />
                                )}
                                <AlertTitle>{testResult.title}</AlertTitle>
                                <AlertDescription>
                                    {testResult.message}
                                    {testResult.responsePreview && (
                                        <span className="mt-1 block font-medium">AI merespons: {testResult.responsePreview}</span>
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}

                        {flash && (
                            <Alert
                                className={
                                    flash.type === 'success'
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200'
                                        : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200'
                                }
                            >
                                {flash.type === 'success' ? <ShieldCheck className="size-4" /> : <AlertCircle className="size-4" />}
                                <AlertTitle>{flash.title}</AlertTitle>
                                <AlertDescription>{flash.message}</AlertDescription>
                            </Alert>
                        )}

                        {canClearKey && (
                            <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
                                <AlertCircle className="size-4" />
                                <AlertTitle>API Key akan dihapus</AlertTitle>
                                <AlertDescription>
                                    Setelah disimpan, fitur AI akan memakai fallback sampai API Key baru berhasil diuji dan disimpan.
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Button disabled={!canSubmit} type="submit">
                                    Simpan Pengaturan
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={testConnection}
                                    disabled={testing || processing || (!hasApiKeyInput && !useStoredApiKey)}
                                >
                                    {testing && <LoaderCircle className="size-4 animate-spin" />}
                                    {testing ? 'Mengetes...' : 'Cek Koneksi API'}
                                </Button>
                            </div>

                            {!isVerified && hasApiKeyForSave && !canClearKey && (
                                <p className="text-muted-foreground max-w-xl min-w-0 text-sm leading-6 lg:flex-1">
                                    Opsional: cek koneksi dulu, atau langsung simpan untuk validasi otomatis.
                                </p>
                            )}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
