import { IMPORT_CONFIGURATION } from "../../config/import";
import { loadDatabaseConfiguration } from "../../config/database";
import { loadStorageConfiguration } from "../../config/storage";
import { loadEmailConfiguration } from "../../config/email";
import { loadAuthConfiguration } from "../../config/auth";

import { createPool } from "../../infrastructure/database/pool";
import { PostgresGameRepository } from "../../infrastructure/repositories/PostgresGameRepository";
import { PostgresUserRepository } from "../../infrastructure/repositories/PostgresUserRepository";
import { PostgresFavoritesRepository } from "../../infrastructure/repositories/PostgresFavoritesRepository";
import { PostgresCategoryRepository } from "../../infrastructure/repositories/PostgresCategoryRepository";
import { PostgresGameRequestRepository } from "../../infrastructure/repositories/PostgresGameRequestRepository";
import { PostgresConversationRepository } from "../../infrastructure/repositories/PostgresConversationRepository";
import { PgVectorRetriever } from "../../infrastructure/database/PgVectorRetriever";
import { B2FileStorage } from "../../infrastructure/storage/B2FileStorage";
import { EmailService } from "../../infrastructure/email/EmailService";
import { PasswordHasher } from "../../infrastructure/auth/PasswordHasher";
import { JwtService } from "../../infrastructure/auth/JwtService";

import { AIProviderFactory } from "../../infrastructure/ai/factory/AIProviderFactory";

import { GameValidator } from "../../domain/game/services/game-validator.service";
import { ContextBuilder } from "../../domain/ai/contextBuilder";

import { AskQuestionUseCase } from "../use-cases/ask-question/ask-question.use-case";
import { ListGamesUseCase } from "../use-cases/list-games/list-games.use-case";
import { GetGameManualUseCase } from "../use-cases/get-game-manual/get-game-manual.use-case";
import { RegisterUserUseCase } from "../use-cases/register-user/register-user.use-case";
import { LoginUserUseCase } from "../use-cases/login-user/login-user.use-case";
import { UpdateDisplayNameUseCase } from "../use-cases/update-profile/update-display-name.use-case";
import { UpdateEmailUseCase } from "../use-cases/update-profile/update-email.use-case";
import { UpdatePasswordUseCase } from "../use-cases/update-profile/update-password.use-case";
import { FavoritesUseCase } from "../use-cases/favorites/favorites.use-case";
import { CategoriesUseCase } from "../use-cases/categories/categories.use-case";
import { ConversationsUseCase } from "../use-cases/conversations/conversations.use-case";
import { GameRequestUseCase } from "../use-cases/game-request/game-request.use-case";
import { ListGameRequestsUseCase } from "../use-cases/game-request/list-game-requests.use-case";
import { MarkGameRequestReviewedUseCase } from "../use-cases/game-request/mark-game-request-reviewed.use-case";

export class ApplicationContainer {

    readonly pool =
        createPool(
            loadDatabaseConfiguration()
        );

    readonly storage =
        new B2FileStorage(
            loadStorageConfiguration()
        );

    readonly repository =
        new PostgresGameRepository(
            this.pool
        );

    readonly listGamesUseCase =
        new ListGamesUseCase(
            this.repository
        );

    readonly getGameManualUseCase =
        new GetGameManualUseCase(
            this.repository,
            this.storage
        );

    readonly validator =
        new GameValidator(
            this.repository
        );

    readonly ai =
        AIProviderFactory.create();

    readonly embeddingProvider =
        this.ai.embeddingProvider;

    readonly chatProvider =
        this.ai.chatProvider;

    readonly retriever =
        new PgVectorRetriever(
            this.pool,
            IMPORT_CONFIGURATION
        );

    readonly contextBuilder =
        new ContextBuilder();

    readonly askQuestionUseCase =
        new AskQuestionUseCase(

            this.validator,

            this.embeddingProvider,

            this.retriever,

            this.contextBuilder,

            this.chatProvider

        );

    // ==================== Autenticación ====================

    readonly authConfiguration =
        loadAuthConfiguration();

    readonly userRepository =
        new PostgresUserRepository(
            this.pool
        );

    readonly passwordHasher =
        new PasswordHasher();

    readonly jwtService =
        new JwtService(
            this.authConfiguration
        );

    readonly registerUserUseCase =
        new RegisterUserUseCase(

            this.userRepository,

            this.passwordHasher,

            this.jwtService

        );

    readonly loginUserUseCase =
        new LoginUserUseCase(

            this.userRepository,

            this.passwordHasher,

            this.jwtService

        );

    readonly updateDisplayNameUseCase =
        new UpdateDisplayNameUseCase(
            this.userRepository
        );

    readonly updateEmailUseCase =
        new UpdateEmailUseCase(

            this.userRepository,

            this.passwordHasher

        );

    readonly updatePasswordUseCase =
        new UpdatePasswordUseCase(

            this.userRepository,

            this.passwordHasher

        );

    readonly favoritesRepository =
        new PostgresFavoritesRepository(
            this.pool
        );

    readonly favoritesUseCase =
        new FavoritesUseCase(
            this.favoritesRepository
        );

    readonly categoryRepository =
        new PostgresCategoryRepository(
            this.pool
        );

    readonly categoriesUseCase =
        new CategoriesUseCase(
            this.categoryRepository
        );

    readonly conversationRepository =
        new PostgresConversationRepository(
            this.pool
        );

    readonly conversationsUseCase =
        new ConversationsUseCase(
            this.conversationRepository
        );

    readonly emailService =
        new EmailService(
            loadEmailConfiguration()
        );

    readonly gameRequestRepository =
        new PostgresGameRequestRepository(
            this.pool
        );

    readonly gameRequestUseCase =
        new GameRequestUseCase(

            this.storage,

            this.emailService,

            this.gameRequestRepository

        );

    readonly listGameRequestsUseCase =
        new ListGameRequestsUseCase(

            this.gameRequestRepository,

            this.storage

        );

    readonly markGameRequestReviewedUseCase =
        new MarkGameRequestReviewedUseCase(

            this.gameRequestRepository

        );

}

