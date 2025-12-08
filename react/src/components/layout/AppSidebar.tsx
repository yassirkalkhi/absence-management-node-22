import {
    Calendar,
    Home,
    Users,
    BookOpen,
    GraduationCap,
    FileCheck,
    AlertCircle,
    LogOut,
    User,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Admin menu items
const adminItems = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: Home,
    },
    {
        title: "Absences",
        url: "/absences",
        icon: AlertCircle,
    },
    {
        title: "Séances",
        url: "/seances",
        icon: Calendar,
    },
    {
        title: "Étudiants",
        url: "/etudiants",
        icon: GraduationCap,
    },
    {
        title: "Classes",
        url: "/classes",
        icon: Users,
    },
    {
        title: "Enseignants",
        url: "/enseignants",
        icon: Users,
    },
    {
        title: "Modules",
        url: "/modules",
        icon: BookOpen,
    },
    {
        title: "Justifications",
        url: "/justifications",
        icon: FileCheck,
    },
]

// Student menu items (limited access)
const studentItems = [
    {
        title: "Tableau de bord",
        url: "/",
        icon: Home,
    },
    {
        title: "Mes Absences",
        url: "/absences",
        icon: AlertCircle,
    },
    {
        title: "Mes Justifications",
        url: "/justifications",
        icon: FileCheck,
    },
]

export function AppSidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // Select menu items based on user role
    const items = user?.role === 'admin' ? adminItems : studentItems;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Sidebar variant="sidebar" collapsible="icon" className="pt-0">
            <SidebarContent>
                <SidebarGroup>
                    <div className="flex items-center justify-start px-2 py-4">
                        <img src="./logo.png" alt="Logo" className="w-32 h-16" />
                    </div>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <div className="flex flex-col gap-2 p-2">
                            <div className="flex items-center gap-2 px-2 py-1">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium truncate">
                                        {user?.nom} {user?.prenom}
                                    </p>
                                    <Badge
                                        variant={user?.role === 'admin' ? 'default' : 'secondary'}
                                        className="text-xs"
                                    >
                                        {user?.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                                    </Badge>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="w-full justify-start"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Déconnexion
                            </Button>
                        </div>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarFooter>
        </Sidebar>
    )
}

