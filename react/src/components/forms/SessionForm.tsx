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
import type { Class, Module, Teacher } from "@/types"

const formSchema = z.object({
    date_seance: z.string().min(1, "La date est requise."),
    heure_debut: z.string().min(1, "L'heure de début est requise."),
    heure_fin: z.string().min(1, "L'heure de fin est requise."),
    enseignant: z.string().min(1, "L'enseignant est requis."),
    module: z.string().min(1, "Le module est requis."),
    classe: z.string().min(1, "La classe est requise."),
})

interface SessionFormProps {
    classes: Class[];
    modules: Module[];
    teachers: Teacher[];
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<z.infer<typeof formSchema>>;
    isLoading?: boolean;
}

export function SessionForm({ classes, modules, teachers, onSubmit, defaultValues, isLoading }: SessionFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date_seance: "",
            heure_debut: "",
            heure_fin: "",
            enseignant: "",
            module: "",
            classe: "",
            ...defaultValues,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="date_seance"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                                {/* Note: Input type="date" expects YYYY-MM-DD. If backend sends ISO date string (full), 
                 we might need to slice it in defaultValues prep */}
                                <Input type="date" {...field} value={field.value ? field.value.split('T')[0] : ''} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="heure_debut"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Heure Début</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="heure_fin"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel>Heure Fin</FormLabel>
                                <FormControl>
                                    <Input type="time" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="enseignant"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Enseignant</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un enseignant" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {teachers.map((teacher) => (
                                        <SelectItem key={teacher._id} value={teacher._id}>
                                            {teacher.nom} {teacher.prenom}
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
                    name="module"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Module</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un module" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {modules.map((module) => (
                                        <SelectItem key={module._id} value={module._id}>
                                            {module.nom_module}
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
                    name="classe"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Classe</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner une classe" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {classes.map((classe) => (
                                        <SelectItem key={classe._id} value={classe._id}>
                                            {classe.nom_classe}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
