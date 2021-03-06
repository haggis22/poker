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

    import { defineComponent, computed, reactive, ref, watch, onMounted, onUnmounted } from "vue";
    import { useRoute } from 'vue-router';

    import { Table } from "@/app/casino/tables/table";
    import { tableUI } from './table-ui';
    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';
    import { GameClient } from '../../app/communication/client-side/game-client';

    import TableComponent from './components/table/TableComponent.vue';
    import LogComponent from './components/log/LogComponent.vue';
    import TableMenuComponent from './components/table-menu/TableMenuComponent.vue';
    import BettingMenuComponent from './components/betting-menu/BettingMenuComponent.vue';
    import ChatComponent from './components/chat/ChatComponent.vue';

    import MessagePopupComponent from '../components/message-popup/MessagePopupComponent.vue';

    import { tableState } from "@/store/table-state";
    import { userState } from '@/store/user-state';
    import { JoinTableCommand } from '@/app/communication/serializable';


    export default defineComponent({

        name: "Table",

        

        setup() {

            const route = useRoute();

            // Clear anything that might already be in the window
            tableState.initialize();

            tableState.setTableID(Number(route.params.tableID));

            tableUI.initialize();

            const gameClient = computed((): GameClient => userState.getGameClient.value);

            const table = computed((): Table => tableState.getTable.value);

            const hasSeat = computed((): boolean => tableState.getMySeatIndex.value != null);

            onMounted(() => {

                // Now join all the links in the chain
                tableUI.registerCommandHandler(gameClient.value);
                gameClient.value.registerMessageHandler(tableUI);

                const isConnected = computed((): boolean => userState.isConnected.value);

                if (isConnected.value) {

                    tableUI.sendCommand(new JoinTableCommand(tableState.getTableID.value));

                }
                else {

                    // otherwise, wait until the connection has happened and then pounce
                    watch(() => isConnected.value,

                        (isConnected) => {

                            if (isConnected) {

                                tableUI.sendCommand(new JoinTableCommand(tableState.getTableID.value));

                            }

                        });

                }

            });

            onUnmounted(() => {

                // Disconnecting cables
                // Now join all the links in the chain
                tableUI.unregisterCommandHandler(gameClient.value);
                gameClient.value.unregisterMessageHandler(tableUI);

            })

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
