// extendendo o request para req.user.slug = user.slug

import { Request } from "express";

// estendendo, ou seja, aumentando o alcance do Request
export type ExtendedRequest = Request & {
    userSlug?: string
}