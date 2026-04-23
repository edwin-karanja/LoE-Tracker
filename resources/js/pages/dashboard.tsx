import DashboardShowcase from '@/pages/Dashboard/index';
import { dashboard } from '@/routes';

export default function Dashboard() {
    return <DashboardShowcase />;
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
