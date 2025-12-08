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
    nom_module: z.string().min(1, "Le nom du module est requis."),
    coefficient: z.coerce.number().min(1, "Le coefficient doit être positif."),
})

type ModuleFormValues = z.infer<typeof formSchema>;

interface ModuleFormProps {
    onSubmit: (values: ModuleFormValues) => void;
    defaultValues?: Partial<ModuleFormValues>;
    isLoading?: boolean;
}

export function ModuleForm({ onSubmit, defaultValues, isLoading }: ModuleFormProps) {
    const form = useForm<ModuleFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            nom_module: "",
            coefficient: 1,
            ...defaultValues,
        },
    })

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="nom_module"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Nom du module</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Algorithmique" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="coefficient"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Coefficient</FormLabel>
                            <FormControl>
                                <Input type="number" placeholder="Ex: 3" {...field} />
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
