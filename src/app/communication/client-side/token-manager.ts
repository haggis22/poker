export interface TokenManager {


    getToken(): string;

    saveToken(authToken: string): void;

}


