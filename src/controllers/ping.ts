import { Request, Response } from 'express'
import { ExtendedRequest } from '../types/extended-request'

// funções relacionas ao PING

export const ping = (req: Request, res: Response) => {
    // console.log(`Executou o ping`)
    res.json({ pong: true })
}
// função privada
// adicionando o slug do usuario que está logado
// com o ExtendedRequest
export const privatePing = (req: ExtendedRequest, res: Response) => {
    // console.log(`Executou o ping`)
    res.json({ pong: true, slug: req.userSlug }) // vai retornar, além do pong, o usuário que está logado
}
