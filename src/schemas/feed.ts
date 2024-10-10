import { z } from "zod"

// SCHEMA PARA VALIDAÇÃO do FEED
// SCHEMA PARA VALIDAÇÃO DA PAGINAÇÃO
export const feedSchema = z.object({
    page: z.coerce.number().min(0).optional()  // paginação
})