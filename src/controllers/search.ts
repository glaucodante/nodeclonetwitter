import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { searchSchema } from "../schemas/search";
import { findTweetsByBody } from "../services/tweet";


export const searchTweets = async (req: ExtendedRequest, res: Response) => {
    // validar as informações
    // tem q ter paginação, pois retornará várias buscas

    const safeData = searchSchema.safeParse(req.query) // validando os dados que vem da query
    if (!safeData.success) { // caso safeData deu errado
        res.json({ error: safeData.error.flatten().fieldErrors })
        return
    }

    // FUNCIONALIDADE EXTRA - PAGINAÇÃO 

    let perPage = 2 // quantos itens serão exibidos por página
    // currentPage = página atual    
    let currentPage = safeData.data.page ?? 0 // se eu mandei a pegue, pegue-o, caso contrário fica 0

    // função que irá buscar os tweets no service
    // usando a função criada
    // buscando os tweets
    const tweets = await findTweetsByBody(
        safeData.data.q, // o que queremos buscar
        currentPage,
        perPage
    )

    res.json({ tweets, page: currentPage })
}