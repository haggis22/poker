<template>

    <div v-if="ui != null && ui.table != null">
        <table-component :ui="ui"></table-component>
    </div>
    <div v-else>
        We have no table yet.
    </div>

</template>

<script lang="ts">

    import Vue from 'vue';

    import { TableUI } from '../table-ui';
    import { MoneyFormatter } from '../../casino/tables/chips/money-formatter';
    import { TableWatcher } from '../../casino/tables/table-watcher';
    import { GameClient } from '../../communication/client-side/game-client';

    import TableComponent from '../components/table/table/TableComponent.vue';


    export default {
        name: "Table",
        components: {
            'table-component': TableComponent
        },
        data() {

            let values = {
                ui: null,
                ws: null
            };

            return values;

        },
        created() {

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

            ws.onopen = (evt: MessageEvent) => {

                console.log('Connection opened');

            };

            this.ui = ui;
            this.ws = ws;


        }

    };

</script>
