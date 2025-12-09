import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Users, BookOpen, FileCheck, GraduationCap, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useAuth } from "@/contexts/AuthContext";
import { getAllAbsences } from "@/services/absenceService";
import { getAllStudents } from "@/services/studentService";
import { getAllClasses } from "@/services/classService";
import { getAllJustifications } from "@/services/justificationService";
import { getAllTeachers } from "@/services/teacherService";
import { getAllSessions } from "@/services/sessionService";
import { handleApiError } from "@/utils/apiUtils";
import type { Absence, Student, Class, Justification, Teacher, Session, Module } from "@/types";

export default function Dashboard() {
    const [absences, setAbsences] = useState<Absence[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [justifications, setJustifications] = useState<Justification[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const isAdmin = user?.role === 'admin';

            if (!isAdmin) {
                const [absencesData, justificationsData] = await Promise.all([
                    getAllAbsences(),
                    getAllJustifications()
                ]);

                const filteredAbsences = absencesData.filter((absence: Absence) => {
                    if (!absence.etudiant) return false;
                    const etudiantId = typeof absence.etudiant === 'object'
                        ? (absence.etudiant as Student)._id
                        : absence.etudiant;
                    return etudiantId === user?.etudiant;
                });

                const studentAbsenceIds = filteredAbsences.map((a: Absence) => a._id);
                const filteredJustifications = justificationsData.filter((just: Justification) => {
                    if (!just.absence) return false;
                    const absenceId = typeof just.absence === 'object'
                        ? (just.absence as Absence)._id
                        : just.absence;
                    return studentAbsenceIds.includes(absenceId as string);
                });

                setAbsences(filteredAbsences);
                setJustifications(filteredJustifications);
            } else {
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
            }
        } catch (error) {
            handleApiError(error, "Erreur lors du chargement des données du tableau de bord");
        } finally {
            setLoading(false);
        }
    };

    const totalAbsences = absences.length;
    const totalStudents = students.length;
    const totalClasses = classes.length;
    const totalTeachers = teachers.length;
    const totalSessions = sessions.length;
    const pendingJustifications = justifications.filter(j => j.etat === 'en attente').length;

    const recentAbsences = absences.slice(0, 5);

    const absentCount = absences.filter(a => a.statut === 'absent').length;
    const presentCount = absences.filter(a => a.statut === 'present').length;
    const lateCount = absences.filter(a => a.statut === 'retard').length;

    const getStudentName = (absence: Absence) => {
        if (typeof absence.etudiant === 'object' && absence.etudiant !== null) {
            return `${(absence.etudiant as Student).nom} ${(absence.etudiant as Student).prenom}`;
        }
        return 'Étudiant inconnu';
    };

    const getSessionInfo = (absence: Absence) => {
        if (typeof absence.seance === 'object' && absence.seance !== null) {
            const session = absence.seance as Session;
            const moduleName = typeof session.module === 'object' && session.module !== null
                ? (session.module as Module).nom_module
                : 'Module';
            const time = session.heure_debut || '';
            return `${moduleName} - ${time}`;
        }
        return 'Séance inconnue';
    };

    const generateSixMonthData = () => {
        const now = new Date();
        const months: string[] = [];
        const monthData: { [key: string]: { absents: number; retards: number; presents: number } } = {};

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleString("en-US", { month: "short" });
            months.push(monthKey);
            if (!monthData[monthKey]) {
                monthData[monthKey] = { absents: 0, retards: 0, presents: 0 };
            }
        }

        if (absences && Array.isArray(absences)) {
            absences.forEach((absence) => {
                let dateStr: string | undefined;

                if (typeof absence.seance === 'object' && absence.seance !== null) {
                    dateStr = (absence.seance as Session).date_seance;
                } else if (typeof absence.seance === 'string') {

                    const session = sessions.find(s => s._id === absence.seance);
                    if (session) {
                        dateStr = session.date_seance;
                    }
                }

                if (dateStr) {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        const monthKey = date.toLocaleString("en-US", { month: "short" });
                        if (monthKey in monthData) {
                            if (absence.statut === "absent") {
                                monthData[monthKey].absents += 1;
                            } else if (absence.statut === "retard") {
                                monthData[monthKey].retards += 1;
                            } else if (absence.statut === "present") {
                                monthData[monthKey].presents += 1;
                            }
                        }
                    }
                }
            });
        }

        return months.map((month) => ({
            month,
            absents: monthData[month].absents,
            retards: monthData[month].retards,
            presents: monthData[month].presents,
        }));
    };

    const sixMonthData = generateSixMonthData();

    return (
        <div className="space-y-8">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-4xl font-bold tracking-tight">Tableau de bord</h1>
                    <p className="text-muted-foreground mt-2">Vue d'ensemble de la gestion des absences</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">Chargement des statistiques...</p>
                </div>
            ) : (
                <>
                  <div className="grid gap-6 grid-cols-1 lg:grid-cols-">
                        <Card className="lg:col-span-2 border border-border/50">
                            <CardHeader>
                                <CardTitle>Statistiques des Absences</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="border-t border-border/50 pt-6">
                                    <h3 className="text-sm font-semibold mb-4">Absences (6 derniers mois)</h3>
                                    <ChartContainer
                                        config={{
                                            absents: {
                                                label: "Absents",
                                                color: "hsl(0 84% 60%)",
                                            },
                                            retards: {
                                                label: "Retards",
                                                color: "hsl(32 95% 44%)",
                                            },
                                        }}
                                        className="h-64 w-full"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sixMonthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="fillAbsents" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--color-absents)" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="var(--color-absents)" stopOpacity={0.1} />
                                                    </linearGradient>
                                                    <linearGradient id="fillRetards" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="var(--color-retards)" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="var(--color-retards)" stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" vertical={false} />
                                                <XAxis
                                                    dataKey="month"
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <YAxis
                                                    tickLine={false}
                                                    axisLine={false}
                                                    tickMargin={8}
                                                    tick={{ fontSize: 12 }}
                                                />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                <Area
                                                    dataKey="retards"
                                                    type="natural"
                                                    fill="url(#fillRetards)"
                                                    fillOpacity={0.4}
                                                    stroke="var(--color-retards)"
                                                    stackId="a"
                                                />
                                                <Area
                                                    dataKey="absents"
                                                    type="natural"
                                                    fill="url(#fillAbsents)"
                                                    fillOpacity={0.4}
                                                    stroke="var(--color-absents)"
                                                    stackId="a"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>

                                <div className="border-t border-border/50 pt-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Séances programmées</span>
                                        <span className="text-xl font-bold ">{totalSessions}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-muted-foreground">Taux de présence</span>
                                        <span className="text-xl font-bold">
                                            {totalAbsences > 0 ? Math.round((presentCount / totalAbsences) * 100) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                 
                     <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        <Card className="border border-border/50 h-fit">
                            <CardHeader>
                                <CardTitle className="text-base">Absences Récentes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {recentAbsences.length > 0 ? (
                                        recentAbsences.map((absence) => (
                                            <div
                                                key={absence._id}
                                                className="flex items-start justify-between gap-2 pb-3 border-b border-border/30 last:border-0 last:pb-0"
                                            >
                                                <div className="space-y-1 flex-1 min-w-0">
                                                    <p className="text-sm font-medium leading-tight truncate">{getStudentName(absence)}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{getSessionInfo(absence)}</p>
                                                </div>
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-xs shrink-0",
                                                        absence.statut === "absent" &&
                                                        "border-red-500/50 text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20",
                                                    )}
                                                >
                                                    {absence.statut}
                                                </Badge>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">Aucune absence récente</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium">Enseignants</CardTitle>
                                <GraduationCap className="h-5 w-5 text-primary/60" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-2 ">{totalTeachers}</div>
                                <p className="text-sm text-muted-foreground">Enseignants actifs dans le système</p>
                            </CardContent>
                               <hr />
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium">Séances</CardTitle>
                                <Calendar className="h-5 w-5 text-primary/60" />
                            </CardHeader>
                         
                            <CardContent>
                                <div className="text-3xl font-bold mb-2  text-primary">{totalSessions}</div>
                                <p className="text-sm text-muted-foreground">Séances programmées au total</p>
                            </CardContent>
                        </Card>
 
                    </div>
                       <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="border border-border/50 hover:border-border transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Absences</CardTitle>
                                <AlertCircle className="h-5 w-5 text-red-700" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1 ">{totalAbsences}</div>
                                <p className="text-xs text-muted-foreground">
                                    {absentCount} absents, {lateCount} retards
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 hover:border-border transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Étudiants Inscrits</CardTitle>
                                <Users className="h-5 w-5  text-blue-800" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1">{totalStudents}</div>
                                <p className="text-xs text-muted-foreground">Répartis dans {totalClasses} classes</p>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 hover:border-border transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Classes Actives</CardTitle>
                                <BookOpen className="h-5 w-5 text-green-700" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1">{totalClasses}</div>
                                <p className="text-xs text-muted-foreground">{totalTeachers} enseignants</p>
                            </CardContent>
                        </Card>

                        <Card className="border border-border/50 hover:border-border transition-colors">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                <CardTitle className="text-sm font-medium text-muted-foreground">À traiter</CardTitle>
                                <FileCheck className="h-5 w-5 text-primary/60" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold mb-1">{pendingJustifications}</div>
                                <p className="text-xs text-muted-foreground">Justifications à vérifier</p>
                            </CardContent>
                        </Card>
                    </div>

                  

                   
                </>
            )}
        </div>
    );
}
