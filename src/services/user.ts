import { Prisma } from "@prisma/client"
import { prisma } from "../utils/prisma"
import { getPublicURL } from "../utils/url"

// Usuários

// função buscar usuário pelo email
export const findUserByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: { email } // procure pelo email
    })
    if (user) { // se achou usuário
        return {
            ...user, // clonando o usuário
            avatar: getPublicURL(user.avatar), // retorna o nome do link completo para o arquivo
            cover: getPublicURL(user.cover)
        }
    }

    return null
}
// função para buscar o slug
export const findUserBySlug = async (slug: string) => {
    const user = await prisma.user.findFirst({
        select: { // selecionando o que será buscado
            avatar: true,
            cover: true,
            slug: true,
            name: true,
            bio: true,
            link: true
        },
        where: { slug } // procure pelo slug
    })
    if (user) { // se achou usuário
        return {
            ...user, // clonando o usuário
            avatar: getPublicURL(user.avatar), // retorna o nome do link completo para o arquivo
            cover: getPublicURL(user.cover)
        }
    }

    return null
}

// criando usuário
export const createUser = async (data: Prisma.UserCreateInput) => {
    const newUser = await prisma.user.create({ data })

    return {
        ...newUser, // preenchendo a URL
        avatar: getPublicURL(newUser.avatar), // retorna o nome do link completo para o arquivo
        cover: getPublicURL(newUser.cover)
    }

}