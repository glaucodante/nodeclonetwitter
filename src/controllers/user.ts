import { checkIfFollows, follow, unfollow, updateUserInfo } from './../services/user';
import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { findUserBySlug, getUserFollowersCount, getUserFollowingCount, getUserTweetCount } from "../services/user";
import { userTweetsSchema } from "../schemas/user-tweets";
import { findTweetsByUser } from "../services/tweet";
import { updateUserSchema } from '../schemas/update-user';

// acessando dados do user


// Criando as funções para acessar os dados do usuário
export const getUser = async (req: ExtendedRequest, res: Response) => {
    // pra receber o /:slug => dinâmico que está na URL, ele está em params
    const { slug } = req.params // o slug (dinâmico) está em params (do próprio usuário ou de outro)

    const user = await findUserBySlug(slug)
    if (!user) res.json({ error: 'Usuário Inexistente' })


    const followingCount = await getUserFollowingCount(slug) // pegando as informações
    const followersCount = await getUserFollowersCount(slug)
    const tweetCount = await getUserTweetCount(slug)

    res.json({ user, followingCount, followersCount, tweetCount })
}

// FUNCIONALIDADE EXTRA - PAGINAÇÃO 

// Criando as funções para acessar os tweets do usuário
export const getUserTweets = async (req: ExtendedRequest, res: Response) => {
    const { slug } = req.params
    // validar os dados recebidos
    // usando função do zod que valida os dados
    // SAFE PARSE = parse seguro, não irá explodir o erro na tela  
    const safeData = userTweetsSchema.safeParse(req.query) // validando os dados na query
    if (!safeData.success) { // caso safeData deu errado
        res.json({ error: safeData.error.flatten().fieldErrors })
        return
    }

    // FUNCIONALIDADE EXTRA - PAGINAÇÃO 

    let perPage = 2 // quantos itens serão exibidos por página
    // currentPage = página atual    
    let currentPage = safeData.data.page ?? 0 // se eu mandei a pegue, pegue-o, caso contrário fica 0

    // pegando os tweets

    const tweets = await findTweetsByUser(
        slug,
        currentPage, // qual a página atual
        perPage // quantos itens por página irei mandar
    )

    res.json({ tweets, page: currentPage })  // resposta
}

// Criando as funções para seguir ou deixar de seguir
// toggle = alternar
export const followToggle = async (req: ExtendedRequest, res: Response) => {
    const { slug } = req.params // recebendo os dados do usuário
    // me = eu
    const me = req.userSlug as string // usuário que irá seguir, que já está logado

    // verificação
    // se o usuário que irá seguir existe
    const hasUserToBeFollowed = await findUserBySlug(slug)
    if (!hasUserToBeFollowed) { // se não existir o usuário que está querendo seguir
        res.json({ error: 'Usuário Inexistente' })
        // return
    }

    // verificando se eu sigo o outro usuário 
    const follows = await checkIfFollows(me, slug)
    if (!follows) { // seu eu não sigo 
        await follow(me, slug) // vou seguir => me = meu usuário
        res.json({ following: true })  // estou seguindo agora
    } else {
        await unfollow(me, slug) // deixando de seguir
        res.json({ following: false }) // não sigo mais (desseguir)
    }
}

// Alterando usuário
export const updateUser = async (req: ExtendedRequest, res: Response) => {
    // validando informações para saber se estão coerentes
    const safeData = updateUserSchema.safeParse(req.body) // validando os dados
    if (!safeData.success) { // caso safeData deu errado
        res.json({ error: safeData.error.flatten().fieldErrors })
        return
    }

    // alterando os dados
    await updateUserInfo(
        req.userSlug as string, // usuário logado
        safeData.data // informações que o usuário mandou
    )

    res.json({})
}

// Posso alterar o nome, bio e link