import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import type { Student, Session } from "@/types"

const formSchema = z.object({
    studentId: z.string().min(1, "Veuillez sélectionner un étudiant."),
    sessionId: z.string().min(1, "Veuillez sélectionner une séance."),
    status: z.enum(["absent", "retard"]),
    motif: z.string().optional(),
})

interface AbsenceFormProps {
    students: Student[];
    sessions: Session[];
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<z.infer<typeof formSchema>>;
    isLoading?: boolean;
}

export function AbsenceForm({ students, sessions, onSubmit, defaultValues, isLoading }: AbsenceFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            status: "absent",
            motif: "",
            ...defaultValues,
        },
    })

    function handleSubmit(values: z.infer<typeof formSchema>) {
        onSubmit(values);
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="studentId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Étudiant</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un étudiant" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {students.map((student) => (
                                        <SelectItem key={student._id} value={student._id}>
                                            {student.nom} {student.prenom}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sessionId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Séance</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une séance" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {sessions.map((session) => (
                                        <SelectItem key={session._id} value={session._id}>
                                            {/* Assuming session has module and date info populated */}
                                            {(session.module as any)?.nom_module || 'Module'} - {new Date(session.date_seance).toLocaleDateString()} {session.heure_debut}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Statut</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Statut" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="absent">Absent</SelectItem>
                                    <SelectItem value="retard">Retard</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="motif"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Motif</FormLabel>
                            <FormControl>
                                <Input placeholder="Raison de l'absence" {...field} />
                            </FormControl>
                            <FormDescription>
                                Optionnel.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enregistrement..." : "Enregistrer"}
                </Button>
            </form>
        </Form>
    )
}
