import { AuthenticationManager } from "../authentication-manager";
import { userState } from '@/store/user-state';

export class ClientAuthenticationManager implements AuthenticationManager {


    constructor() {

    }


    public getToken(): string {

        return userState.getToken.value;

    }

}

