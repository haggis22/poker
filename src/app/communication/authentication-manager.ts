export interface AuthenticationManager {


    getToken(): string;

    saveToken(authToken: string): void;

    clearToken(): void;

}


