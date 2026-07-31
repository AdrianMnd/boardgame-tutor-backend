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
    minPlayers?: number;

    /**
     * Número máximo de jugadores.
     */
    maxPlayers?: number;

    /**
     * Año de publicación.
     */
    year?: number;

}