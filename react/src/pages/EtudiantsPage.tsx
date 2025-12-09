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
import { getAllStudents, createStudent, updateStudent, deleteStudent } from "@/services/studentService";
import { getAllClasses } from "@/services/classService";
import { StudentForm } from "@/components/forms/StudentForm";
import type { Student, Class } from "@/types";

export default function EtudiantsPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [studentsData, classesData] = await Promise.all([
                getAllStudents(),
                getAllClasses()
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateStudent = async (values: any) => {
        try {
            setIsSubmitting(true);
            if (editingStudent) {
                await updateStudent(editingStudent._id, values);
                toast.success("Étudiant modifié avec succès",
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
                await createStudent(values);
                toast.success("Étudiant créé avec succès",
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
            setEditingStudent(null);
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de l'enregistrement de l'étudiant");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteStudent = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) return;
        try {
            await deleteStudent(id);
            toast.success("Étudiant supprimé",
                {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                }
            );
            setStudents(students.filter(s => s._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression de l'étudiant");
        }
    };

    const openEditDialog = (student: Student) => {
        setEditingStudent(student);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingStudent(null);
    };

    const getClassName = (student: Student) => {
        if (typeof student.classe === 'object' && student.classe !== null) {
            return student.classe.nom_classe;
        }
        return 'Classe inconnue';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Étudiants</h2>
                    <p className="text-muted-foreground">
                        Gérez la liste des étudiants.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingStudent(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Ajouter un étudiant
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>{editingStudent ? "Modifier l'étudiant" : "Ajouter un étudiant"}</DialogTitle>
                            <DialogDescription>
                                {editingStudent ? "Modifiez les informations de l'étudiant." : "Remplissez le formulaire pour créer un nouvel étudiant."}
                            </DialogDescription>
                        </DialogHeader>
                        <StudentForm
                            classes={classes}
                            onSubmit={handleCreateOrUpdateStudent}
                            defaultValues={editingStudent
                                ? { ...editingStudent, classe: typeof editingStudent.classe === 'object' ? editingStudent.classe._id : editingStudent.classe }
                                : undefined
                            }
                            isLoading={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un étudiant..."
                        className="pl-8 w-full md:w-[300px]"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des étudiants</CardTitle>
                    <CardDescription>
                        Tous les étudiants inscrits.
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
                                    <TableHead>Classe</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((student) => (
                                    <TableRow key={student._id}>
                                        <TableCell className="font-medium">{student.nom}</TableCell>
                                        <TableCell>{student.prenom}</TableCell>
                                        <TableCell>{student.email}</TableCell>
                                        <TableCell>{getClassName(student)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(student)}>
                                                Modifier
                                            </Button>
                                            <Button variant="outline" className="text-red-500 hover:text-red-600" size="sm" onClick={() => handleDeleteStudent(student._id)}>
                                                Supprimer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {students.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Aucun étudiant trouvé.
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
