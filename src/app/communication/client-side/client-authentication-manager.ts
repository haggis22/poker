import { AuthenticationManager } from "../authentication-manager";

export class ClientAuthenticationManager implements AuthenticationManager {

    private static readonly STORAGE_KEY_NAME = 'session-token';

    constructor() {


    }


    public getToken(): string {

        return localStorage.getItem(ClientAuthenticationManager.STORAGE_KEY_NAME);

    }

    public saveToken(authToken: string): void {

        localStorage.setItem(ClientAuthenticationManager.STORAGE_KEY_NAME, authToken);

    }

    public clearToken(): void {

        localStorage.removeItem(ClientAuthenticationManager.STORAGE_KEY_NAME);

    }



}

