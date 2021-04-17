import { TokenManager } from "./token-manager";

export class CookieTokenManager implements TokenManager {

    private static readonly STORAGE_KEY_NAME = 'session-token';

    constructor() {


    }


    public getToken(): string {

        return localStorage.getItem(CookieTokenManager.STORAGE_KEY_NAME);

    }

    public saveToken(authToken: string): void {

        localStorage.setItem(CookieTokenManager.STORAGE_KEY_NAME, authToken);

    }


}

