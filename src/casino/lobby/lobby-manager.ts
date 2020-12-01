import { TableManager } from './table-manager';
import { UserManager } from '../../players/user-manager';
import { User } from '../../players/user';

import { IServerClient } from '../../communication/server-side/i-server-client';


export class LobbyManager {


    private tableManager: TableManager;
    private userManager: UserManager;

    // We're maintaining a link to clients so that they don't get garbage-collected
    private clients: Set<IServerClient>;


    constructor(userManager: UserManager, tableManager: TableManager) {

        this.userManager = userManager;
        this.tableManager = tableManager;

        this.clients = new Set<IServerClient>();

    }


    private log(msg: string): void {

        console.log('\x1b[33m%s\x1b[0m', `LobbyManager ${msg}`);

    }


    setup(): void {

        this.tableManager.createTable();

    }

    addClient(client: IServerClient): void {

        this.clients.add(client);

    }

    
    addTableClient(tableID: number, client: IServerClient): void {

        let clientManager = this.tableManager.getClientManager(tableID);

        this.log(`In addTableClient, found clientManager for ${tableID} ? ${(clientManager != null)}`);


        if (clientManager != null) {

            clientManager.addClient(client);

        }

    }


    fetchUserByID(id: number): User {

        return this.userManager.fetchUserByID(id);

    }   // fetchUserByID


    login(username: string, password: string): User {

        return this.userManager.login(username, password);

    }  // login


}