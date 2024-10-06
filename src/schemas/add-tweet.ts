
import { z } from 'zod'

export const addTweetSchema = z.object({
    body: z.string({ message: 'Precisa enviar um tweet' }),
    answer: z.string().optional()

})