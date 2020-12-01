import { TableManager } from './table-manager';
import { Table } from '../tables/table';

import { IServerClient } from '../../communication/server-side/i-server-client';


export class LobbyManager {


    private tableManager: TableManager;
    private clients: Set<IServerClient>;


    constructor(tableManager: TableManager) {

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


}