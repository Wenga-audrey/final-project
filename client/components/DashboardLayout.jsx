import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import {
    Home,
    BookOpen,
    Users,
    Settings,
    LogOut,
    User,
    BarChart3,
    Shield,
    GraduationCap,
    Award,
    Calendar,
    MessageCircle,
    Brain,
    Moon,
    Sun,
    Bell,
} from '@/lib/icons';

const navigationItems = {
    learner: [
        { title: 'Dashboard', url: '/dashboard/learner', icon: Home },
        { title: 'Courses', url: '/courses', icon: BookOpen },
        { title: 'Study Calendar', url: '/study-calendar', icon: Calendar },
        { title: 'Achievements', url: '/achievements', icon: Award },
        { title: 'Forums', url: '/forums', icon: MessageCircle },
        { title: 'AI Assistant', url: '/ai-assistant', icon: Brain },
    ],
    instructor: [
        { title: 'Dashboard', url: '/dashboard/instructor', icon: Home },
        { title: 'My Courses', url: '/instructor/courses', icon: BookOpen },
        { title: 'Students', url: '/instructor/students', icon: Users },
        { title: 'Analytics', url: '/instructor/analytics', icon: BarChart3 },
        { title: 'Content Approval', url: '/instructor/content', icon: Shield },
    ],
    admin: [
        { title: 'Dashboard', url: '/dashboard/admin', icon: Home },
        { title: 'Users', url: '/admin/users', icon: Users },
        { title: 'Courses', url: '/admin/courses', icon: BookOpen },
        { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
        { title: 'Settings', url: '/admin/settings', icon: Settings },
    ],
    'super-admin': [
        { title: 'Dashboard', url: '/dashboard/super-admin', icon: Home },
        { title: 'Platform Overview', url: '/super-admin/overview', icon: BarChart3 },
        { title: 'User Management', url: '/super-admin/users', icon: Users },
        { title: 'Content Approval', url: '/super-admin/content', icon: Shield },
        { title: 'System Settings', url: '/super-admin/settings', icon: Settings },
    ],
};

export default function DashboardLayout({ children }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const userRole = user?.role || 'learner';
    const navItems = navigationItems[userRole] || navigationItems.learner;

    return (
        <SidebarProvider>
            <div className="flex min-h-screen w-full bg-gradient-to-br from-mindboost-light-green/20 to-white">
                <Sidebar className="border-r border-mindboost-light-green/30 bg-white/80 backdrop-blur-sm">
                    <SidebarHeader className="border-b border-mindboost-light-green/30 p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-xl flex items-center justify-center shadow-md">
                                <GraduationCap className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <span className="text-2xl font-black text-mindboost-dark-green">
                                    Mind<span className="text-mindboost-green">Boost</span>
                                </span>
                                <div className="text-xs text-mindboost-slate font-medium -mt-1">
                                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
                                </div>
                            </div>
                        </div>
                    </SidebarHeader>

                    <SidebarContent className="p-4">
                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navItems.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                asChild
                                                isActive={location.pathname === item.url}
                                                className="hover:bg-mindboost-light-green/50 data-[active=true]:bg-mindboost-green data-[active=true]:text-white rounded-xl mb-1 transition-all"
                                            >
                                                <Link to={item.url} className="flex items-center space-x-3 py-3">
                                                    <item.icon className="h-5 w-5" />
                                                    <span>{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>

                    <SidebarFooter className="border-t border-mindboost-light-green/30 p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-mindboost-green to-mindboost-dark-green rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                                    {user?.firstName?.[0] || 'U'}
                                </div>
                                <div className="hidden md:block">
                                    <div className="text-sm font-semibold text-mindboost-dark-green">
                                        {user?.firstName} {user?.lastName}
                                    </div>
                                    <Badge variant="secondary" className="text-xs bg-mindboost-light-green text-mindboost-green capitalize">
                                        {userRole.replace('-', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-mindboost-slate hover:text-red-600 hover:bg-red-50 rounded-full p-2"
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    </SidebarFooter>
                </Sidebar>

                <SidebarInset className="flex-1">
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-mindboost-light-green/30 bg-white/80 backdrop-blur-sm px-4">
                        <SidebarTrigger className="-ml-1" />
                        <div className="flex items-center space-x-4 ml-auto">
                            <Button variant="ghost" size="sm" className="text-mindboost-slate hover:text-mindboost-green rounded-full p-2">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-mindboost-slate hover:text-mindboost-green rounded-full p-2">
                                <Sun className="h-5 w-5" />
                            </Button>
                            <Button variant="ghost" size="sm" asChild className="text-mindboost-slate hover:text-mindboost-green rounded-full p-2">
                                <Link to="/settings">
                                    <Settings className="h-5 w-5" />
                                </Link>
                            </Button>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}