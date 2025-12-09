import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { handleApiError } from "@/utils/apiUtils";
import { getAllModules, createModule, updateModule, deleteModule } from "@/services/moduleService";
import { ModuleForm } from "@/components/forms/ModuleForm";
import type { Module } from "@/types";

export default function ModulesPage() {
    const [modules, setModules] = useState<Module[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllModules();
            setModules(data);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des modules");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateModule = async (values: any) => {
        try {
            setIsSubmitting(true);
            if (editingModule) {
                await updateModule(editingModule._id, values);
                toast.success("Module modifié avec succès",
                    {
                        duration: 5000,
                        position: "top-right",
                        style: {
                            background: "#4ade80",
                            color: "#fff",
                        },
                    }
                );
            } else {
                await createModule(values);
                toast.success("Module créé avec succès",
                     {
                        duration: 5000,
                        position: "top-right",
                        style: {
                            background: "#4ade80",
                            color: "#fff",
                        },
                    }
                );
            }
            setIsDialogOpen(false);
            setEditingModule(null);
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de l'enregistrement du module");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteModule = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce module ?")) return;
        try {
            await deleteModule(id);
            toast.success("Module supprimé",
                {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                }
            );
            setModules(modules.filter(m => m._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression du module");
        }
    };

    const openEditDialog = (module: Module) => {
        setEditingModule(module);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingModule(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Modules</h2>
                    <p className="text-muted-foreground">
                        Gérez les modules d'enseignement.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingModule(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un module
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingModule ? "Modifier le module" : "Ajouter un module"}</DialogTitle>
                            <DialogDescription>
                                {editingModule ? "Modifiez les informations du module." : "Remplissez le formulaire pour créer un nouveau module."}
                            </DialogDescription>
                        </DialogHeader>
                        <ModuleForm
                            onSubmit={handleCreateOrUpdateModule}
                            defaultValues={editingModule || undefined}
                            isLoading={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un module..."
                        className="pl-8 w-full md:w-[300px]"
                    />
                </div> 
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des modules</CardTitle>
                    <CardDescription>
                        Tous les modules enseignés.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Chargement...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom du module</TableHead>
                                    <TableHead>Coefficient</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {modules.map((module) => (
                                    <TableRow key={module._id}>
                                        <TableCell className="font-medium">{module.nom_module}</TableCell>
                                        <TableCell>{module.coefficient}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(module)}>
                                                Modifier
                                            </Button>
                                            <Button variant="outline" className="outline text-red-500 hover:text-red-600" size="sm" onClick={() => handleDeleteModule(module._id)}>
                                                Supprimer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {modules.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                                            Aucun module trouvé.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
