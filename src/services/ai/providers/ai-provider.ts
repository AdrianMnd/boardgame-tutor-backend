export interface AIProvider {

    ask(
        question: string,
        context: string
    ): Promise<string>;

}