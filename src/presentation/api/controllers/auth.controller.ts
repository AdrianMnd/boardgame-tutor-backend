import type {
    Request,
    Response
} from "express";

import { RegisterUserUseCase } from "../../../application/use-cases/register-user/register-user.use-case";
import { LoginUserUseCase } from "../../../application/use-cases/login-user/login-user.use-case";
import { UpdateDisplayNameUseCase } from "../../../application/use-cases/update-profile/update-display-name.use-case";
import { UpdateEmailUseCase } from "../../../application/use-cases/update-profile/update-email.use-case";
import { UpdatePasswordUseCase } from "../../../application/use-cases/update-profile/update-password.use-case";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { RegisterRequest, LoginRequest, AuthResponse, UpdateDisplayNameRequest, UpdateEmailRequest, UpdatePasswordRequest } from "../dto/authDto";
import type { AuthenticatedRequest } from "../middleware/requireAuth";

import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";

import { toUserResponse } from "../mappers/userMapper";

export class AuthController {

    constructor(

        private readonly registerUseCase: RegisterUserUseCase,

        private readonly loginUseCase: LoginUserUseCase,

        private readonly userRepository: IUserRepository,

        private readonly updateDisplayNameUseCase: UpdateDisplayNameUseCase,

        private readonly updateEmailUseCase: UpdateEmailUseCase,

        private readonly updatePasswordUseCase: UpdatePasswordUseCase

    ) {}

    register = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const body = request.body as Partial<RegisterRequest>;

        if (

            typeof body.email !== "string" ||
            typeof body.password !== "string" ||
            typeof body.displayName !== "string"

        ) {

            throw new BadRequestError(

                "Faltan campos obligatorios: email, password, displayName."

            );

        }

        const { user, token } =

            await this.registerUseCase.execute(

                body.email,

                body.password,

                body.displayName

            );

        const payload: AuthResponse = {

            token,

            user:

                toUserResponse(user)

        };

        response.status(201).json(payload);

    };

    login = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const body = request.body as Partial<LoginRequest>;

        if (

            typeof body.email !== "string" ||
            typeof body.password !== "string"

        ) {

            throw new BadRequestError(

                "Faltan campos obligatorios: email, password."

            );

        }

        const { user, token } =

            await this.loginUseCase.execute(

                body.email,

                body.password

            );

        const payload: AuthResponse = {

            token,

            user:

                toUserResponse(user)

        };

        response.json(payload);

    };

    me = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const user =
            await this.userRepository.findById(userId);

        if (!user) {

            throw new NotFoundError(

                "El usuario de este token ya no existe."

            );

        }

        response.json(

            toUserResponse(user)

        );

    };

    updateDisplayName = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const body = request.body as Partial<UpdateDisplayNameRequest>;

        if (typeof body.displayName !== "string") {

            throw new BadRequestError(

                "Falta el campo obligatorio: displayName."

            );

        }

        const user =

            await this.updateDisplayNameUseCase.execute(

                userId,

                body.displayName

            );

        response.json(

            toUserResponse(user)

        );

    };

    updateEmail = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const body = request.body as Partial<UpdateEmailRequest>;

        if (

            typeof body.email !== "string" ||
            typeof body.currentPassword !== "string"

        ) {

            throw new BadRequestError(

                "Faltan campos obligatorios: email, currentPassword."

            );

        }

        const user =

            await this.updateEmailUseCase.execute(

                userId,

                body.email,

                body.currentPassword

            );

        response.json(

            toUserResponse(user)

        );

    };

    updatePassword = async (

        request: Request,

        response: Response

    ): Promise<void> => {

        const { userId } = request as AuthenticatedRequest;

        const body = request.body as Partial<UpdatePasswordRequest>;

        if (

            typeof body.currentPassword !== "string" ||
            typeof body.newPassword !== "string"

        ) {

            throw new BadRequestError(

                "Faltan campos obligatorios: currentPassword, newPassword."

            );

        }

        await this.updatePasswordUseCase.execute(

            userId,

            body.currentPassword,

            body.newPassword

        );

        response.status(204).end();

    };

}
