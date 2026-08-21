export interface PasswordResetRequestRecord {

    id: string;

    email: string;

    resolved: boolean;

    createdAt: string;

}

export interface IPasswordResetRequestRepository {

    create(

        email: string

    ): Promise<void>;

    list(): Promise<PasswordResetRequestRecord[]>;

    markResolved(

        id: string

    ): Promise<void>;

}
