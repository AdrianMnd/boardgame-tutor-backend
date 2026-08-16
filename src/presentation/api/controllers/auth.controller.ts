import type {
    Request,
    Response
} from "express";

import { RegisterUserUseCase } from "../../../application/use-cases/register-user/register-user.use-case";
import { LoginUserUseCase } from "../../../application/use-cases/login-user/login-user.use-case";

import type { IUserRepository } from "../../../domain/user/repositories/IUserRepository";
import type { RegisterRequest, LoginRequest, AuthResponse } from "../dto/authDto";
import type { AuthenticatedRequest } from "../middleware/requireAuth";

import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";

export class AuthController {

    constructor(

        private readonly registerUseCase: RegisterUserUseCase,

        private readonly loginUseCase: LoginUserUseCase,

        private readonly userRepository: IUserRepository

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

            user: {

                id: user.id,

                email: user.email,

                displayName: user.displayName

            }

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

            user: {

                id: user.id,

                email: user.email,

                displayName: user.displayName

            }

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

        response.json({

            id: user.id,

            email: user.email,

            displayName: user.displayName

        });

    };

}
