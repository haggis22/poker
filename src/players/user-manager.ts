import { User } from "./user";
import { SecurityCommand } from "../commands/security/security-command";
import { LoginCommand, Message, ActionMessage, LoginAction, AuthenticatedAction } from "../communication/serializable";
import { IServerClient } from "../communication/server-side/i-server-client";
import { AuthenticateCommand } from "../commands/security/authenticate-command";
import { UserSummary } from "./user-summary";

export class UserManager {


    private userMapByID: Map<number, User>;
    private userMapByUsername: Map<string, User>;



    constructor() {

        this.userMapByID = new Map<number, User>();
        this.userMapByUsername = new Map<string, User>();

        let nextUserID: number = 0;

        this.addUser(new User(++nextUserID, 'dshell', 'Danny', 5000));
        this.addUser(new User(++nextUserID, 'moglesby', 'Matt', 4000));
        this.addUser(new User(++nextUserID, 'ptunney', 'Paul', 4000));
        this.addUser(new User(++nextUserID, 'srao', 'Sekhar', 4000));
        this.addUser(new User(++nextUserID, 'pgrudowski', 'Paul', 4000));
        this.addUser(new User(++nextUserID, 'jhoepken', 'Joe', 4000));
        this.addUser(new User(++nextUserID, 'mgillmore', 'Mark', 4000));
        this.addUser(new User(++nextUserID, 'benney', 'Billy', 4000));

    }

    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `UserManager ${msg}`);

    }


    public handleCommand(command: SecurityCommand, serverClient: IServerClient): Message {

        if (command instanceof LoginCommand) {

            let user: UserSummary = this.login(command.username, command.password);
            this.log(`Login for ${command.username} successful? ${(user != null)}`);

            // For now, just use the username as the auth token
            return user ? new ActionMessage(new LoginAction(user, user.username)) : new Message('Login failed');

        }

        if (command instanceof AuthenticateCommand) {

            let user: UserSummary = this.authenticate(command.authToken);
            this.log(`Authentication for ${command.authToken} successful? ${(user != null)}`);

            return user ? new ActionMessage(new AuthenticatedAction(user)) : new Message('Login failed');

        }


    }


    private addUser(user: User): void {

        this.userMapByID.set(user.id, user);

        this.log(`Adding username ${user.username} to the username map`);

        this.userMapByUsername.set(user.username, user);

    }


    public fetchUserByID(id: number): User {

        return this.userMapByID.get(id);

    }   // fetchUserByID


    private convertUserToSummary(user: User): UserSummary {

        return user ? new UserSummary(user.id, user.username, user.name) : null;

    }  // convertUserToSummary


    public authenticate(authToken: string): UserSummary {

        if (authToken != null) {

            return this.convertUserToSummary(this.userMapByUsername.get(authToken));

        }

        // unknown user
        return null;

    }  // authenticate


    private login(username: string, password: string): UserSummary {

        let user: User = this.userMapByUsername.get(username);

        if (user) {

            // TODO: validate password
            return this.convertUserToSummary(user);

        }

        // Unknown user
        return null;

    }  // login


}