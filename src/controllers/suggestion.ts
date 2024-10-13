import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { getUserSuggestions } from "../services/user";

// sugestões de usuários que eu não sigo
export const getSuggestions = async (req: ExtendedRequest, res: Response) => {
    const suggestions = await getUserSuggestions(req.userSlug as string) // sugestões de usuários que eu não sigo


    res.json({ users: suggestions })
}