import { Router } from 'express'
import * as pingController from '../controllers/ping' // pegará todas as funções criadas naquele arquivo
import * as authController from '../controllers/auth'
import * as tweetController from '../controllers/tweet'
import * as userController from '../controllers/user'
import * as feedController from '../controllers/feed'
import { verifyJWT } from '../utils/jwt' // middleware (rota privada)

export const mainRouter = Router()

// configurando as rotas

mainRouter.get('/ping', pingController.ping)
mainRouter.get('/privateping', verifyJWT, pingController.privatePing)

// CADASTRANDO USUÁRIO
mainRouter.post('/auth/signup', authController.signup) // signup = cadastrando usuário
mainRouter.post('/auth/signin', authController.signin) // login

// GESTÃO DOS TWEETS
mainRouter.post('/tweet', verifyJWT, tweetController.addTweet) // criar tweet
mainRouter.get('/tweet/:id', verifyJWT, tweetController.getTweet) // busca tweet específico dinâmico (tweet/123)
mainRouter.get('/tweet/:id/answers', verifyJWT, tweetController.getAnswers) // busca resposta de um tweet específico
mainRouter.post('/tweet/:id/like', verifyJWT, tweetController.likeToggle) // criar/ remover like (dando um like) // cria ou remove
// toggle = alternar

// GESTÃO DOS USUÁRIOS
// slug = identificação do usuário
mainRouter.get('/user/:slug', verifyJWT, userController.getUser) // acessando dados de um usuário
mainRouter.get('/user/:slug/tweets', verifyJWT, userController.getUserTweets) // acessando tweets de um usuário
mainRouter.post('/user/:slug/follow', verifyJWT, userController.followToggle) // seguir ou desseguir
mainRouter.put('/user', verifyJWT, userController.updateUser) // alterar informações do usuário
// mainRouter.put('/user/avatar') // trocar imagem do avatar
// mainRouter.put('/user/cover') // trocar imagem da capa

// GESTÃO DO SISTEMA
mainRouter.get('/feed', verifyJWT, feedController.getFeed) // consultando o feed
// mainRouter.get('/search') // busca da pesquisa
// mainRouter.get('/trending') // buscas # (hashtag)
