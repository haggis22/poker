import { AuthenticationManager } from "../authentication-manager";

export class NPCAuthenticationManager implements AuthenticationManager {

    private token: string;


    constructor(token: string) {
        this.token = token;
    }

    public getToken(): string {

        return this.token;

    }


    public saveToken(token: string): void {

        // Nothing to do here - it's all FAKE!

    }

    public clearToken(): void {

        // Nothing to do here - it's all FAKE!

    }

}

