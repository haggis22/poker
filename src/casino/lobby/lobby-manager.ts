import { TableManager } from './table-manager';
import { Table } from '../tables/table';

import { IServerClient } from '../../communication/server-side/i-server-client';


export class LobbyManager {


    private tableManager: TableManager


    constructor(tableManager: TableManager) {

        this.tableManager = tableManager;

    }



    setup(): void {

        let table: Table = this.tableManager.createTable();

    }


    addTableClient(tableID: number, client: IServerClient): void {

        let clientManager = this.tableManager.getClientManager(tableID);

        if (clientManager != null) {

            clientManager.addClient(client);

        }

    }


}