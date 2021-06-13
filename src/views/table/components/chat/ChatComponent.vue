<template>

    <div class="chat-component">

        <input type="text" 
               class="chat-text"
               v-model="message" 
               @change.stop="sendMessage"
               placeholder="Type chat messages here" />

    </div>

</template>


<script lang="ts">


    import { defineComponent, ref, computed } from 'vue';

    import { tableUI } from '../../table-ui';
    import { ChatCommand } from '@/app/commands/table/chat/chat-command';

    import { tableState } from "@/store/table-state";


    const ChatComponent = defineComponent({

        setup() {


            const tableID = computed((): number => tableState.getTableID.value);

            const message = ref(null as string);

            const sendMessage = (): void => {

                if (message.value && message.value.length) {

                    tableUI.sendCommand(new ChatCommand(tableID.value, message.value));
                    message.value = '';

                }

            }

            return {

                message,
                sendMessage

            };

        },

    });

export default ChatComponent;

</script>

<style scoped lang="scss">

    .chat-component {

        position: absolute;
        top: 230px;
        width: 500px;

        .chat-text
        {
            width: 300px;
            height: 1.1em;
        }

    }


</style>