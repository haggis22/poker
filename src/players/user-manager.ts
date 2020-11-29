import { User } from "./user";

export class UserManager {



    constructor() {


    }


    getUserByID(id: number): User {


        switch (id) {

            case 1:
                return new User(1, 'Danny', 1000);

            case 2: 
                return new User(2, 'Matt', 1000);

            case 3: 
                return new User(3, 'Paul', 1000);

            case 4:
                return new User(4, 'Sekhar', 1000);

        }

        throw new Error(`Could not find user ${id}`);

    }   // getUserByID


}