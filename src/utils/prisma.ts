// CRIANDO A CONEXÃO COM O BD
import { PrismaClient } from '@prisma/client'

// código copiado da documentação do prisma
// https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/databases-connections
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()
// reaproveitamento de conexão
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Este arquivo refere-se a conexão com o BD, o código acima evita que seja
// conexões desnecessárias
// Impedir que o hot reloading crie novas instâncias
// Evitando instâncias adicionais indesejadas de PrismaClient em um
// ambiente de desenvolvimento.