import { Head } from '@inertiajs/react';

import AppearanceTabs from '@/components/appearance-tabs';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem } from '@/types';

import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Pengaturan',
        href: '/settings/appearance',
    },
];

export default function Appearance() {
    return (
        <AppLayout breadcrumbs={breadcrumbs} pageTitle="Pengaturan">
            <Head title="Pengaturan Tampilan" />

            <SettingsLayout>
                <div className="app-surface space-y-6 rounded-lg p-6">
                    <HeadingSmall title="Tampilan" description="Atur mode terang, gelap, atau mengikuti sistem." />
                    <AppearanceTabs />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
