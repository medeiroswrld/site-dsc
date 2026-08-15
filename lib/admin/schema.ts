import { z } from "zod";

/**
 * One schema, used by the server action to validate and by the form to know
 * which fields exist. Messages are in Portuguese because they are shown to
 * whoever is filling the form in.
 */

export const TRANSMISSIONS = [
  "Manual",
  "Automático",
  "Automatizado",
  "CVT",
] as const;

export const FUELS = [
  "Flex",
  "Gasolina",
  "Diesel",
  "Etanol",
  "Híbrido",
  "Elétrico",
] as const;

export const BODY_TYPES = [
  "Hatch",
  "Sedã",
  "SUV",
  "Picape",
  // Parati, Quantum, Palio Weekend — still common on a Brazilian used lot.
  "Perua",
  "Utilitário",
  "Cupê",
] as const;

export const STATUSES = [
  { value: "available", label: "Disponível" },
  { value: "reserved", label: "Reservado" },
  { value: "sold", label: "Vendido" },
] as const;

const currentYear = new Date().getFullYear();

/** "" and "R$ 89.900" both become a number of whole reais, or null. */
const optionalMoney = z
  .string()
  .optional()
  .transform((value) => {
    const digits = (value ?? "").replace(/\D/g, "");
    return digits ? Number(digits) : null;
  })
  .refine((value) => value === null || value >= 0, {
    message: "Preço inválido.",
  });

const requiredInt = (label: string, min: number, max: number) =>
  z
    .string()
    .transform((value) => Number(value.replace(/\D/g, "")))
    .refine((value) => Number.isFinite(value) && value >= min && value <= max, {
      message: `${label} deve estar entre ${min} e ${max}.`,
    });

export const vehicleFormSchema = z
  .object({
    brand: z.string().trim().min(1, "Informe a marca."),
    model: z.string().trim().min(1, "Informe o modelo."),
    version: z.string().trim().default(""),

    yearManufacture: requiredInt("Ano de fabricação", 1950, currentYear + 1),
    yearModel: requiredInt("Ano do modelo", 1950, currentYear + 2),
    mileage: requiredInt("Quilometragem", 0, 2_000_000),

    price: optionalMoney,

    transmission: z.enum(TRANSMISSIONS, {
      message: "Escolha o câmbio.",
    }),
    fuel: z.enum(FUELS, { message: "Escolha o combustível." }),
    bodyType: z.enum(BODY_TYPES, { message: "Escolha a carroceria." }),

    color: z.string().trim().default(""),
    doors: requiredInt("Portas", 2, 5),

    description: z.string().trim().max(2000, "Descrição muito longa.").default(""),

    /** Textarea, one item per line. */
    features: z
      .string()
      .optional()
      .transform((value) =>
        (value ?? "")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .slice(0, 40),
      ),

    videoUrl: z
      .string()
      .trim()
      .refine((value) => !value || /^https?:\/\//.test(value), {
        message: "O link do vídeo precisa começar com http.",
      })
      .default(""),

    featured: z.coerce.boolean().default(false),
    status: z.enum(["available", "reserved", "sold"]).default("available"),
  })
  .refine((data) => data.yearModel >= data.yearManufacture, {
    message: "O ano do modelo não pode ser menor que o de fabricação.",
    path: ["yearModel"],
  });

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

/** Field-level errors keyed the way the form reads them. */
export type FieldErrors = Partial<Record<string, string>>;

export interface ActionResult {
  ok: boolean;
  message?: string;
  errors?: FieldErrors;
  /** Set on a successful create so the client can jump to the edit screen. */
  id?: string;
}

