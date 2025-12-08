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
import { Input } from "@/components/ui/input"

const formSchema = z.object({
    nom_classe: z.string().min(1, "Le nom de la classe est requis."),
    niveau: z.string().min(1, "Le niveau est requis."),
    departement: z.string().min(1, "Le département est requis."),
    filiere: z.string().min(1, "La filière est requise."),
})

interface ClassFormProps {
    onSubmit: (values: z.infer<typeof formSchema>) => void;
    defaultValues?: Partial<z.infer<typeof formSchema>>;
    isLoading?: boolean;
}

export function ClassForm({ onSubmit, defaultValues, isLoading }: ClassFormProps) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            nom_classe: "",
            niveau: "",
            departement: "",
            filiere: "",
            ...defaultValues,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nom_classe"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom de la classe</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Info 1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="niveau"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Niveau</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Licence 1" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="departement"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Département</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Informatique" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="filiere"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Filière</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Génie Logiciel" {...field} />
                            </FormControl>
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
