import { TokenManager } from "./token-manager";

export class FakeTokenManager implements TokenManager {

    private token: string;


    constructor(token: string) {
        this.token = token;
    }

    public getToken(): string {

        return this.token;

    }


}

