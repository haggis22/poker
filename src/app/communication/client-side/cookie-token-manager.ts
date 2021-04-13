import { TokenManager } from "./token-manager";

export class CookieTokenManager implements TokenManager {


    public getToken(): string {

        return "dshell";

    }


}


