"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLanding } from "./LandingContext"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// Dominican ID (Cédula) format: XXX-XXXXXXX-X (11 digits)
// Dominican RNC format: XXX-XXXXX-X (9 digits) or XXXXXXXXX (9 digits)
const validateDominicanId = (value: string): boolean => {
    // Remove hyphens for validation
    const cleaned = value.replace(/-/g, "")

    // Check if it's a valid cédula (11 digits)
    if (/^\d{11}$/.test(cleaned)) {
        return true
    }

    // Check if it's a valid RNC (9 digits)
    if (/^\d{9}$/.test(cleaned)) {
        return true
    }

    return false
}

const formSchema = z.object({
    name: z.string()
        .min(3, "El nombre debe tener al menos 3 caracteres")
        .max(100, "El nombre es demasiado largo")
        .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras"),
    phone: z.string()
        .min(10, "El teléfono debe tener al menos 10 dígitos")
        .max(15, "El teléfono es demasiado largo")
        .regex(/^\d+$/, "El teléfono solo puede contener números"),
    idNumber: z.string()
        .min(9, "La cédula o RNC debe tener al menos 9 dígitos")
        .refine(validateDominicanId, {
            message: "Formato inválido. Cédula: XXX-XXXXXXX-X (11 dígitos) o RNC: XXX-XXXXX-X (9 dígitos)"
        }),
    country: z.string().default("República Dominicana"),
    address: z.string()
        .min(10, "La dirección debe tener al menos 10 caracteres")
        .max(200, "La dirección es demasiado larga"),
    city: z.string()
        .min(2, "La ciudad es requerida")
        .max(100, "El nombre de la ciudad es demasiado largo"),
    state: z.string()
        .min(2, "La provincia/estado es requerida")
        .max(100, "El nombre de la provincia es demasiado largo"),
    email: z.string()
        .email("Correo electrónico inválido")
        .toLowerCase()
        .refine((email) => email.includes("@") && email.includes("."), {
            message: "El correo debe tener un formato válido"
        }),
    password: z.string()
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .regex(/[A-Z]/, "La contraseña debe contener al menos una mayúscula")
        .regex(/[a-z]/, "La contraseña debe contener al menos una minúscula")
        .regex(/[0-9]/, "La contraseña debe contener al menos un número"),
})

const countries = [
    "República Dominicana",
    "México",
    "Colombia",
    "Argentina",
    "Chile",
    "Perú",
    "Venezuela",
    "Ecuador",
    "Guatemala",
    "Cuba",
    "Bolivia",
    "Honduras",
    "Paraguay",
    "El Salvador",
    "Nicaragua",
    "Costa Rica",
    "Panamá",
    "Uruguay",
]

export function RegisterForm() {
    const { t } = useLanding()
    const [isSuccess, setIsSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            phone: "",
            idNumber: "",
            country: "República Dominicana",
            address: "",
            city: "",
            state: "",
            email: "",
            password: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)

        try {
            const response = await fetch("/api/vendor/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Error al procesar el registro")
            }

            setIsSuccess(true)
            form.reset()
        } catch (error: any) {
            console.error("Registration error:", error)
            // You could add a toast notification here
            alert(error.message || "Error al procesar el registro. Por favor, intenta nuevamente.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <section id="register" className="py-24 bg-secondary/30">
                <div className="container mx-auto px-4 max-w-md text-center">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-card border border-border p-8 rounded-2xl shadow-lg"
                    >
                        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">{t("register.success.title")}</h2>
                        <p className="text-muted-foreground mb-6">{t("register.success.desc")}</p>
                        <div className="flex flex-col gap-3">
                            <Button asChild className="w-full">
                                <a href="/auth/login">{t("register.success.login")}</a>
                            </Button>
                            <Button onClick={() => setIsSuccess(false)} variant="outline">
                                {t("register.success.back")}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </section>
        )
    }

    return (
        <section id="register" className="py-24 bg-secondary/30">
            <div className="container mx-auto px-4 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold mb-4">{t("register.title")}</h2>
                    <p className="text-muted-foreground">{t("register.subtitle")}</p>
                </div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-card border border-border p-8 rounded-2xl shadow-lg"
                >
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Información Personal */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">{t("register.section.personal")}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{t("register.section.personal.desc")}</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.name")} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Jaaziel Polanco" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="phone"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.phone")} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="8299424252" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mt-6">
                                    <FormField
                                        control={form.control}
                                        name="idNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.idNumber")} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="40209543698" {...field} />
                                                </FormControl>
                                                <FormDescription className="text-xs">
                                                    {t("register.idNumber.desc")}
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.country")} *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un país" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {countries.map((country) => (
                                                            <SelectItem key={country} value={country}>
                                                                {country}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="mt-6">
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.address")} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="calle circunvalacion" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-6 mt-6">
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.city")} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="santo domingo norte" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.state")} *</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Santo domingo" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Credenciales */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold mb-4">{t("register.section.credentials")}</h3>
                                <p className="text-sm text-muted-foreground mb-4">{t("register.section.credentials.desc")}</p>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.email")} *</FormLabel>
                                                <FormControl>
                                                    <Input type="email" placeholder="vendedor@ejemplo.com" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>{t("register.password")} *</FormLabel>
                                                <FormControl>
                                                    <Input type="password" placeholder="••••••••" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            <Button type="submit" className="w-full h-12 text-lg" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t("register.loading")}
                                    </>
                                ) : (
                                    t("register.submit")
                                )}
                            </Button>
                        </form>
                    </Form>
                </motion.div>
            </div>
        </section>
    )
}
