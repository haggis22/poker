﻿import './style.scss';

import Vue from 'vue';

import { TableUI } from '../table-ui';
import { MoneyFormatter } from '../chips/money-formatter';
import { TableWatcher } from '../table-watcher';
import { GameClient } from '../../communication/client-side/game-client';
import { User } from '../../players/user';
import { Player } from '../../players/player';


import PlayerComponent from './components/PlayerComponent';
import SeatComponent from './components/SeatComponent';


var app = new Vue({

    el: '#poker',
    data: {
        players: <Player[]>null,
        ui: <TableUI> null
    },
    components: {
        'player-component': PlayerComponent,
        'seat-component': SeatComponent
    }

});




const ws = new WebSocket('ws://localhost:3000');

ws.onopen = (evt: MessageEvent) => { console.log('Connection opened'); };

let user = new User(5, 'Sekhar', 0);

// Client Side
let ui: TableUI = new TableUI(user, new MoneyFormatter());
let tableWatcher: TableWatcher = new TableWatcher(1);
let gameClient: GameClient = new GameClient(ws);

// Now join all the links in the chain
ui.registerCommandHandler(tableWatcher);

tableWatcher.registerMessageHandler(ui);
tableWatcher.registerCommandHandler(gameClient);

gameClient.registerMessageHandler(tableWatcher);

app.ui = ui;


/*

ws.onmessage = (evt: MessageEvent) => {
    const data: any = JSON.parse(evt.data);
    console.log(data);
};

*/

