import { ApiError } from "./ApiError";

export class BadRequestError extends ApiError {

    constructor(

        message: string

    ) {

        super(

            400,

            "BAD_REQUEST",

            message

        );

    }

}