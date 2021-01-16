<template>

    <div>
        <lobby-component></lobby-component>
    </div>

</template>

<script lang="ts">

    import Vue from 'vue';

    import { MoneyFormatter } from '../../casino/tables/chips/money-formatter';

    import LobbyComponent from '../components/lobby/lobby/LobbyComponent.vue';


    export default {
        name: "Lobby",
        components: {
            'lobby-component': LobbyComponent
        },
        data() {

            let values = {
                ui: null,
                ws: null
            };

            return values;

        },
        created() {

/*
            const ws = new WebSocket('ws://localhost:3000');

            // Client Side
            let ui: TableUI = new TableUI(new MoneyFormatter());
            let tableWatcher: TableWatcher = new TableWatcher(this.tableID);
            let gameClient: GameClient = new GameClient(ws);

            // Now join all the links in the chain
            ui.registerCommandHandler(tableWatcher);

            tableWatcher.registerMessageHandler(ui);
            tableWatcher.registerCommandHandler(gameClient);

            gameClient.registerMessageHandler(tableWatcher);

            ws.onopen = (evt: MessageEvent) => {

                console.log('Connection opened');

            };

            this.ui = ui;
            this.ws = ws;
*/

        }

    };

</script>
