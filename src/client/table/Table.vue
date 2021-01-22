<template>

    <div>
        <div v-if="ui != null && ui.table != null">
            <table-component :ui="ui"></table-component>
            <chat-component :ui="ui"></chat-component>
            <log-component :ui="ui"></log-component>
            <table-menu-component v-if="ui.getMySeat()"
                                  :ui="ui"
                                  :is-sitting-out.sync="ui.isSittingOut">
            </table-menu-component>
            <betting-menu-component v-if="ui.getMySeat()"
                                  :ui="ui"
                                  :pending-fold.sync="ui.pendingCommands.fold">
            </betting-menu-component>
        </div>
        <div v-else>
            We have no table yet.
        </div>
    </div>

</template>

<script lang="ts">

    import Vue from 'vue';

    import { TableUI } from './table-ui';
    import { MoneyFormatter } from '../../casino/tables/chips/money-formatter';
    import { TableWatcher } from '../../casino/tables/table-watcher';
    import { GameClient } from '../../communication/client-side/game-client';

    import TableComponent from './components/table/TableComponent.vue';
    import LogComponent from './components/log/LogComponent.vue';
    import TableMenuComponent from './components/table-menu/TableMenuComponent.vue';
    import BettingMenuComponent from './components/betting-menu/BettingMenuComponent.vue';
    import ChatComponent from './components/chat/ChatComponent.vue';


    export default {
        name: "Table",
        components: {
            'table-component': TableComponent,
            'log-component': LogComponent,
            'table-menu-component': TableMenuComponent,
            'betting-menu-component': BettingMenuComponent,
            'chat-component': ChatComponent
        },
        data() {

            let values = {
                tableID: parseInt(this.$route.params.tableID, 10),

                ui: null,
                ws: null
            };

            return values;

        },
        created() {

            const ws = new WebSocket('ws://localhost:3000');

            ws.onopen = (evt: MessageEvent) => {

                console.log('Connection opened');

                let ui: TableUI = new TableUI(this.tableID, new MoneyFormatter());
                let tableWatcher: TableWatcher = new TableWatcher(this.tableID);
                let gameClient: GameClient = new GameClient(ws, 'dshell');

                // Now join all the links in the chain
                ui.registerCommandHandler(tableWatcher);

                tableWatcher.registerMessageHandler(ui);
                tableWatcher.registerCommandHandler(gameClient);

                gameClient.registerMessageHandler(tableWatcher);

                this.ui = ui;
                this.ws = ws;

                ui.authenticate();

            };

        }

    };

</script>
