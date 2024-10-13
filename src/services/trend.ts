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

// FUNÇÃO PARA PEGAR OS TRENDS
export const getTrending = async () => {
    const trends = await prisma.trend.findMany({
        select: {
            hashtag: true,
            counter: true
        },
        // poderá ser colocado aqui um where para filtrar pela data
        orderBy: {
            counter: 'desc'
        },
        take: 4 // só pego no máximo 4 hashtags dentro as muitas
    })

    return trends
}