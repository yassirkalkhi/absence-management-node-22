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
import { getAllAbsences, getStudentAbsence } from "@/services/absenceService";
import type { Absence, Justification } from "@/types";
import { createJustification, deleteJustification, getAllJustifications, getStudentJustifications, updateJustification } from "@/services/justificationService";
import { handleApiError } from "@/utils/apiUtils";
import { JustificationForm } from "@/components/forms/JustificationForm";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function JustificationsPage() {
    const [justifications, setJustifications] = useState<Justification[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);

    const [editingJustification, setEditingJustification] = useState<Justification | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { user, isLoading } = useAuth();
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        if (!isLoading && user) {
            fetchData();
        }
    }, [isLoading, user]);

    const fetchData = async () => {
        try {

            setLoading(true);
            if (isLoading) {
                return;
            }
            if (isAdmin) {
                const [justificationsData, absencesData] = await Promise.all([
                    getAllJustifications(),
                    getAllAbsences()
                ]);
                setJustifications(justificationsData);
                setAbsences(absencesData);
            } else {
                if (user?.etudiant == null) {
                    return;
                }
                console.log(user.etudiant);
                const justificationsData = await getStudentJustifications(user.etudiant);
                const absencesData = await getStudentAbsence(user.etudiant);
                setJustifications(justificationsData);
                setAbsences(absencesData);
            }



        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJustification = async (values: any) => {
        try {
            if (!user) {
                toast.error("Vous devez être connecté pour soumettre une justification",
                    {
                        duration: 5000,
                        position: "top-right",
                        style: {
                            background: "#4ade80",
                            color: "#fff",
                        },
                    }
                );
                return;
            }
            setIsSubmitting(true);
            if (editingJustification) {
                await updateJustification(editingJustification._id, values);
                toast.success("Justification mise à jour",
                    {
                        duration: 5000,
                        position: "top-right",
                        style: {
                            background: "#4ade80",
                            color: "#fff",
                        },
                    }
                );
                setIsDialogOpen(false);
                fetchData();
                return;
            } else {
                await createJustification({ ...values, absence: values.absenceId, etat: 'en attente', etudiant: user?.etudiant });
                toast.success("Justification soumise",
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
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de la soumission");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteJustification = async (id: string) => {
        try {
            if (!confirm("Voulez-vous vraiment supprimer cette justification ?")) {
                return;
            }
            await deleteJustification(id);
            toast.success("Justification supprimée",
                {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                }
            );
            setJustifications(justifications.filter(j => j._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression");
        }
    };

    const handleValidateJustification = async (id: string, isValid: boolean) => {
        try {
            await updateJustification(id, { etat: isValid ? 'validé' : 'refusé' });
            toast.success(`Justification ${isValid ? 'validée' : 'refusée'}`,
                {
                    duration: 5000,
                    position: "top-right",
                    style: {
                        background: "#4ade80",
                        color: "#fff",
                    },
                }
            );
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de la mise à jour");
        }
    };

    const openEditDialog = (justification: Justification) => {
        setIsDialogOpen(true);
        setEditingJustification(justification);
    };

    const [searchQuery, setSearchQuery] = useState("");

    const filteredJustifications = justifications.filter(justification =>
        justification.commentaire?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        justification.etat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        justification.fichier.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'Justifications' : 'Mes Justifications'}
                    </h2>
                    <p className="text-muted-foreground">
                        {isAdmin
                            ? 'Gestion des justificatifs d\'absence.'
                            : 'Soumettez et consultez vos justifications d\'absence.'}
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Soumettre une justification
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Soumettre une justification</DialogTitle>
                            <DialogDescription>
                                Joindre un fichier pour justifier une absence.
                            </DialogDescription>
                        </DialogHeader>
                        <JustificationForm
                            absences={absences}
                            onSubmit={handleCreateJustification}
                            isLoading={isSubmitting}
                        />
                    </DialogContent>
                </Dialog>
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
                    <CardTitle>Liste des justifications</CardTitle>
                    <CardDescription>
                        Justificatifs en attente de validation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center p-8">Chargement...</div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Fichier</TableHead>
                                    <TableHead>Commentaire</TableHead>
                                    <TableHead>État</TableHead>
                                    {isAdmin ? <TableHead className="text-right">Actions</TableHead> : <TableHead className="text-right"> </TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredJustifications.map((justification) => (
                                    <TableRow key={justification._id}>
                                        <TableCell className="font-medium">{justification.fichier}</TableCell>
                                        <TableCell>{justification.commentaire}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn(" text-gray-600", justification.etat === 'validé' && " text-green-600", justification.etat === 'refusé' && " text-red-600", justification.etat === 'en attente' && " text-yellow-600")}>
                                                {justification.etat}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {isAdmin && justification.etat === 'en attente' && (
                                                <>
                                                    <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleValidateJustification(justification._id, true)}>
                                                        Valider
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleValidateJustification(justification._id, false)}>
                                                        Refuser
                                                    </Button>
                                                </>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(justification)}>
                                                        Modifier
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDeleteJustification(justification._id)}>
                                                        Supprimer
                                                    </Button>
                                                </>

                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {justifications.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Aucune justification trouvée.
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
