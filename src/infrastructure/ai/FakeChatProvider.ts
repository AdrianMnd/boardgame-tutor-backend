import { IChatProvider } from "../../shared/contracts/IChatProvider";

export class FakeChatProvider
    implements IChatProvider {

    async ask(prompt: string): Promise<string> {

    console.log("");

    console.log("==================================");

    console.log("PROMPT");

    console.log("==================================");

    console.log("");

    console.log(prompt);

    console.log("");

    return "Respuesta simulada.";

}

}