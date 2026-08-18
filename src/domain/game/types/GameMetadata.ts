export interface GameMetadata {

    /**
     * Identificador único.
     * Debe coincidir con el nombre de la carpeta.
     */
    id: string;

    /**
     * Nombre visible.
     */
    name: string;

    /**
     * Idioma principal.
     */
    language: string;

    /**
     * Versión del reglamento.
     */
    version: string;

    /**
     * Número mínimo de jugadores.
     */
    minPlayers: number;

    /**
     * Número máximo de jugadores.
     */
    maxPlayers: number;

    /**
     * Año de publicación.
     */
    year: number;

    /**
     * Fecha de alta en el catálogo — la genera la propia base de
     * datos al insertar (DEFAULT now()), así que el flujo de
     * importación local nunca la conoce de antemano. Solo se
     * rellena al leer un juego ya existente desde el
     * repositorio, nunca al construirlo para importarlo.
     */
    createdAt?: string;

}