import { Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarRange,
    HelpCircle,
    LayoutGrid,
    ShieldCheck,
} from 'lucide-react';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, helpCenter, myAllocations } from '@/routes';
import { dashboard as adminDashboard } from '@/routes/admin';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'LoE Tracker',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'My Allocations',
        href: myAllocations(),
        icon: CalendarRange,
    },
    // {
    //     title: 'History',
    //     href: dashboard(),
    //     icon: TimerReset,
    // },
];

const quickActionItems: NavItem[] = [
    // {
    //     title: 'Submit Weekly LoE',
    //     href: dashboard(),
    //     icon: Send,
    // },
    {
        title: 'Help Center',
        href: helpCenter(),
        icon: HelpCircle,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const currentPath = usePage().url.split('?')[0];
    const isCurrentItem = (href: NavItem['href']) =>
        currentPath === (typeof href === 'string' ? href : href.url);
    const adminNavItems: NavItem[] = auth.user?.is_admin
        ? [
              {
                  title: 'Admin',
                  href: adminDashboard(),
                  icon: ShieldCheck,
              },
          ]
        : [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="gap-4 px-3 py-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-auto items-start rounded-2xl border border-slate-200 bg-white px-3 py-3 hover:bg-slate-50 data-[active=true]:bg-slate-50"
                        >
                            <Link href={dashboard()} prefetch>
                                <div className="flex size-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                                    <LayoutGrid className="size-5" />
                                </div>
                                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                                    <span className="text-base font-semibold text-slate-900">
                                        LoE Tracker
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Contributor portal
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="gap-5 px-2">
                <SidebarGroup className="p-0">
                    <SidebarGroupLabel className="px-2 text-[0.7rem] font-semibold tracking-[0.24em] text-slate-500 uppercase">
                        Workspace
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[...mainNavItems, ...adminNavItems].map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={
                                            item.title === 'Admin'
                                                ? currentPath.startsWith('/admin')
                                                : isCurrentItem(item.href)
                                        }
                                        tooltip={{ children: item.title }}
                                        className="h-11 rounded-xl px-3 text-slate-600 hover:bg-slate-100 hover:text-slate-900 data-[active=true]:border data-[active=true]:border-slate-200 data-[active=true]:bg-white data-[active=true]:text-slate-900 data-[active=true]:shadow-sm"
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && (
                                                <item.icon className="size-4.5" />
                                            )}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup className="mt-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 mb-5">
                    <SidebarGroupLabel className="px-0 text-[0.7rem] font-semibold tracking-[0.24em] text-slate-500 uppercase">
                        Quick Actions
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {quickActionItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={{ children: item.title }}
                                        className="h-10 rounded-xl px-0 text-slate-600 hover:bg-transparent hover:text-slate-900"
                                    >
                                        <Link href={item.href} prefetch>
                                            {item.icon && (
                                                <item.icon className="size-4.5" />
                                            )}
                                            <span>{item.title}</span>
                                            <ArrowUpRight className="ml-auto size-4 opacity-60 group-data-[collapsible=icon]:hidden" />
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200 px-3 py-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
