import { TableManager } from './table-manager';
import { UserManager } from '../../players/user-manager';
import { User } from '../../players/user';

import { IServerClient } from '../../communication/server-side/i-server-client';
import { ActionMessage } from '../../messages/action-message';
import { LobbyConnectedAction } from '../../actions/lobby/lobby-connected-action';


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

        this.tableManager.setUp(this);

    }
    
    addClient(client: IServerClient): void {

        this.clients.add(client);

        // send this client a message that they are connected to the lobby
        client.handleMessage(new ActionMessage(new LobbyConnectedAction()));
//         client.handleMessage(new )

    }


    getTableManager(): TableManager {

        return this.tableManager;

    }


    getUserManager(): UserManager {

        return this.userManager;

    }

}