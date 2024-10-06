import { prisma } from "../utils/prisma"

// ESPECÍFICO PARA A HASHTAG

// função para adicionar a hashtag
export const addHashtag = async (hashtag: string) => {
    // hs = hashtag
    // procurar se tem a hashtag
    const hs = await prisma.trend.findFirst({ // verifica se existe no sistema
        where: { hashtag }
    })
    if (hs) { // se achou a hashtag no sistema
        await prisma.trend.update({ // atualizar
            where: { id: hs.id }, // procure por 
            data: { counter: hs.counter + 1, updatedAt: new Date() }  // aumenta a contagem da hs no sistema
        })
    } else { // caso não encontre, crie a hashtag
        await prisma.trend.create({
            data: { hashtag }
        })
    }
}