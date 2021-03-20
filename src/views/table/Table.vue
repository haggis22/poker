<template>

    <div>
        
        <div v-if="table != null">
            <table-component :ui="ui"></table-component>
            <chat-component :ui="ui"></chat-component>
            <log-component></log-component>
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

    import { defineComponent, computed, reactive, ref } from "vue";
    import { useRoute } from 'vue-router';

    import { Table } from "@/app/casino/tables/table";
    import { TableUI } from './table-ui';
    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';
    import { GameClient } from '../../app/communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../app/communication/client-side/browser-web-socket-wrapper';

    import TableComponent from './components/table/TableComponent.vue';
    import LogComponent from './components/log/LogComponent.vue';
    import TableMenuComponent from './components/table-menu/TableMenuComponent.vue';
    import BettingMenuComponent from './components/betting-menu/BettingMenuComponent.vue';
    import ChatComponent from './components/chat/ChatComponent.vue';

    import { tableState } from "@/store/table-state";


    export default defineComponent({

        name: "Table",

        provide: {
            tableState: tableState
        },

        setup() {

            const route = useRoute();

            const tableID = ref(Number(route.params.tableID));
            const ui = ref(null as TableUI);

            const table = computed((): Table => tableState.getTable.value);

            const ws = new WebSocket('ws://localhost:3000');

            ws.addEventListener('open', () => {

                console.log('Connection opened');

                ui.value = new TableUI(tableID.value, new MoneyFormatter());
                //                let tableWatcher: TableWatcher = new TableWatcher(this.tableID);
                let gameClient: GameClient = new GameClient(new BrowserWebSocketWrapper(ws), 'dshell');

                // Now join all the links in the chain
                ui.value.registerCommandHandler(gameClient);
                gameClient.registerMessageHandler(ui.value);

                /*
                                tableWatcher.registerMessageHandler(ui);
                                tableWatcher.registerCommandHandler(gameClient);
                */

                ui.value.authenticate();

            });

            return {

                tableID,
                ui,
                ws,

                table

            };

        },

        components: {

            TableComponent,
            LogComponent,
            TableMenuComponent,
            BettingMenuComponent,
            ChatComponent

        },

    });

</script>
