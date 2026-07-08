import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useState, useRef } from 'react';
import { Loader2, RefreshCw, LogOut, CheckCircle2, AlertTriangle, XCircle, QrCode } from 'lucide-react';
import axios from 'axios';
import { type BreadcrumbItem, type SharedData } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan WhatsApp',
        href: '/settings/whatsapp',
    },
];

interface GatewayStatus {
    ok: boolean;
    provider: string;
    state: string;
    qr_data_url: string | null;
    phone: string | null;
    message: string | null;
    updated_at: string | null;
}

export default function WhatsAppSettings() {
    const { auth } = usePage<SharedData>().props;
    const [status, setStatus] = useState<GatewayStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, patch, processing, recentlySuccessful, errors } = useForm({
        whatsapp_number: auth.user.whatsapp_number || '',
    });

    const fetchStatus = async () => {
        try {
            const response = await axios.get('/settings/whatsapp/status');
            setStatus(response.data);
        } catch (error) {
            console.error('Error fetching WhatsApp status:', error);
            setStatus({
                ok: false,
                provider: 'unknown',
                state: 'unavailable',
                qr_data_url: null,
                phone: null,
                message: 'Gagal mengambil status gateway.',
                updated_at: null,
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Start polling if not ready or unavailable
        pollingRef.current = setInterval(() => {
            if (status && status.state !== 'ready' && status.state !== 'unavailable') {
                fetchStatus();
            }
        }, 3000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [status?.state]);

    const submitNumber: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('whatsapp.update'), {
            preserveScroll: true,
        });
    };

    const handleLogout = async () => {
        if (!confirm('Yakin ingin memutuskan koneksi WhatsApp ini?')) return;
        setLoading(true);
        try {
            await axios.post('/settings/whatsapp/logout');
            alert('Koneksi WhatsApp berhasil diputus.');
            fetchStatus();
        } catch (error) {
            alert('Gagal memutuskan koneksi WhatsApp.');
            setLoading(false);
        }
    };

    const handleRestart = async () => {
        setLoading(true);
        try {
            await axios.post('/settings/whatsapp/restart');
            alert('Restart gateway berhasil.');
            fetchStatus();
        } catch (error) {
            alert('Gagal merestart gateway.');
            setLoading(false);
        }
    };

    const renderStatusBadge = () => {
        if (!status) return null;

        const baseClass = "flex items-center gap-2 rounded-md px-3 py-1 text-sm font-medium border";
        
        if (status.state === 'ready') {
            return (
                <div className={`${baseClass} border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300`}>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Terhubung</span>
                </div>
            );
        }
        
        if (status.state === 'unavailable') {
             return (
                <div className={`${baseClass} border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300`}>
                    <XCircle className="h-4 w-4" />
                    <span>Gateway Tidak Tersedia</span>
                </div>
            );
        }

        if (status.state === 'disconnected' || status.state === 'auth_failure') {
            return (
               <div className={`${baseClass} border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300`}>
                   <AlertTriangle className="h-4 w-4" />
                   <span>Terputus</span>
               </div>
           );
       }

        if (status.state === 'qr') {
             return (
                <div className={`${baseClass} border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300`}>
                    <QrCode className="h-4 w-4" />
                    <span>Menunggu Scan QR</span>
                </div>
            );
        }

        return (
            <div className={`${baseClass} border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300`}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memuat...</span>
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="WhatsApp Settings">
            <SettingsLayout>
                <Head title="WhatsApp Settings" />

                <div className="flex flex-col gap-6 w-full max-w-xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Status Gateway WhatsApp</CardTitle>
                        <CardDescription>
                            Kelola koneksi bot WhatsApp keluarga Anda. Bot ini digunakan untuk mencatat pengeluaran via chat dan mengirim notifikasi.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status Koneksi</span>
                            {loading && !status ? (
                                <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                            ) : (
                                renderStatusBadge()
                            )}
                        </div>

                        {!loading && status && status.state === 'ready' && (
                            <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    Bot aktif dan terhubung dengan nomor: <strong>{status.phone}</strong>
                                </p>
                            </div>
                        )}

                        {!loading && status && status.state === 'qr' && status.qr_data_url && (
                            <div className="flex flex-col items-center justify-center space-y-4 rounded-lg border bg-slate-50 p-6 dark:bg-slate-900">
                                <div className="rounded-xl bg-white p-4 shadow-sm">
                                    <img src={status.qr_data_url} alt="WhatsApp QR Code" className="h-64 w-64" />
                                </div>
                                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                                    Buka WhatsApp di HP Anda, buka pengaturan perangkat tertaut, dan scan QR code ini.
                                </p>
                            </div>
                        )}

                        {!loading && status && (status.state === 'disconnected' || status.state === 'auth_failure') && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/50">
                                <p className="text-sm text-red-700 dark:text-red-400">
                                    Koneksi terputus atau gagal autentikasi. Silakan restart gateway untuk mendapatkan QR code baru.
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={handleRestart}
                                disabled={loading}
                                className="flex-1"
                            >
                                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh / Restart
                            </Button>
                            
                            {status && (status.state === 'ready' || status.state === 'disconnected' || status.state === 'auth_failure') && (
                                <Button 
                                    variant="destructive" 
                                    onClick={handleLogout}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Putuskan Koneksi
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Nomor WhatsApp Pribadi</CardTitle>
                        <CardDescription>
                            Nomor ini digunakan untuk mengenali Anda saat mengirim pesan ke bot WhatsApp keluarga.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitNumber} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="whatsapp_number">Nomor WhatsApp</Label>
                                <Input
                                    id="whatsapp_number"
                                    type="text"
                                    placeholder="Contoh: 08123456789"
                                    value={data.whatsapp_number}
                                    onChange={(e) => setData('whatsapp_number', e.target.value)}
                                    className={errors.whatsapp_number ? 'border-red-500' : ''}
                                />
                                {errors.whatsapp_number && (
                                    <p className="text-sm text-red-500">{errors.whatsapp_number}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing}>Simpan Nomor</Button>

                                {recentlySuccessful && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Berhasil disimpan.</p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </SettingsLayout>
        </AppLayout>
    );
}
