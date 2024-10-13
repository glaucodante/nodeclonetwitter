import { prisma } from "../utils/prisma"
import { getPublicURL } from "../utils/url"


// RESPONSÁVEL PELOS TWEETS (LÓGICA)

// findFirst = busque o primeiro com o id
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

// buscando respostas de determinado tweet
export const findAnswersFromTweet = async (id: number) => {
    const tweets = await prisma.tweet.findMany({ // buscando as respostas (1 ou +)
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
        where: { answerOf: id } // resposta de um tweet

    })
    // Atualizando o avatar
    for (let tweetIndex in tweets) {
        tweets[tweetIndex].user.avatar = getPublicURL(tweets[tweetIndex].user.avatar)
    }

    return tweets // retornando a lista de tweets ou vazio caso não tenha
}

// criando as funções likes 

//checkIfTweetLikeByUser = verificar se o tweet foi dado like
export const checkIfTweetLikeByUser = async (slug: string, id: number) => {
    const isLiked = await prisma.tweetLike.findFirst({  //procurar um registro do usuário logado e o id
        where: {
            userSlug: slug,
            tweetId: id
        }
    })

    return isLiked ? true : false // verifica se tem like caso contrário false
}

// criando a função para tirar o like
export const unlikeTweet = async (slug: string, id: number) => {
    await prisma.tweetLike.deleteMany({ // deletando
        where: {
            userSlug: slug,
            tweetId: id
        }
    })
}

// criando a função para dar o like
export const likeTweet = async (slug: string, id: number) => {
    await prisma.tweetLike.create({ // criando o like
        data: {
            userSlug: slug,
            tweetId: id
        }
    })
}

// pegando os tweets do usuário para colocá-los na paginação
export const findTweetsByUser = async (slug: string, currentPage: number, perPage: number) => {
    const tweets = await prisma.tweet.findMany({
        include: {
            likes: {
                select: {
                    userSlug: true // quem deu o like
                }
            }

        },
        where: {
            userSlug: slug, answerOf: 0 // para pegar os tweets, não as respostas
        },
        // FAZENDO A PAGINAÇÃ
        orderBy: { createdAt: 'desc' }, // ordem decrescente (ultimo ao primeiro)
        skip: currentPage * perPage, // quantas páginas pulará 
        take: perPage // quantas pegará

    })

    return tweets
}

// pegando os tweets do feed
// fazendo tbm a paginação
export const findTweetFeed = async (following: string[], currentPage: number, perPage: number) => {
    const tweets = await prisma.tweet.findMany({  // pegue os tweets
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

        where: { // onde
            userSlug: { in: following }, // o usuário que fez o tweet tá numa lista
            answerOf: 0 // não resposta
        },
        // FAZENDO A PAGINAÇÃO
        orderBy: { createdAt: 'desc' },
        skip: currentPage * perPage, // quantas páginas pulará
        take: perPage // quantas pegará

    })

    // adiciona URL no avatar
    for (let tweetIndex in tweets) { // ir de um em um para colocar o avatar
        tweets[tweetIndex].user.avatar = getPublicURL(tweets[tweetIndex].user.avatar)
    }

    return tweets
}

// função que irá buscar os tweets
// irá buscar os tweets pelo que está no body
export const findTweetsByBody = async (bodyContains: string, currentPage: number, perPAge: number) => {
    const tweets = await prisma.tweet.findMany({
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
        where: {
            body: {
                contains: bodyContains,
                mode: 'insensitive' // na pesquisa não fará diferença se foi digitado em maiúscula ou minúscula
            },
            answerOf: 0 // para que não busque resposta de tweet, apenas tweets originais
        },
        orderBy: { createdAt: 'desc' },
        skip: currentPage * perPAge,
        take: perPAge
    })


    // adiciona URL no avatar
    for (let tweetIndex in tweets) { // ir de um em um para colocar o avatar
        tweets[tweetIndex].user.avatar = getPublicURL(tweets[tweetIndex].user.avatar)
    }

    return tweets // retorna o resultado da busca
}