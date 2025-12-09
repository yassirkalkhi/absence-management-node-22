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
import { getAllSessions, createSession, updateSession, deleteSession } from "@/services/sessionService";
import { getAllClasses } from "@/services/classService";
import { getAllModules } from "@/services/moduleService";
import { getAllTeachers } from "@/services/teacherService";
import { SessionForm } from "@/components/forms/SessionForm";
import type { Session, Class, Module, Teacher } from "@/types";

export default function SeancesPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSession, setEditingSession] = useState<Session | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sessionsData, classesData, modulesData, teachersData] = await Promise.all([
                getAllSessions(),
                getAllClasses(),
                getAllModules(),
                getAllTeachers()
            ]);
            setSessions(sessionsData);
            setClasses(classesData);
            setModules(modulesData);
            setTeachers(teachersData);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdateSession = async (values: any) => {
        try {
            setIsSubmitting(true);
            if (editingSession) {
                await updateSession(editingSession._id, values);
                toast.success("Séance modifiée avec succès",
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
                await createSession(values);
                toast.success("Séance créée avec succès",
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
            setEditingSession(null);
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de l'enregistrement de la séance");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer cette séance ?")) return;
        try {
            await deleteSession(id);
            toast.success("Séance supprimée",
                {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                }
            );
            setSessions(sessions.filter(s => s._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression de la séance");
        }
    };

    const openEditDialog = (session: Session) => {
        setEditingSession(session);
        setIsDialogOpen(true);
    };

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) setEditingSession(null);
    };

    const getModuleName = (session: Session) => {
        if (typeof session.module === 'object' && session.module !== null) {
            return session.module.nom_module;
        }
        return 'Module inconnu';
    };

    const getTeacherName = (session: Session) => {
        if (typeof session.enseignant === 'object' && session.enseignant !== null) {
            return `${session.enseignant.nom} ${session.enseignant.prenom}`;
        }
        return 'Enseignant inconnu';
    };

    const getClassName = (session: Session) => {
        if (typeof session.classe === 'object' && session.classe !== null) {
            return session.classe.nom_classe;
        }
        return 'Classe inconnue';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Séances</h2>
                    <p className="text-muted-foreground">
                        Planification des cours.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingSession(null)}>
                            <Plus className="mr-2 h-4 w-4" /> Planifier une séance
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingSession ? "Modifier la séance" : "Planifier une séance"}</DialogTitle>
                            <DialogDescription>
                                {editingSession ? "Modifiez les détails de la séance" : "Remplissez le formulaire pour programmer une nouvelle séance."}
                            </DialogDescription>
                        </DialogHeader>
                        <SessionForm
                            classes={classes}
                            modules={modules}
                            teachers={teachers}
                            onSubmit={handleCreateOrUpdateSession}
                            defaultValues={editingSession
                                ? {
                                    ...editingSession,
                                    classe: typeof editingSession.classe === 'object' ? editingSession.classe._id : editingSession.classe,
                                    module: typeof editingSession.module === 'object' ? editingSession.module._id : editingSession.module,
                                    enseignant: typeof editingSession.enseignant === 'object' ? editingSession.enseignant._id : editingSession.enseignant
                                }
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
                        placeholder="Rechercher une séance..."
                        className="pl-8 w-full md:w-[300px]"
                    />
                </div> 
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Liste des séances</CardTitle>
                    <CardDescription>
                        Emploi du temps et séances programmées.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Chargement...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Horaire</TableHead>
                                    <TableHead>Module</TableHead>
                                    <TableHead>Classe</TableHead>
                                    <TableHead>Enseignant</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.map((session) => (
                                    <TableRow key={session._id}>
                                        <TableCell>
                                            {new Date(session.date_seance).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {session.heure_debut} - {session.heure_fin}
                                        </TableCell>
                                        <TableCell>{getModuleName(session)}</TableCell>
                                        <TableCell>{getClassName(session)}</TableCell>
                                        <TableCell>{getTeacherName(session)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => openEditDialog(session)}>
                                                Modifier
                                            </Button>
                                            <Button variant="outline" className="outline text-red-500 hover:text-red-600" size="sm" onClick={() => handleDeleteSession(session._id)}>
                                                Supprimer
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sessions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            Aucune séance trouvée.
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
