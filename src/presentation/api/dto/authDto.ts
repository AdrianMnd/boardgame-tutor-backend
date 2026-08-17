export interface RegisterRequest {

    email: string;

    password: string;

    displayName: string;

}

export interface LoginRequest {

    email: string;

    password: string;

}

export interface UpdateDisplayNameRequest {

    displayName: string;

}

export interface UpdateEmailRequest {

    email: string;

    currentPassword: string;

}

export interface UpdatePasswordRequest {

    currentPassword: string;

    newPassword: string;

}

export interface AuthResponse {

    token: string;

    user: {

        id: string;

        email: string;

        displayName: string;

    };

}
