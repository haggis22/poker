import { AuthenticationManager } from "../authentication-manager";

export class NPCAuthenticationManager implements AuthenticationManager {

    private token: string;


    constructor(token: string) {
        this.token = token;
    }

    public getToken(): string {

        return this.token;

    }

}

