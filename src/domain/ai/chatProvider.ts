export interface ChatProvider {

    answer(
        question: string,
        context: string
    ): Promise<string>;

}