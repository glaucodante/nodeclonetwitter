import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { addTweetSchema } from "../schemas/add-tweet";
import { createTweet, findTweet } from "../services/tweet";
import { addHashtag } from "../services/trend";

// ExtendedRequest = para dar acesso ao usuário que está logado
export const addTweet = async (req: ExtendedRequest, res: Response) => {

    // validar os dados enviados usando o ZOD
    const safeData = addTweetSchema.safeParse(req.body) // validando os dados
    if (!safeData.success) { // caso safeData deu errado
        res.json({ error: safeData.error.flatten().fieldErrors })
        return
    }

    // verificando se é um tweet original ou se é uma resposta de outro tweet
    if (safeData.data.answer) { // se mandou uma resposta de um tweet existente
        // TUDO QUE VEM DO BODY VEM COMO STRING
        // parseInt = para transformar em number o parseInt(safeData.data.answer)
        // o tweet tem um numero
        const hasAnswerTweet = await findTweet(parseInt(safeData.data.answer))
        if (!hasAnswerTweet) {
            res.json({ error: 'Tweet original inexistente' })
            return
        }
    }

    // CRIANDO UM TWEET

    const newTweet = await createTweet(
        req.userSlug as string, // usuário que está logado
        safeData.data.body, // texto do tweet
        // se for uma resposta mande uma resposta, caso contrário 0 (não possui resposta)
        safeData.data.answer ? parseInt(safeData.data.answer) : 0

    )

    // adicionar a hashtag ao trend
    // verificando se tem alguma hashtag utilizando expressão regular
    const hashtags = safeData.data.body.match(/#[a-zA-Z0-9_]+/g) // expressão regular
    if (hashtags) { // se achou alguma hashtag
        for (let hashtag of hashtags) { // LOOP - para adicioná-las
            if (hashtag.length >= 2) { // verificando se a hashtag tem 2 ou mais caracteres
                await addHashtag(hashtag)  // adicionando a hashtag
            }
        }
    }

    res.json({ tweet: newTweet }) // retorno do tweet criado ou a resposta
}

// buscando tweet
export const getTweet = async (req: ExtendedRequest, res: Response) => {
    // pra receber o /:id => dinâmico que está na URL, ele está em params
    const { id } = req.params // o id (dinâmico) está em params
    // console.log(id)
    const tweet = await findTweet(parseInt(id)) // id vem como string, altero para inteiro
    if (!tweet) res.json({ error: 'Tweet inexistente' })  // se não achar o tweet

    console.log(`ID: ${id}`) // mostrando o ID no console

    res.json({ tweet })

}