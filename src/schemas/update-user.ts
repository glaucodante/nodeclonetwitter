import { z } from "zod";

// SCHEMA PARA VALIDAÇÃO DA ALTERAÇÃO DO USUÁRIO
// informações que serão alteradas
export const updateUserSchema = z.object({
    name: z.string().min(2, 'Pelo menos 2 caracteres').optional(),
    bio: z.string().optional(),
    link: z.string().url('Precisa ser uma URL válida').optional()
})

