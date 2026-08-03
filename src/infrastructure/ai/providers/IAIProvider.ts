import type { AIProviders } from "../factory/AIProviders";

export interface IAIProvider {

    create(): AIProviders;

}