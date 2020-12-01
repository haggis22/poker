import { User } from "./user";

export class UserManager {


    private userMapByID: Map<number, User>;
    private userMapByUsername: Map<string, User>;



    constructor() {

        this.userMapByID = new Map<number, User>();
        this.userMapByUsername = new Map<string, User>();

        this.addUser(new User(1, 'dshell', 'Danny', 1000));
        this.addUser(new User(2, 'moglesby', 'Matt', 1000));
        this.addUser(new User(3, 'ptunney', 'Paul', 1000));
        this.addUser(new User(4, 'srao', 'Sekhar', 1000));
        this.addUser(new User(5, 'pgrudowski', 'Paul', 1000));
        this.addUser(new User(6, 'jhoepken', 'Joe', 1000));
        this.addUser(new User(7, 'mgillmore', 'Mark', 1000));
        this.addUser(new User(8, 'benney', 'Billy', 1000));

    }


    private addUser(user: User): void {

        this.userMapByID.set(user.id, user);
        this.userMapByUsername.set(user.username, user);

    }


    fetchUserByID(id: number): User {

        return this.userMapByID.get(id);

    }   // fetchUserByID


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