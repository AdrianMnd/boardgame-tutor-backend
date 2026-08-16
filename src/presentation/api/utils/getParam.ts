import type { Request } from "express";

import { BadRequestError } from "../errors/BadRequestError";

/**
 * Express tipa request.params como `string | string[]` (algunos
 * patrones de ruta poco habituales podrían producir un array),
 * pero ninguna de nuestras rutas lo hace nunca en la práctica.
 * Esta ayuda deja esa garantía explícita en un único sitio, en
 * vez de repetir el mismo "as string" en cada controlador.
 */
export function getParam(

    request: Request,

    name: string

): string {

    const value = request.params[name];

    if (typeof value !== "string" || value.length === 0) {

        throw new BadRequestError(

            `Falta el parámetro de ruta: ${name}.`

        );

    }

    return value;

}
