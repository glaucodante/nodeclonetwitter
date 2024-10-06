import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { findUserBySlug } from '../services/user'
import { ExtendedRequest } from '../types/extended-request';

// CRIANDO O HASH

export const createJWT = (slug: string) => {
    return jwt.sign({ slug }, process.env.JWT_SECRET as string)
}


// Middleware = verificando JWT
// ExtendedRequest = estendendo o alcance
export const verifyJWT = (req: ExtendedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) { // se não tem o Authorization no header 
        res.status(401).json({ error: 'Acesso negado' })
        return // para parar a execução caso entre na linha acima
    }

    // Buscando o token
    const token = authHeader.split(' ')[1] //

    jwt.verify( // verify tem 3 PARAMETROS
        token, // mandando o token
        process.env.JWT_SECRET as string, // mandando a palavra chave secreta 
        async (error, decoded: any) => { // decoded do token = any, pois pode ser de qualquer tipo
            if (error) { // se deu erro para a execução
                res.status(401).json({ error: 'Acesso negado' })
                return // para parar a execução caso entre na linha acima
            }
            // verificando se tem um usuario com o slug
            const user = await findUserBySlug(decoded.slug)
            if (!user) {
                res.status(401).json({ error: 'Acesso negado' })
                return // para parar a execução caso entre na linha acima
            }
            // entrar na requisição e adicionar o slug do usuario que está logado 
            // no caso abaixo terá que ser feito um ExtendedRequest           
            req.userSlug = user.slug // adicionado o type do ExtendedRequest

            next() // liberar
        }
    )

}