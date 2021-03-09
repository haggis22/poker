<template>

    <div class="chat">

        <input type="text" 
               class="chat-text"
               v-model="message" 
               @change.stop="sendMessage"
               placeholder="Type chat messages here" />

    </div>

</template>


<script lang="ts">


import './chat.scss';

    import { defineComponent } from 'vue';

    import { TableUI } from '../../table-ui';
    import { ChatCommand } from '@/app/commands/table/chat/chat-command';

    import { tableState } from "@/store/table-state";


    const ChatComponent = defineComponent({

        setup() {

            return {

                table: tableState.getTable.value

            };

        },
        props: {
        ui: {
            type: TableUI,
            required: true
        }
    },
    data() {

        let values =
        {
            message: null as string
        };

        return values;

        },

        computed: {

            getMessages: (): string[] => tableState.getMessages.value

        },

    methods: {


        sendMessage() {

            if (this.message && this.message.length) {

                this.ui.sendCommand(new ChatCommand(this.table.id, this.message));
                this.message = '';

            }

        }
    }

});

export default ChatComponent;

</script>
