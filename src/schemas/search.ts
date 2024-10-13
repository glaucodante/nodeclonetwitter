import { strict } from "assert"
import { z } from "zod"

// SCHEMA PARA VALIDAÇÃO do SEARCH
// SCHEMA PARA VALIDAÇÃO DA PAGINAÇÃO

// queryString que mandamos será uma string
// COERCE = Tenta converter os dados recebidos em um tipo apropriado antes de validar
// q = query string
export const searchSchema = z.object({
    q: z.string({ message: 'Preencha a busca' }).min(3, 'Mínimo de 3 caracteres'),
    page: z.coerce.number().min(0).optional()
})

/*
O recurso COERCE do Zod é particularmente útil para converter (ou "forçar") 
dados de tipos incorretos em um formato esperado, tornando o processo de validação mais flexível.
Tenta converter os dados recebidos em um tipo apropriado antes de validar
*/