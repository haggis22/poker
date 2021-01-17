import { User } from "./user";
import { SecurityCommand } from "../commands/security/security-command";
import { LoginCommand, Message, ActionMessage, LoginAction } from "../communication/serializable";
import { IServerClient } from "../communication/server-side/i-server-client";

export class UserManager {


    private userMapByID: Map<number, User>;
    private userMapByUsername: Map<string, User>;



    constructor() {

        this.userMapByID = new Map<number, User>();
        this.userMapByUsername = new Map<string, User>();

        this.addUser(new User(1, 'dshell', 'Danny', 5000));
        this.addUser(new User(2, 'moglesby', 'Matt', 4000));
        this.addUser(new User(3, 'ptunney', 'Paul', 4000));
        this.addUser(new User(4, 'srao', 'Sekhar', 4000));
        this.addUser(new User(5, 'pgrudowski', 'Paul', 4000));
        this.addUser(new User(6, 'jhoepken', 'Joe', 4000));
        this.addUser(new User(7, 'mgillmore', 'Mark', 4000));
        this.addUser(new User(8, 'benney', 'Billy', 4000));

    }

    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `UserManager ${msg}`);

    }


    public handleCommand(command: SecurityCommand, serverClient: IServerClient): Message {

        if (command instanceof LoginCommand) {

            let user: User = this.login(command.username, command.password);
            this.log(`Login for ${command.username} successful? ${(user != null)}`);

            return user ? new ActionMessage(new LoginAction(user)) : new Message('Login failed');

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


    authenticate(authToken: string): User {

        if (authToken != null) {

            return this.userMapByUsername.get(authToken);

        }

        // unknown user
        return null;

    }  // authenticate


    login(username: string, password: string): User {

        let user: User = this.userMapByUsername.get(username);
        if (user) {

            // TODO: validate password
            return user;

        }

        // Unknown user
        return user;

    }  // login


}