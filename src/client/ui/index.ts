import './style.scss';
import { Player } from '../../players/player';

import Vue from 'vue';

import { TableUI } from '../table-ui';
import { MoneyFormatter } from '../chips/money-formatter';
import { TableWatcher } from '../table-watcher';
import { GameClient } from '../../communication/client-side/game-client';
import { User } from '../../players/user';


var app = new Vue({
    el: '#poker',
    data: {
        name: 'Daniel',
        message: 'Here we go again'
    }
});


const ws = new WebSocket('ws://localhost:3000');

ws.onopen = (evt: MessageEvent) => { console.log('Connection opened'); };

let user = new User(1, 'Danny', 100000);

// Client Side
let ui: TableUI = new TableUI(user, new MoneyFormatter());
let tableWatcher: TableWatcher = new TableWatcher(1);
let gameClient: GameClient = new GameClient(ws);

// Now join all the links in the chain
ui.registerCommandHandler(tableWatcher);

tableWatcher.registerMessageHandler(ui);
tableWatcher.registerCommandHandler(gameClient);

gameClient.registerMessageHandler(tableWatcher);


/*

ws.onmessage = (evt: MessageEvent) => {
    const data: any = JSON.parse(evt.data);
    console.log(data);
};

*/

