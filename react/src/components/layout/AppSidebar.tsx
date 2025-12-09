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
    UserStar,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
} from "@/components/ui/sidebar"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button" 
 
const adminItems = [
    {
        title: "Tableau de bord",
        url: "/dashboard",
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
 
const studentItems = [
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
                        <div className="p-3 w-full space-y-3">
                            <div className="flex items-center gap-3 rounded-lg border p-3 bg-card">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                   {user?.role === "admin" ? <UserStar className="h-5 w-5 text-primary" /> : <User className="h-5 w-5 text-primary" />}
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <p className="font-semibold truncate text-sm">
                                        {user?.nom} {user?.prenom}
                                    </p>
                                     
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleLogout}
                                className="w-full "
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

