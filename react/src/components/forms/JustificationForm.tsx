import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
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
import type { Absence } from "@/types"

const formSchema = z.object({
    absenceId: z.string().min(1, "Veuillez sélectionner une absence."),
    fichier: z.string().min(1, "Le fichier est requis."),
    commentaire: z.string().min(1, "Le commentaire est requis."),
})

interface JustificationFormProps {
    absences: Absence[];
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<z.infer<typeof formSchema>>;
    isLoading?: boolean;
}

export function JustificationForm({ absences, onSubmit, defaultValues, isLoading }: JustificationFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            absenceId: "",
            fichier: "",
            commentaire: "",
            ...defaultValues,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="absenceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Absence à justifier</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une absence" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {absences.map((absence) => {
                                        const studentName = typeof absence.etudiant === 'object' && absence.etudiant ? `${absence.etudiant.nom} ${absence.etudiant.prenom}` : 'Étudiant inconnu';
                                        const date = typeof absence.seance === 'object' && absence.seance ? new Date(absence.seance.date_seance).toLocaleDateString() : 'Date inconnue';
                                        return (
                                            <SelectItem key={absence._id} value={absence._id}>
                                                {studentName} - {date} ({absence.statut})
                                            </SelectItem>
                                        )
                                    })}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="fichier"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Lien du fichier / Justificatif</FormLabel>
                            <FormControl>
                                <Input placeholder="URL ou nom du fichier" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="commentaire"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Commentaire</FormLabel>
                            <FormControl>
                                <Input placeholder="Raison médicale, etc." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Enregistrement..." : "Soumettre"}
                </Button>
            </form>
        </Form>
    )
}
