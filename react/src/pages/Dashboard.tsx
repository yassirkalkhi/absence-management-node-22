import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, AlertCircle, FileCheck, GraduationCap, Calendar } from "lucide-react";
import { getAllAbsences } from "@/services/absenceService";
import { getAllStudents } from "@/services/studentService";
import { getAllClasses } from "@/services/classService";
import { getAllJustifications } from "@/services/justificationService";
import { getAllTeachers } from "@/services/teacherService";
import { getAllSessions } from "@/services/sessionService";
import { handleApiError } from "@/utils/apiUtils";
import type { Absence, Student, Class, Justification, Teacher, Session } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [justifications, setJustifications] = useState<Justification[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [absencesData, studentsData, classesData, justificationsData, teachersData, sessionsData] = await Promise.all([
                getAllAbsences(),
                getAllStudents(),
                getAllClasses(),
                getAllJustifications(),
                getAllTeachers(),
                getAllSessions()
            ]);
            setAbsences(absencesData);
            setStudents(studentsData);
            setClasses(classesData);
            setJustifications(justificationsData);
            setTeachers(teachersData);
            setSessions(sessionsData);
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données du tableau de bord");
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const totalAbsences = absences.length;
    const totalStudents = students.length;
    const totalClasses = classes.length;
    const totalTeachers = teachers.length;
    const totalSessions = sessions.length;
    const pendingJustifications = justifications.filter(j => j.etat === 'en attente').length;

    // Recent absences (last 5)
    const recentAbsences = absences.slice(0, 5);

    // Absence statistics by status
    const absentCount = absences.filter(a => a.statut === 'absent').length;
    const presentCount = absences.filter(a => a.statut === 'present').length;
    const lateCount = absences.filter(a => a.statut === 'retard').length;

    const getStudentName = (absence: Absence) => {
        if (typeof absence.etudiant === 'object' && absence.etudiant !== null) {
            return `${absence.etudiant.nom} ${absence.etudiant.prenom}`;
        }
        return 'Étudiant inconnu';
    };

    const getSessionInfo = (absence: Absence) => {
        if (typeof absence.seance === 'object' && absence.seance !== null) {
            const moduleName = typeof absence.seance.module === 'object' ? absence.seance.module.nom_module : 'Module';
            const time = absence.seance.heure_debut || '';
            return `${moduleName} - ${time}`;
        }
        return 'Séance inconnue';
    };

    const getStatusBadgeVariant = (status: string) => {
        switch (status) {
            case 'absent':
                return 'destructive';
            case 'present':
                return 'default';
            case 'retard':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>
                <p className="text-muted-foreground">
                    Vue d'ensemble de la gestion des absences
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">Chargement des statistiques...</p>
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Absences
                                </CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalAbsences}</div>
                                <p className="text-xs text-muted-foreground">
                                    {absentCount} absents, {lateCount} retards
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Étudiants Inscrits
                                </CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalStudents}</div>
                                <p className="text-xs text-muted-foreground">
                                    Répartis dans {totalClasses} classes
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Classes Actives</CardTitle>
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalClasses}</div>
                                <p className="text-xs text-muted-foreground">
                                    {totalTeachers} enseignants
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Justifications à traiter
                                </CardTitle>
                                <FileCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{pendingJustifications}</div>
                                <p className="text-xs text-muted-foreground">
                                    Sur {justifications.length} total
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Statistiques des Absences</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                                            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{absentCount}</div>
                                            <p className="text-sm text-red-600 dark:text-red-400">Absents</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{presentCount}</div>
                                            <p className="text-sm text-green-600 dark:text-green-400">Présents</p>
                                        </div>
                                        <div className="flex flex-col items-center justify-center p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                                            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{lateCount}</div>
                                            <p className="text-sm text-orange-600 dark:text-orange-400">Retards</p>
                                        </div>
                                    </div>
                                    <div className="pt-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium">Séances programmées</span>
                                            <span className="text-2xl font-bold">{totalSessions}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">Taux de présence</span>
                                            <span className="text-2xl font-bold">
                                                {totalAbsences > 0 ? Math.round((presentCount / totalAbsences) * 100) : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>Absences Récentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {recentAbsences.length > 0 ? (
                                        recentAbsences.map((absence) => (
                                            <div key={absence._id} className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium leading-none">
                                                        {getStudentName(absence)}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {getSessionInfo(absence)}
                                                    </p>
                                                </div>
                                                <Badge variant={getStatusBadgeVariant(absence.statut)}>
                                                    {absence.statut}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Aucune absence récente
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Enseignants</CardTitle>
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-2">{totalTeachers}</div>
                                <p className="text-sm text-muted-foreground">
                                    Enseignants actifs dans le système
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Séances</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-2">{totalSessions}</div>
                                <p className="text-sm text-muted-foreground">
                                    Séances programmées au total
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
