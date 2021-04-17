<template>

    <div class="page-lobby">

        <banner-component></banner-component>

        <login-component v-if="!isAuthenticated"></login-component>

        <lobby-component v-if="isAuthenticated"></lobby-component>

    </div>

</template>

<script lang="ts">

    import { defineComponent, computed } from "vue";

    import { lobbyClient } from './lobby-client';
    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';
    import { GameClient } from '../../app/communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../app/communication/client-side/browser-web-socket-wrapper';

    import BannerComponent from './components/banner/BannerComponent.vue';
    import LoginComponent from './components/login/LoginComponent.vue';
    import LobbyComponent from './components/lobby/LobbyComponent.vue';
    import { lobbyState } from '@/store/lobby-state';
    import { ClientAuthenticationManager } from '@/app/communication/client-side/client-authentication-manager';
    import { userState } from '@/store/user-state';


    export default defineComponent({

        name: "Lobby",

        components: {
            BannerComponent,
            LoginComponent,
            LobbyComponent
        },

        setup() {

            const isAuthenticated = computed((): boolean => userState.isAuthenticated.value);

            lobbyState.setChipFormatter(new MoneyFormatter());

            const ws = new WebSocket('ws://localhost:3000');

            ws.addEventListener('open', () => {

                console.log('Connection opened');

                const gameClient: GameClient = new GameClient(new BrowserWebSocketWrapper(ws), new ClientAuthenticationManager());

                // Now join all the links in the chain
                lobbyClient.registerCommandHandler(gameClient);
                gameClient.registerMessageHandler(lobbyClient);

                gameClient.authenticate();

            });

            return {

                isAuthenticated

            };

        },

    });

</script>

<style scoped lang="scss">

    .page-lobby
    {
        display: flex;
        flex-direction: column;
    }

</style>
