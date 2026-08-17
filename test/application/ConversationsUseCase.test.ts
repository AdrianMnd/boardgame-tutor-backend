import { describe, expect, it, vi } from "vitest";

import { ConversationsUseCase } from "../../src/application/use-cases/conversations/conversations.use-case";
import { BadRequestError } from "../../src/presentation/api/errors/BadRequestError";

import type { IConversationRepository } from "../../src/domain/conversation/repositories/IConversationRepository";

function makeFakeRepository(

    overrides: Partial<IConversationRepository> = {}

): IConversationRepository {

    return {

        listMessages: vi.fn().mockResolvedValue([]),

        addMessage: vi.fn().mockResolvedValue({

            id: "msg-1",

            role: "user",

            content: "test",

            createdAt: new Date().toISOString()

        }),

        clearConversation: vi.fn().mockResolvedValue(undefined),

        ...overrides

    };

}

describe("ConversationsUseCase", () => {

    it("lista los mensajes de un usuario y juego", async () => {

        const repository = makeFakeRepository();

        const useCase = new ConversationsUseCase(repository);

        await useCase.listMessages("user-1", "catan");

        expect(repository.listMessages).toHaveBeenCalledWith("user-1", "catan");

    });

    it("añade un mensaje correctamente", async () => {

        const repository = makeFakeRepository();

        const useCase = new ConversationsUseCase(repository);

        await useCase.addMessage("user-1", "catan", "user", "¿Cómo se gana?");

        expect(repository.addMessage).toHaveBeenCalledWith(

            "user-1",

            "catan",

            "user",

            "¿Cómo se gana?",

            undefined

        );

    });

    it("rechaza un mensaje con contenido vacío, sin llegar a tocar el repositorio", async () => {

        const repository = makeFakeRepository();

        const useCase = new ConversationsUseCase(repository);

        await expect(

            useCase.addMessage("user-1", "catan", "user", "   ")

        ).rejects.toBeInstanceOf(BadRequestError);

        expect(repository.addMessage).not.toHaveBeenCalled();

    });

    it("borra la conversación de un usuario y juego", async () => {

        const repository = makeFakeRepository();

        const useCase = new ConversationsUseCase(repository);

        await useCase.clearConversation("user-1", "catan");

        expect(repository.clearConversation).toHaveBeenCalledWith("user-1", "catan");

    });

});
