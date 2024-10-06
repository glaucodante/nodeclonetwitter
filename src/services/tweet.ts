import { prisma } from "../utils/prisma"
import { getPublicURL } from "../utils/url"


// RESPONSÁVEL PELOS TWEETS (LÓGICA)

// findFirst = busque o promeiro com o id
export const findTweet = async (id: number) => {
    const tweet = await prisma.tweet.findFirst({
        include: { // inclua na requisição
            user: {
                select: { // selecione
                    name: true,
                    avatar: true,
                    slug: true
                }
            },
            likes: {
                select: {
                    userSlug: true  // quem deu o like
                }
            }
        },
        where: { id }
    })

    if (tweet) { // se achou o tweet
        tweet.user.avatar = getPublicURL(tweet.user.avatar) // preencha o avatar do usuário
        return tweet // se achou retorne o tweet
    }

    return null // caso não encontre o tweet
}

export const createTweet = async (slug: string, body: string, answer?: number) => {
    const newTweet = await prisma.tweet.create({ // criando o tweet no BD com o prisma
        data: {
            body,
            userSlug: slug,
            answerOf: answer ? answer : 0 // se tem resposta use-a, se não manda o 0 (não tem resposta)
            // answerOf: answer ?? 0 
        }
    })

    return newTweet // tweet CRIADO
}