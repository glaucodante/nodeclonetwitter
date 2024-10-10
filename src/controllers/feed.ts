import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { feedSchema } from "../schemas/feed";
import { getUserFollowing } from "../services/user";
import { findTweetFeed } from "../services/tweet";
// acessando FEED


export const getFeed = async (req: ExtendedRequest, res: Response) => {
    const safeData = feedSchema.safeParse(req.query) // validando os dados que vem da query
    if (!safeData.success) { // caso safeData deu errado
        res.json({ error: safeData.error.flatten().fieldErrors })
        return
    }

    // FUNCIONALIDADE EXTRA - PAGINAÇÃO 

    let perPage = 2 // quantos itens serão exibidos por página
    // currentPage = página atual    
    let currentPage = safeData.data.page ?? 0 // se eu mandei a pegue, pegue-o, caso contrário fica 0

    // pegando os usuários que sigo 
    // quais usuários que eu sigo (o usuário logado)
    const following = await getUserFollowing(req.userSlug as string) // peguei os usuários que eu sigo
    const tweets = await findTweetFeed(following, currentPage, perPage)

    res.json({ tweets, page: currentPage })

}