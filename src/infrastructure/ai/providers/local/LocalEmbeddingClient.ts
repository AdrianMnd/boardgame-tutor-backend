import type { ChatMessage } from "../../common/ChatMessage";
import type { ILLMClient } from "../../common/ILLMClient";
import type { LocalEmbeddingConfiguration } from "../../../../config/localEmbedding";

/**
 * Genera embeddings ejecutando un modelo localmente (ONNX, vía
 * @huggingface/transformers), sin llamar a ningún servicio
 * externo. Gratis, sin límite de peticiones, sin cuota.
 *
 * Pensado sobre todo para el comando `npm run import`, que es
 * el que dispara cientos de peticiones de golpe y por eso
 * agota la cuota gratuita de los proveedores en la nube. Al
 * no depender de red, funciona igual en local que en un
 * servidor desplegado con el proceso siempre activo (ej. Render).
 *
 * El modelo se descarga la primera vez que se usa (unos 90MB
 * para el modelo por defecto) y se cachea en disco; a partir de
 * ahí no hace falta red para generar más embeddings.
 *
 * No genera texto/chat — solo embeddings. `supportsChat` se
 * declara en `false` para que FallbackLLMClient nunca lo
 * intente para responder preguntas.
 */
export class LocalEmbeddingClient
    implements ILLMClient {

    readonly supportsEmbeddings = true;

    readonly supportsChat = false;

    // Se inicializa una sola vez y se reutiliza entre llamadas
    // (cargar el modelo tiene un coste que no queremos pagar
    // en cada embedding).
    private pipelinePromise:
        Promise<any> | null = null;

    constructor(

        private readonly configuration: LocalEmbeddingConfiguration

    ) {}

    private async getPipeline(): Promise<any> {

        if (!this.pipelinePromise) {

            this.pipelinePromise =

                import("@huggingface/transformers")

                    .then(({ pipeline }) =>

                        pipeline(

                            "feature-extraction",

                            this.configuration.model

                        )

                    );

        }

        return this.pipelinePromise;

    }

    async generateEmbedding(

        text: string

    ): Promise<number[]> {

        const extractor =
            await this.getPipeline();

        const output =

            await extractor(

                text,

                {

                    pooling: "mean",

                    normalize: true

                }

            );

        return Array.from(

            output.data as ArrayLike<number>

        );

    }

    async generateText(

        _prompt: string

    ): Promise<string> {

        throw new Error(

            "El modelo local solo genera embeddings, no texto/chat."

        );

    }

    async generateChat(

        _messages: ChatMessage[]

    ): Promise<string> {

        throw new Error(

            "El modelo local solo genera embeddings, no texto/chat."

        );

    }

}
