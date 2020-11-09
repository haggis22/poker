import './style.scss';
import './style-seats-6.scss';

import Vue from 'vue';

import { TableUI } from '../table-ui';
import { MoneyFormatter } from '../../casino/tables/chips/money-formatter';
import { TableWatcher } from '../../casino/tables/table-watcher';
import { GameClient } from '../../communication/client-side/game-client';
import { User } from '../../players/user';
import { Player } from '../../players/player';


import SeatComponent from './components/seat/SeatComponent';
import DealerBoxComponent from './components/dealer/DealerBoxComponent.vue';
import BetComponent from './components/bet/BetComponent.vue';
import PotComponent from './components/pot/PotComponent.vue';
import WonPotComponent from './components/pot/WonPotComponent.vue';
import LogComponent from './components/log/LogComponent.vue';

var app = new Vue({

    el: '#poker',
    data: {
        players: <Player[]>null,
        ui: <TableUI> null
    },
    components: {
        'seat-component': SeatComponent,
        'dealer-box-component': DealerBoxComponent,
        'bet-component': BetComponent,
        'pot-component': PotComponent,
        'won-pot-component': WonPotComponent,
        'log-component': LogComponent
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

