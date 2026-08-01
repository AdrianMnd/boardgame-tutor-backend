export interface IChatProvider {

    ask(

        prompt: string

    ): Promise<string>;

}