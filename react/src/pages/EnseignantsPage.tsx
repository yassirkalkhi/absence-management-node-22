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
import { getAllTeachers, createTeacher, updateTeacher, deleteTeacher } from "@/services/teacherService";
import { TeacherForm } from "@/components/forms/TeacherForm";
import type { Teacher } from "@/types";

export default function EnseignantsPage() {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getAllTeachers();
            setTeachers(data);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des enseignants");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateTeacher = async (values: any) => {
        try {
            setIsSubmitting(true);

            const payload = { ...values };
            if (!payload.password) {
                delete payload.password;
            }

            if (editingTeacher) {
                await updateTeacher(editingTeacher._id, payload);
                toast.success("Enseignant modifié avec succès",
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
                if (!payload.password) {
                    toast.error("Le mot de passe est requis pour la création",
                        {
                            duration: 5000,
                            position: "top-right",
                            style: {
                                background: "#4ade80",
                                color: "#fff",
                            },
                        }
                    );
                    setIsSubmitting(false);
                    return;
                }
                await createTeacher({ ...payload, classes: [] });
                toast.success("Enseignant ajouté avec succès",
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
            setEditingTeacher(null);
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de l'enregistrement de l'enseignant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTeacher = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet enseignant ?")) return;
        try {
            await deleteTeacher(id);
            toast.success("Enseignant supprimé",
                {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                }
            );
            setTeachers(teachers.filter(t => t._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression de l'enseignant");
        }
    };

    const openEditDialog = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingTeacher(null);
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredTeachers = teachers.filter(teacher =>
        teacher.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.telephone.includes(searchQuery)
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Enseignants</h2>
                    <p className="text-muted-foreground">
                        Gérez le corps enseignant.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingTeacher(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un enseignant
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingTeacher ? "Modifier l'enseignant" : "Ajouter un enseignant"}</DialogTitle>
                            <DialogDescription>
                                {editingTeacher ? "Modifiez les informations de l'enseignant." : "Remplissez le formulaire pour ajouter un nouvel enseignant."}
                            </DialogDescription>
                        </DialogHeader>
                        <TeacherForm
                            onSubmit={handleCreateOrUpdateTeacher}
                            defaultValues={editingTeacher || undefined}
                            isLoading={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un enseignant..."
                        className="pl-8 w-full md:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des enseignants</CardTitle>
                    <CardDescription>
                        Tous les enseignants enregistrés.
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
                                    <TableHead>Prénom</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Téléphone</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredTeachers.map((teacher) => (
                                    <TableRow key={teacher._id}>
                                        <TableCell className="font-medium">{teacher.nom}</TableCell>
                                        <TableCell>{teacher.prenom}</TableCell>
                                        <TableCell>{teacher.email}</TableCell>
                                        <TableCell>{teacher.telephone}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(teacher)}>
                                                Modifier
                                            </Button>
                                            <Button variant="outline" className="text-red-500 hover:text-red-600" size="sm" onClick={() => handleDeleteTeacher(teacher._id)}>
                                                Supprimer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {teachers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Aucun enseignant trouvé.
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
