﻿import Vue from 'vue';

import { TableUI } from '../table-ui';
import { MoneyFormatter } from '../../casino/tables/chips/money-formatter';
import { TableWatcher } from '../../casino/tables/table-watcher';
import { GameClient } from '../../communication/client-side/game-client';
import { User } from '../../players/user';
import { Player } from '../../players/player';


import TableComponent from './table/table/TableComponent';
import { JoinTableCommand } from '../../communication/serializable';

var app = new Vue({

    el: '#poker',
    data: {
        players: <Player[]>null,
        ui: <TableUI> null
    },
    components: {
        'table-component': TableComponent
    }

});

const ws = new WebSocket('ws://localhost:3000');

// Client Side
let ui: TableUI = new TableUI(new MoneyFormatter());
let tableWatcher: TableWatcher = new TableWatcher(1);
let gameClient: GameClient = new GameClient(ws);

// Now join all the links in the chain
ui.registerCommandHandler(tableWatcher);

tableWatcher.registerMessageHandler(ui);
tableWatcher.registerCommandHandler(gameClient);

gameClient.registerMessageHandler(tableWatcher);

app.ui = ui;

ws.onopen = (evt: MessageEvent) => {

    console.log('Connection opened');

};




/*

ws.onmessage = (evt: MessageEvent) => {
    const data: any = JSON.parse(evt.data);
    console.log(data);
};

*/

