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
import { getAllAbsences, createAbsence, updateAbsence, deleteAbsence, getStudentAbsence } from "@/services/absenceService";
import { getAllStudents } from "@/services/studentService";
import { getAllSessions } from "@/services/sessionService";
import { AbsenceForm } from "@/components/forms/AbsenceForm";
import { useAuth } from "@/contexts/AuthContext"; 
import type { Absence, Student, Session } from "@/types";
import { cn } from "@/lib/utils";

export default function AbsencesPage() {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && user) {
            fetchData();
        }
    }, [isLoading, user]);



    const canManage = user?.role === 'admin' || user?.role === 'professor';

    const fetchData = async () => {
        if (isLoading) {
            return;
        }

        try {
            setLoading(true);
            if (user?.role === 'admin') {
                const [absencesData, studentsData, sessionsData] = await Promise.all([
                    getAllAbsences(),
                    getAllStudents(),
                    getAllSessions()
                ]);
                setStudents(studentsData);
                setSessions(sessionsData);
                setAbsences(absencesData);
            } else if (user?.role === 'professor' && user.enseignant) {
                const [allStudents, allSessions, allAbsences] = await Promise.all([
                    getAllStudents(),
                    getAllSessions(),
                    getAllAbsences()
                ]);

                const teacherSessions = allSessions.filter((session: Session) => {
                    const teacherId = typeof session.enseignant === 'object' ? session.enseignant?._id : session.enseignant;
                    return teacherId === user.enseignant;
                });
                setSessions(teacherSessions);
 
                setStudents(allStudents);

   
                const teacherSessionIds = teacherSessions.map((s: any) => s._id);
                const filteredAbsences = allAbsences.filter((a: any) => {
                    const sessionId = typeof a.seance === 'object' ? a.seance._id : a.seance;
                    return teacherSessionIds.includes(sessionId);
                });
                setAbsences(filteredAbsences);

            } else {
                if (user?.etudiant == null) {
                    return;
                }
                const [absencesData] = await Promise.all([
                    getStudentAbsence(user?.etudiant),

                ]);
                setAbsences(absencesData);
            }

        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateAbsence = async (values: any) => {
        try {
            if (!canManage) {
                toast.error("Vous n'êtes pas autorisé à effectuer cette action", {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                });
                return;
            }
            setIsSubmitting(true);
            const payload = {
                etudiant: values.studentId,
                seance: values.sessionId,
                statut: values.status,
                motif: values.motif
            };

            if (editingAbsence) {
                await updateAbsence(editingAbsence._id, payload);
                toast.success("Absence modifiée avec succès", {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                });
            } else {
                await createAbsence(payload);
                toast.success("Absence signalée avec succès", {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                });
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
            if (!canManage) {
                toast.error("Vous n'êtes pas autorisé à effectuer cette action", {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                });
                return;
            }
            await deleteAbsence(id);
            toast.success("Absence supprimée", {
                duration: 5000,
                position: "top-right",
                style: {
                    background: "#4ade80",
                    color: "#fff",
                },
            });
            setAbsences(absences.filter(a => a._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression de l'absence");
        }
    };
    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingAbsence(null);
    };


    const openEditDialog = (absence: Absence) => {
        setEditingAbsence(absence);
        setIsDialogOpen(true);
    };



    const [searchQuery, setSearchQuery] = useState("");

    const filteredAbsences = absences.filter(absence => {
        const studentName = getStudentName(absence).toLowerCase();
        const sessionInfo = getSessionInfo(absence).toLowerCase();
        const status = absence.statut.toLowerCase();
        const query = searchQuery.toLowerCase();

        return (
            (canManage && studentName.includes(query)) ||
            sessionInfo.includes(query) ||
            status.includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {canManage ? 'Absences' : 'Mes Absences'}
                    </h2>
                    <p className="text-muted-foreground">
                        {canManage
                            ? 'Gérez et suivez les absences des étudiants.'
                            : 'Consultez vos absences enregistrées.'}
                    </p>
                </div>
                {canManage && (
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
                                defaultValues={editingAbsence && (editingAbsence.statut === 'absent' || editingAbsence.statut === 'retard')
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
                        placeholder="Rechercher..."
                        className="pl-8 w-full md:w-[300px]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des absences</CardTitle>
                    <CardDescription>
                        Toutes les absences enregistrées dans le système.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && isLoading ? (
                        <div className="flex justify-center p-8">Chargement...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {canManage && <TableHead>Étudiant</TableHead>}
                                    <TableHead>Séance / Date</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Motif</TableHead>
                                    {canManage && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAbsences.map((absence) => (
                                    <TableRow key={absence._id}>
                                        {canManage && (
                                            <TableCell className="font-medium">
                                                {getStudentName(absence)}
                                            </TableCell>
                                        )}
                                        <TableCell>
                                            {getSessionInfo(absence)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={"outline"} className={cn("text-xs", absence.statut === "absent" ? " text-red-500" : " text-yellow-500")}>
                                                {absence.statut}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {absence.motif || '-'}
                                        </TableCell>
                                        {canManage && (
                                            <TableCell className="text-right space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => openEditDialog(absence)}>
                                                    Modifier
                                                </Button>
                                                <Button variant="outline" className="text-red-500 hover:text-red-600" size="sm" onClick={() => handleDeleteAbsence(absence._id)}>
                                                    Supprimer
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {absences.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={canManage ? 5 : 3} className="text-center py-8 text-muted-foreground">
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
