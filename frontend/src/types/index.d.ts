export interface BreadcrumbItem {
    title: string;
    href: string;
}

type AuditLog = {
    id: number;
    user: string;
    action: string;
    resource: 'user' | 'project' | 'task' | 'system';
    resourceName: string;
    description: string;
    timestamp: string;
};