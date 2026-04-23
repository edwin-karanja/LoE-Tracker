import type { ComponentProps } from 'react';
import DashboardShowcase from '@/pages/Dashboard/index';
import { dashboard } from '@/routes';

type DashboardProps = ComponentProps<typeof DashboardShowcase>;

export default function Dashboard(props: DashboardProps) {
    return <DashboardShowcase {...props} />;
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
