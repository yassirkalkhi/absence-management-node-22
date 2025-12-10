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
import { getAllClasses, createClass, updateClass, deleteClass } from "@/services/classService";
import { ClassForm } from "@/components/forms/ClassForm";
import type { Class } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { getEnseignantById } from "@/services/teacherService";

export default function ClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingClass, setEditingClass] = useState<Class | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllClasses();
            setClasses(data);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des classes");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateClass = async (values: any) => {
        try {
            setIsSubmitting(true);
            if (editingClass) {
                await updateClass(editingClass._id, values);
                toast.success("Classe modifiée avec succès", {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                });
            } else {
                await createClass(values);
                toast.success("Classe créée avec succès", {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                });
            }
            setIsDialogOpen(false);
            setEditingClass(null);
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de l'enregistrement de la classe");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClass = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return;
        try {
            await deleteClass(id);
            toast.success("Classe supprimée", {
                duration: 5000,
                position: "top-right",
                style: {
                    background: "#4ade80",
                    color: "#fff",
                },
            });
            setClasses(classes.filter(c => c._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression de la classe");
        }
    };

    const openEditDialog = (classe: Class) => {
        setEditingClass(classe);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingClass(null);
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredClasses = classes.filter(classe =>
        classe.nom_classe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classe.niveau.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classe.departement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        classe.filiere.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Classes</h2>
                    <p className="text-muted-foreground">
                        Gérez les classes de l'établissement.
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingClass(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Ajouter une classe
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingClass ? "Modifier la classe" : "Ajouter une classe"}</DialogTitle>
                                <DialogDescription>
                                    {editingClass ? "Modifiez les informations de la classe." : "Remplissez le formulaire pour créer une nouvelle classe."}
                                </DialogDescription>
                            </DialogHeader>
                            <ClassForm
                                onSubmit={handleCreateOrUpdateClass}
                                defaultValues={editingClass || undefined}
                                isLoading={isSubmitting}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une classe..."
                        className="pl-8 w-full md:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des classes</CardTitle>
                    <CardDescription>
                        Toutes les classes enregistrées.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Chargement...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nom</TableHead>
                                    <TableHead>Niveau</TableHead>
                                    <TableHead>Département</TableHead>
                                    <TableHead>Filière</TableHead>
                                    {user?.role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredClasses.map((classe) => (
                                    <TableRow key={classe._id}>
                                        <TableCell className="font-medium">{classe.nom_classe}</TableCell>
                                        <TableCell>{classe.niveau}</TableCell>
                                        <TableCell>{classe.departement}</TableCell>
                                        <TableCell>{classe.filiere}</TableCell>
                                        {user?.role === 'admin' && (
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => openEditDialog(classe)}>
                                                    Modifier
                                                </Button>
                                                <Button variant="outline" className="text-red-500 hover:text-red-600" size="sm" onClick={() => handleDeleteClass(classe._id)}>
                                                    Supprimer
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {classes.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Aucune classe trouvée.
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
