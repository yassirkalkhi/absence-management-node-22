import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Outlet } from "react-router-dom"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import { Badge } from "@/components/ui/badge"

export default function DashboardLayout() {
    const { user } = useAuth();

    return (
        <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 w-full flex flex-col h-screen overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="#">Application</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Dashboard</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="hidden sm:flex flex-col">
                            <span className="text-sm font-medium">{user?.nom} {user?.prenom}</span>
                            <Badge
                                variant={user?.role === 'admin' ? 'default' : 'secondary'}
                                className="text-xs w-fit"
                            >
                                {user?.role === 'admin' ? 'Admin' : 'Étudiant'}
                            </Badge>
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 bg-muted/20">
                    <Outlet />
                </div>
            </main>
            <Toaster />
        </SidebarProvider>
    )
}


