import { ApiError } from "./ApiError";

export class ConflictError extends ApiError {

    constructor(

        message: string

    ) {

        super(

            409,

            "CONFLICT",

            message

        );

    }

}
