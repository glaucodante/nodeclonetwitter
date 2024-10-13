import { Prisma } from "@prisma/client"
import { prisma } from "../utils/prisma"
import { getPublicURL } from "../utils/url"
import slug from "slug"

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

// pegar as contagens de quem o usuário está seguindo (following)
export const getUserFollowingCount = async (slug: string) => {
    const count = await prisma.follow.count({ // contar quantos registros tem
        // user1Slug = tomou a ação de seguir
        where: { user1Slug: slug } // buscar quantas pessoas o usuário segue
    })

    return count // retornará a quantidade
}

// pegar as informações de quantas pessoas seguem aquele usuário (followers)
export const getUserFollowersCount = async (slug: string) => {
    const count = await prisma.follow.count({ // contar quantos registros tem
        // user2Slug = pessoa que segue o usuário
        where: { user2Slug: slug } // buscar quantas pessoas estão seguindo o usuário
    })

    return count // retornará a quantidade
}

// Quantos tweets esse usuário fez
export const getUserTweetCount = async (slug: string) => {
    const count = await prisma.tweet.count({ // contar quantos registros tem
        where: { userSlug: slug } // buscar quantos tweets o usuário fez
    })

    return count // retornará a quantidade
}

// verificando se um usuário segue o outro
export const checkIfFollows = async (user1Slug: string, user2Slug: string) => {
    const follows = await prisma.follow.findFirst({
        where: { user1Slug, user2Slug }
    })

    // se achou algum registro, então é pq segue, caso contrário, não segue
    return follows ? true : false
}

// SEGUIR
export const follow = async (user1Slug: string, user2Slug: string) => {
    await prisma.follow.create({ // será criado um registro
        data: { user1Slug, user2Slug } // de seguir
    })

}


// DEIXAR DE SEGUIR OU DESSEGUIR

export const unfollow = async (user1Slug: string, user2Slug: string) => {
    await prisma.follow.deleteMany({
        where: { user1Slug, user2Slug } // onde o usuário 1 seguir o 2, DELETAR o seguir
    })
}

// ALTERAR OS DADOS DO USUÁRIO
// Prisma.UserUpdateInput = campos que terá os dados que serão alterados...
export const updateUserInfo = async (slug: string, data: Prisma.UserUpdateInput) => {
    await prisma.user.update({ // informações que serão alteradas
        where: { slug }, // qual usuário quero trocar
        data // quais informações serão trocadas
    })
}

// pegando a lista de usuários que eu sigo (usuário logado)
export const getUserFollowing = async (slug: string) => {
    const following = [] // é uma lista 
    const reqFollow = await prisma.follow.findMany({ // pegando os usuários 
        select: { user2Slug: true },
        where: { user1Slug: slug } // user 1 = slug (eu sigo)
    })

    for (let reqItem of reqFollow) {
        following.push(reqItem.user2Slug) // adicionando na lista
    }

    return following
}

// CRIANDO A FUNÇÃO DE SUGESTÃO DE USUÁRIOS A SEGUIR
export const getUserSuggestions = async (slug: string) => {
    // quais são os usuários que eu sigo?
    const following = await getUserFollowing(slug) // pegando os usuários que eu sigo
    // followingPlusMe = seguidores mais eu 
    const followingPlusMe = [...following, slug] // LISTA QUE NÃO QUERO UTILIZAR (pegando os meus seguidores mais EU)

    // preciso pegar uma lista de usuários de forma aleatória
    // O PRISMA não possui uma forma de buscar o usuário aleatoriamente
    // vou ter que criar uma QUERY DIRETA (CRUA) QUE ACESSARÁ O BANCO DE DADOS

    // type Suggestions = Prisma.UserGetPayload<Prisma.UserDefaultArgs> // pega todos os campos do user
    // método abaixo pega apenas os campos listados
    type Suggestions = Pick<
        Prisma.UserGetPayload<Prisma.UserDefaultArgs>,
        "name" | "avatar" | "slug"
    >

    // aqui terá apenas name, avatar, slug, conforme o filtro feito com PICK
    const suggestions: Suggestions[] = await prisma.$queryRaw` 
        SELECT /* pegue */
            name, avatar, slug  
        FROM "User"
        WHERE /* onde */
            slug NOT IN (${followingPlusMe.join(',')})  /* pegue os que NÃO estão nessa lista */
        ORDER BY RANDOM() /* ALEATORIAMENTE */
        LIMIT 2 /* APENAS 2 */
    `
    // O nome da função de aleatoriedade no POSTGRE é RANDOM()
    // Se fosse no mysql seria RAND()

    // pegando o avatar e organizar a URL 
    for (let sugIndex in suggestions) {
        suggestions[sugIndex].avatar = getPublicURL(suggestions[sugIndex].avatar)
    }

    return suggestions
}
