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
import { getAllAbsences } from "@/services/absenceService";
import type { Absence, Justification } from "@/types";
import { createJustification, deleteJustification, getAllJustifications, updateJustification } from "@/services/justificationService";
import { handleApiError } from "@/utils/apiUtils";
import { JustificationForm } from "@/components/forms/JustificationForm";
import { useAuth } from "@/contexts/AuthContext";

export default function JustificationsPage() {
    const [justifications, setJustifications] = useState<Justification[]>([]);
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const { user } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            const [justificationsData, absencesData] = await Promise.all([
                getAllJustifications(),
                getAllAbsences()
            ]);

            // Filter for students - only show their own justifications
            let filteredJustifications = justificationsData;
            let filteredAbsences = absencesData;

            if (user?.role === 'student' && user?.etudiant) {
                // Filter absences to only student's absences
                filteredAbsences = absencesData.filter((absence: Absence) => {
                    const etudiantId = typeof absence.etudiant === 'object'
                        ? absence.etudiant._id
                        : absence.etudiant;
                    return etudiantId === user.etudiant;
                });

                // Filter justifications to only those for student's absences
                const studentAbsenceIds = filteredAbsences.map((a: Absence) => a._id);
                filteredJustifications = justificationsData.filter((just: Justification) => {
                    const absenceId = typeof just.absence === 'object'
                        ? just.absence._id
                        : just.absence;
                    return studentAbsenceIds.includes(absenceId);
                });
            }

            setJustifications(filteredJustifications);
            setAbsences(filteredAbsences);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateJustification = async (values: any) => {
        try {
            setIsSubmitting(true);
            await createJustification({ ...values, absence: values.absenceId, etat: 'en attente' });
            toast.success("Justification soumise");
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
            await deleteJustification(id);
            toast.success("Justification supprimée");
            setJustifications(justifications.filter(j => j._id !== id));
        } catch (error) {
            handleApiError(error, "Erreur lors de la suppression");
        }
    };

    const handleValidateJustification = async (id: string, isValid: boolean) => {
        try {
            await updateJustification(id, { etat: isValid ? 'validé' : 'refusé' });
            toast.success(`Justification ${isValid ? 'validée' : 'refusée'}`);
            fetchData();
        } catch (error) {
            handleApiError(error, "Erreur lors de la mise à jour");
        }
    };

    const isAdmin = user?.role === 'admin';

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
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" /> Filtrer
                </Button>
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
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {justifications.map((justification) => (
                                    <TableRow key={justification._id}>
                                        <TableCell className="font-medium">{justification.fichier}</TableCell>
                                        <TableCell>{justification.commentaire}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                justification.etat === 'validé' ? 'default' :
                                                    justification.etat === 'refusé' ? 'destructive' : 'secondary'
                                            }>
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
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteJustification(justification._id)}>
                                                    Supprimer
                                                </Button>
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
