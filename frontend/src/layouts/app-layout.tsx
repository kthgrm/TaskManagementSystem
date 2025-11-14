import AppLayoutTemplate from '@/layouts/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl px-10 py-5 overflow-x-auto">{children}</div>
    </AppLayoutTemplate>
);
