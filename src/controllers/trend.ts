import { Response } from "express";
import { ExtendedRequest } from "../types/extended-request";
import { getTrending } from "../services/trend";

// CONSULTA O BD e RETORNA O RESULTADO

export const getTrends = async (req: ExtendedRequest, res: Response) => {
    const trends = await getTrending()

    res.json({ trends })
}