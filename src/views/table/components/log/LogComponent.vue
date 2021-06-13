<template>

    <div class="action-log" ref="log">

        <div v-for="(message, index) in getMessages" 
             :key="`log-${index}`"
             class="message"
             v-html="formatMessage(message)"></div>

    </div>

</template>


<script lang="ts">


import './log.scss';

    import { defineComponent, computed, ref, onUpdated } from 'vue';

    import { tableState } from "@/store/table-state";
    import { CardSuit } from '@/app/cards/card-suit';
    import { Commentary } from '@/app/commentary/commentary';





const LogComponent = defineComponent({

    setup() {

        const log = ref(null as HTMLElement);

        const getMessages = computed((): Commentary[] => tableState.getMessages.value);

        const scrollToEnd = (): void => {

            if (log.value) {

                const messages = log.value.getElementsByClassName('message');

                if (messages.length) {

                    messages[messages.length - 1].scrollIntoView();

                }

            }

        }

        // The parentheses will capture the card value/suit in a capture group so that we can re-insert it with the proper tag around it
        const regExps = CardSuit.VALUES.map(val => {
            return { exp: new RegExp('([AKQJ0123456789]+' + val.symbol + ')', 'gui'), wordClass: val.text };
        });

        const formatMessage = (commentary: Commentary): string => {

            let message = commentary.message;

            for (let re of regExps) {

                message = message.replace(re.exp, '<span class="' + re.wordClass + '" class="card">$1</span>');

            }

            if (commentary.type == Commentary.TYPE.CHAT) {

                message = `<span class="chat">${message}</span>`;

            }

            return message;

        };

        onUpdated(() => {

            scrollToEnd();

        });


        return {

            log,

            getMessages,

            formatMessage

        };

    }

});

export default LogComponent;

</script>
