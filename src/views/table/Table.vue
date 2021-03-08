<template>

    <div>
        
        <div v-if="table != null">Chips[0]: {{ table.seats[0].player.chips }} </div>

        <div v-if="ui != null && table != null">
            <table-component :ui="ui"></table-component>
            <chat-component :ui="ui"></chat-component>
            <log-component :ui="ui"></log-component>
            <table-menu-component v-if="ui.getMySeat()"
                                  :ui="ui"
                                  :is-sitting-out.sync="ui.isSittingOut">
            </table-menu-component>
            <betting-menu-component v-if="ui.getMySeat()" :ui="ui"></betting-menu-component>
        </div>
        <div v-else>
            We have no table yet.
        </div>
    </div>

</template>

<script lang="ts">

    import { defineComponent, reactive } from "vue";

    import { Table } from "@/app/casino/tables/table";
    import { TableUI } from './table-ui';
    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';
    import { TableWatcher } from '../../app/casino/tables/table-watcher';
    import { GameClient } from '../../app/communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../app/communication/client-side/browser-web-socket-wrapper';

    import TableComponent from './components/table/TableComponent.vue';
    import LogComponent from './components/log/LogComponent.vue';
    import TableMenuComponent from './components/table-menu/TableMenuComponent.vue';
    import BettingMenuComponent from './components/betting-menu/BettingMenuComponent.vue';
    import ChatComponent from './components/chat/ChatComponent.vue';

    import tableState from "@/store/table/table-state";


    export default defineComponent({

        name: "Table",

        provide: {
            tableState: tableState
        },

        setup() {

            const values = {

                table: reactive(tableState.getTable)

            };

            return values;


        },

        components: {

            TableComponent,
            LogComponent,
            TableMenuComponent,
            BettingMenuComponent,
            ChatComponent

        },
        data() {

            let values = {

                tableID: Number(this.$route.params.tableID),

                ui: null as TableUI,
                ws: null as WebSocket

            };

            return values;

        },
        computed: {


        },
        created() {

            const ws = new WebSocket('ws://localhost:3000');

            ws.addEventListener('open', () => {

                console.log('Connection opened');

                let ui: TableUI = new TableUI(this.tableID, new MoneyFormatter());
                let tableWatcher: TableWatcher = new TableWatcher(this.tableID);
                let gameClient: GameClient = new GameClient(new BrowserWebSocketWrapper(ws), 'dshell');

                // Now join all the links in the chain
                ui.registerCommandHandler(tableWatcher);

                tableWatcher.registerMessageHandler(ui);
                tableWatcher.registerCommandHandler(gameClient);

                gameClient.registerMessageHandler(tableWatcher);

                this.ui = ui;
                this.ws = ws;

                ui.authenticate();

            });

        }

    });

</script>
