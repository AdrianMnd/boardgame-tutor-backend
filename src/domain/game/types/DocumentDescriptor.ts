/**
 * Describe un documento PDF dentro de la carpeta source/ de un
 * juego. Un juego puede tener uno solo (el caso habitual,
 * rulebook.pdf) o varios (reglamento básico + guía de
 * referencia + FAQ + packs de facciones...).
 */
export interface DocumentDescriptor {

    /**
     * Identificador único DENTRO del juego (no globalmente) —
     * se deriva del nombre de archivo. Ej. "rulebook",
     * "reference-guide", "faq-enero-2026".
     */
    id: string;

    /**
     * Nombre del archivo dentro de source/. Ej. "rulebook.pdf".
     */
    filename: string;

    /**
     * Nombre legible para mostrar al usuario, derivado
     * automáticamente del nombre de archivo. Ej.
     * "Reference Guide" a partir de "reference-guide.pdf".
     */
    name: string;

}
