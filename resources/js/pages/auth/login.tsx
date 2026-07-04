import InputError from '@/components/input-error';
import { PasswordInput } from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, LockKeyhole } from 'lucide-react';
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

            <main className="flex min-h-svh items-center justify-center bg-slate-50 p-6 text-slate-950 dark:bg-slate-950 dark:text-white">
                <div className="w-full max-w-[520px]">
                    <section className="app-surface flex flex-col rounded-lg p-8 md:p-12">
                        <div className="flex items-center">
                            <div className="flex min-w-0 items-center gap-4">
                                <img src="/favicon.svg" alt="Finanxyra" className="size-14 shrink-0 rounded-[16px]" />
                                <div>
                                    <p className="text-lg leading-none font-semibold">Finanxyra</p>
                                    <p className="text-muted-foreground mt-1 text-sm whitespace-nowrap">Kelola Keuangan Keluarga</p>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center pt-10">
                            <div className="mb-8">
                                <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600 dark:bg-blue-950 dark:text-blue-200">
                                    <LockKeyhole className="size-6" />
                                </div>
                                <h2 className="text-3xl font-semibold tracking-normal">Masuk ke Finanxyra</h2>
                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                    Gunakan email dan password untuk membuka dashboard keuangan keluarga.
                                </p>
                            </div>

                            {status && (
                                <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
                                    {status}
                                </div>
                            )}

                            <form noValidate className="space-y-5" onSubmit={submit}>
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
