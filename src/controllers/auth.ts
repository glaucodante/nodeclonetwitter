import { RequestHandler } from "express";
import { signupSchema } from "../schemas/signup";
import { signinSchema } from "../schemas/signin";
import { createUser, findUserByEmail, findUserBySlug } from "../services/user";
import slug from "slug";
import { compare, hash } from "bcrypt-ts";
import { createJWT } from "../utils/jwt";

// signup = cadastrando usuário
export const signup: RequestHandler = async (req, res) => {
    // validar os dados recebidos
    // usando função do zod que valida os dados
    // SAFE PARSE = parse seguro, não irá explodir o erro na tela  
    const safeData = signupSchema.safeParse(req.body) // validando os dados
    if (!safeData.success) { // caso safeData deu errado
        res.json({ error: safeData.error.flatten().fieldErrors })
        return
    }

    // verificar email
    const hasEmail = await findUserByEmail(safeData.data.email)
    if (hasEmail) { // se o email já existe 
        res.json({ error: 'E-mail já existe.' })
        return
    }

    // slug = identificação do usuário 
    // verificar o slug (não pode ter dois usuários com o mesmo slug)
    let genSlug = true // gerar o slug
    let userSlug = slug(safeData.data.name) // criando o slug
    // loop
    while (genSlug) { // enquanto o slug for true continue gerando
        const hasSlug = await findUserBySlug(userSlug)
        if (hasSlug) { // se o slug já existir
            // gerando numero aleatório, para ser adicionado após o slug, caso slug repetido            
            let slugSuffix = Math.floor(Math.random() * 999999).toString()
            userSlug = slug(safeData.data.name + slugSuffix) //adicionando o sufixo no slug
        } else {
            genSlug = false
        }
    }

    // gerar hash de senha
    const hashPassword = await hash(safeData.data.password, 10) // hash => bcrypt-ts

    // cria o usuário
    const newUser = await createUser({
        slug: userSlug,
        name: safeData.data.name,
        email: safeData.data.email,
        password: hashPassword
    })

    // cria o token de acesso
    const token = createJWT(userSlug) // Gerando o TOKEN com JWT

    // retorna o resultado (token, user)
    res.status(201).json({
        token,
        user: {
            name: newUser.name,
            slug: newUser.slug,
            avatar: newUser.avatar
        }
    })
}

// SIGNIN = LOGIN => para fazer o login
export const signin: RequestHandler = async (req, res) => {
    // validar os dados recebidos
    // usando função do zod que valida os dados
    // SAFE PARSE = parse seguro, não irá explodir o erro na tela  
    const safeData = signinSchema.safeParse(req.body) // validando os dados
    if (!safeData.success) { // caso safeData deu errado
        res.json({ error: safeData.error.flatten().fieldErrors })
        return
    }

    const user = await findUserByEmail(safeData.data.email) // buscar usuário pelo email
    // não é usuário
    if (!user) {
        res.status(401).json({ error: 'Acesso Negado (email incorreto)' })
        return
    }
    // verificando a senha
    // compare = é uma função do bcrypt para verificar a senha e comparar com o hash salvo no BD
    const verifyPass = await compare(safeData.data.password, user.password)
    if (!verifyPass) { // se senha errada
        res.status(401).json({ error: 'Acesso Negado (senha incorreta)' })
        return
    }

    const token = createJWT(user.slug) // usuário logou então cria um token de acesso
    res.json({
        token,
        user: { // retorna o usuário já logado 
            name: user.name,
            slug: user.slug,
            avatar: user.avatar
        }
    })
}

