<template>

    <div>

        <message-popup-component></message-popup-component>
        
        <div v-if="table != null">
            <table-component></table-component>
            <chat-component></chat-component>
            <log-component></log-component>
            <table-menu-component v-if="hasSeat"></table-menu-component>
            <betting-menu-component v-if="hasSeat"></betting-menu-component>
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
    import { tableUI } from './table-ui';
    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';
    import { GameClient } from '../../app/communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../app/communication/client-side/browser-web-socket-wrapper';

    import TableComponent from './components/table/TableComponent.vue';
    import LogComponent from './components/log/LogComponent.vue';
    import TableMenuComponent from './components/table-menu/TableMenuComponent.vue';
    import BettingMenuComponent from './components/betting-menu/BettingMenuComponent.vue';
    import ChatComponent from './components/chat/ChatComponent.vue';

    import MessagePopupComponent from '../components/message-popup/MessagePopupComponent.vue';

    import { tableState } from "@/store/table-state";
    import { ClientAuthenticationManager } from '@/app/communication/client-side/client-authentication-manager';


    export default defineComponent({

        name: "Table",

        setup() {

            const route = useRoute();

            // Clear anything that might already be in the window
            tableState.initialize();

            tableState.setTableID(Number(route.params.tableID));

            const table = computed((): Table => tableState.getTable.value);

            const ws = new WebSocket('ws://localhost:3000');

            const hasSeat = computed((): boolean => tableState.getMySeatIndex.value != null);

            ws.addEventListener('open', () => {

                console.log('Connection opened');

                tableState.setChipFormatter(new MoneyFormatter());

                let gameClient: GameClient = new GameClient(new BrowserWebSocketWrapper(ws), new ClientAuthenticationManager());

                tableUI.initialize();

                // Now join all the links in the chain
                tableUI.registerCommandHandler(gameClient);
                gameClient.registerMessageHandler(tableUI);

                /*
                                tableWatcher.registerMessageHandler(ui);
                                tableWatcher.registerCommandHandler(gameClient);
                */

                gameClient.authenticate();

            });

            return {

                table,
                hasSeat

            };

        },

        components: {

            TableComponent,
            LogComponent,
            TableMenuComponent,
            BettingMenuComponent,
            ChatComponent,

            MessagePopupComponent

        },

    });

</script>
