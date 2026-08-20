import { isAdminEmail } from "../../../config/admin";

import type { User } from "../../../domain/user/types/User";

export function toUserResponse(

    user: User

) {

    return {

        id: user.id,

        email: user.email,

        displayName: user.displayName,

        isAdmin: isAdminEmail(user.email)

    };

}
