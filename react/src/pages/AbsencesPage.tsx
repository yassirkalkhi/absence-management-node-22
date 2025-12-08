import { useState, useEffect } from "react";
import { Plus, Search, Filter } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
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
import { getAllAbsences, createAbsence, updateAbsence, deleteAbsence } from "@/services/absenceService";
import { getAllStudents } from "@/services/studentService";
import { getAllSessions } from "@/services/sessionService";
import { AbsenceForm } from "@/components/absence/AbsenceForm";
import { useAuth } from "@/contexts/AuthContext";
import type { Absence, Student, Session } from "@/types";

export default function AbsencesPage() {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);


    useEffect(() => {
        fetchData();
    }, []);

    const { user } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [absencesData, studentsData, sessionsData] = await Promise.all([
                getAllAbsences(),
                getAllStudents(),
                getAllSessions()
            ]);

            // Filter absences for students - only show their own
            let filteredAbsences = absencesData;
            if (user?.role === 'student' && user?.etudiant) {
                filteredAbsences = absencesData.filter((absence: Absence) => {
                    const etudiantId = typeof absence.etudiant === 'object'
                        ? absence.etudiant._id
                        : absence.etudiant;
                    return etudiantId === user.etudiant;
                });
            }

            setAbsences(filteredAbsences);
            setStudents(studentsData);
            setSessions(sessionsData);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateAbsence = async (values: any) => {
        try {
            setIsSubmitting(true);
            const payload = {
                etudiant: values.studentId,
                seance: values.sessionId,
                statut: values.status,
                motif: values.motif
            };

            if (editingAbsence) {
                await updateAbsence(editingAbsence._id, payload);
                toast.success("Absence modifiée avec succès");
            } else {
                await createAbsence(payload);
                toast.success("Absence signalée avec succès");
            }
            setIsDialogOpen(false);
            setEditingAbsence(null);
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de l'enregistrement de l'absence");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteAbsence = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette absence ?")) return;
        try {
            await deleteAbsence(id);
            toast.success("Absence supprimée");
            setAbsences(absences.filter(a => a._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression de l'absence");
        }
    };

    const openEditDialog = (absence: Absence) => {
        setEditingAbsence(absence);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingAbsence(null);
    };

    const getStudentName = (absence: Absence) => {
        if (typeof absence.etudiant === 'object' && absence.etudiant !== null) {
            return `${absence.etudiant.nom} ${absence.etudiant.prenom}`;
        }
        return 'Étudiant inconnu';
    };

    const getSessionInfo = (absence: Absence) => {
        if (typeof absence.seance === 'object' && absence.seance !== null) {
            const date = new Date(absence.seance.date_seance).toLocaleDateString();
            const moduleName = typeof absence.seance.module === 'object' ? absence.seance.module.nom_module : 'Module';
            return `${moduleName} - ${date}`;
        }
        return 'Séance inconnue';
    };

    const isAdmin = user?.role === 'admin';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'Absences' : 'Mes Absences'}
                    </h2>
                    <p className="text-muted-foreground">
                        {isAdmin
                            ? 'Gérez et suivez les absences des étudiants.'
                            : 'Consultez vos absences enregistrées.'}
                    </p>
                </div>
                {isAdmin && (
                    <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setEditingAbsence(null)}>
                                <Plus className="mr-2 h-4 w-4" /> Signaler une absence
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>{editingAbsence ? "Modifier l'absence" : "Signaler une absence"}</DialogTitle>
                                <DialogDescription>
                                    {editingAbsence ? "Modifier les détails de l'absence." : "Remplissez le formulaire pour signaler une nouvelle absence."}
                                </DialogDescription>
                            </DialogHeader>
                            <AbsenceForm
                                students={students}
                                sessions={sessions}
                                onSubmit={handleCreateOrUpdateAbsence}
                                defaultValues={editingAbsence
                                    ? {
                                        studentId: typeof editingAbsence.etudiant === 'object' ? editingAbsence.etudiant._id : editingAbsence.etudiant,
                                        sessionId: typeof editingAbsence.seance === 'object' ? editingAbsence.seance._id : editingAbsence.seance,
                                        status: editingAbsence.statut,
                                        motif: editingAbsence.motif
                                    }
                                    : undefined
                                }
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
                        placeholder="Rechercher un étudiant..."
                        className="pl-8 w-full md:w-[300px]"
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filtrer
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des absences</CardTitle>
                    <CardDescription>
                        Toutes les absences enregistrées dans le système.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Chargement...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {isAdmin && <TableHead>Étudiant</TableHead>}
                                    <TableHead>Séance / Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Motif</TableHead>
                                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {absences.map((absence) => (
                                    <TableRow key={absence._id}>
                                        {isAdmin && (
                                            <TableCell className="font-medium">
                                                {getStudentName(absence)}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {getSessionInfo(absence)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={absence.statut === 'absent' ? 'destructive' : 'secondary'}>
                                                {absence.statut}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {absence.motif || '-'}
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => openEditDialog(absence)}>
                                                    Modifier
                                                </Button>
                                                <Button variant="destructive" size="sm" onClick={() => handleDeleteAbsence(absence._id)}>
                                                    Supprimer
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {absences.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={isAdmin ? 5 : 3} className="text-center py-8 text-muted-foreground">
                                            Aucune absence trouvée.
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
