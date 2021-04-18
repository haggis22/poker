<template>

    <div class="page-casino">

        <banner-component></banner-component>

        <router-view v-if="isAuthenticated
                            || showLogin"></router-view>
    </div>
</template>
<script lang="ts">
    import { defineComponent, computed } from "vue";

    import { MoneyFormatter } from '../../app/casino/tables/chips/money-formatter';

    import BannerComponent from './components/banner/BannerComponent.vue';
    import { GameClient } from '../../app/communication/client-side/game-client';
    import { BrowserWebSocketWrapper } from '../../app/communication/client-side/browser-web-socket-wrapper';
    import { ClientAuthenticationManager } from '@/app/communication/client-side/client-authentication-manager';
    import { userState } from '@/store/user-state';
    import { casinoClient } from './casino-client';
    import router from '@/router';

    export default defineComponent({
        name: "Casino",
        components: {
            BannerComponent,
        },
        setup() {

            const isAuthenticated = computed((): boolean => userState.isAuthenticated.value);

            const showLogin = computed((): boolean => isAuthenticated.value === false && router.currentRoute.value.name == 'Login');

            userState.setChipFormatter(new MoneyFormatter());

            const ws = new WebSocket('ws://localhost:3000');

            const gameClient = new GameClient(new BrowserWebSocketWrapper(ws), new ClientAuthenticationManager());

            // Now join all the links in the chain
            casinoClient.registerCommandHandler(gameClient);
            gameClient.registerMessageHandler(casinoClient);

            userState.setGameClient(gameClient);

            ws.addEventListener('open', () => {

                console.log('Connection opened, trying authentication');
                gameClient.authenticate();

            });
            return {
                isAuthenticated,
                showLogin
            };
        },
    });
</script>
<style scoped lang="scss">
    .page-casino
    {
        display: flex;
        flex-direction: column;
    }
</style>
