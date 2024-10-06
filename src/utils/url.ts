// link do arquivo do avatar e da capa
export const getPublicURL = (url: string) => {
    return `${process.env.BASE_URL}/${url}`
}