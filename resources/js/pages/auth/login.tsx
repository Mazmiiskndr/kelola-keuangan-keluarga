import AppearanceToggleTab from '@/components/appearance-tabs';
import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { BarChart3, Bot, LoaderCircle, LockKeyhole, PiggyBank, ReceiptText, WalletCards } from 'lucide-react';
import { type FormEventHandler } from 'react';

interface LoginForm {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

const highlights = [
    { icon: WalletCards, label: 'Saldo per rekening' },
    { icon: ReceiptText, label: 'Transaksi dan hutang' },
    { icon: Bot, label: 'Rekomendasi AI' },
    { icon: BarChart3, label: 'Laporan keluarga' },
];

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login" />

            <main className="min-h-svh bg-slate-50 text-slate-950 dark:bg-neutral-950 dark:text-white">
                <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="relative hidden overflow-hidden border-r bg-slate-950 p-10 text-white lg:flex lg:flex-col">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.25),transparent_34%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.18),transparent_30%)]" />
                        <div className="relative z-10 flex items-center gap-3">
                            <div className="rounded-lg bg-white p-2 text-slate-950">
                                <PiggyBank className="size-6" />
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Kelola Keuangan Keluarga</p>
                                <p className="text-sm text-slate-300">Finance dashboard dengan AI insight</p>
                            </div>
                        </div>

                        <div className="relative z-10 mt-auto max-w-2xl">
                            <p className="text-sm font-medium tracking-wider text-teal-200 uppercase">Personal dan keluarga</p>
                            <h1 className="mt-4 text-5xl font-semibold tracking-normal">
                                Pantau uang keluar, hutang, tabungan, dan keputusan finansial.
                            </h1>
                            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                                Login untuk melihat dashboard modern, pencatatan rekening, laporan bulanan, target tabungan, dan rekomendasi
                                penghematan dari AI.
                            </p>
                            <div className="mt-8 grid gap-3 sm:grid-cols-2">
                                {highlights.map(({ icon: Icon, label }) => (
                                    <div key={label} className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur">
                                        <Icon className="size-5 text-teal-200" />
                                        <p className="mt-3 text-sm font-medium">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="flex min-h-svh flex-col px-6 py-6 md:px-10">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 lg:hidden">
                                <div className="rounded-lg bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
                                    <PiggyBank className="size-5" />
                                </div>
                                <div>
                                    <p className="font-semibold">Kelola Keuangan</p>
                                    <p className="text-muted-foreground text-xs">Keluarga</p>
                                </div>
                            </div>
                            <AppearanceToggleTab className="ml-auto" />
                        </div>

                        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
                            <div className="mb-8">
                                <div className="mb-4 inline-flex rounded-lg bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
                                    <LockKeyhole className="size-6" />
                                </div>
                                <h2 className="text-3xl font-semibold tracking-normal">Masuk ke akun</h2>
                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                    Gunakan email dan password untuk membuka dashboard keuangan. Mode terang dan gelap bisa diganti kapan saja.
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                                    {status}
                                </div>
                            )}

                            <form className="space-y-5" onSubmit={submit}>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="email"
                                        value={data.email}
                                        onChange={(event) => setData('email', event.target.value)}
                                        placeholder="test@example.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        {canResetPassword && (
                                            <TextLink href={route('password.request')} className="ml-auto text-sm" tabIndex={5}>
                                                Lupa password?
                                            </TextLink>
                                        )}
                                    </div>
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        value={data.password}
                                        onChange={(event) => setData('password', event.target.value)}
                                        placeholder="Password"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <div className="flex items-center space-x-3">
                                    <Checkbox
                                        id="remember"
                                        name="remember"
                                        tabIndex={3}
                                        checked={data.remember}
                                        onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                    />
                                    <Label htmlFor="remember">Ingat saya</Label>
                                </div>

                                <Button type="submit" className="w-full" tabIndex={4} disabled={processing}>
                                    {processing && <LoaderCircle className="size-4 animate-spin" />}
                                    Masuk
                                </Button>
                            </form>

                            <div className="text-muted-foreground mt-6 text-center text-sm">
                                Belum punya akun?{' '}
                                <TextLink href={route('register')} tabIndex={5}>
                                    Daftar
                                </TextLink>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}
