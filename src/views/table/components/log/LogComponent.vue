<template>

    <div class="action-log" ref="log">

        <div v-for="(message, index) in getMessages" 
             :key="`log-${index}`"
             class="message">{{ message }}</div>

    </div>

</template>


<script lang="ts">


import './log.scss';

    import { defineComponent, computed, ref, onUpdated } from 'vue';

    import { tableState } from "@/store/table-state";


const LogComponent = defineComponent({

    setup() {

        const log = ref(null as HTMLElement);

        const getMessages = computed((): string[] => tableState.getMessages.value);

        const scrollToEnd = (): void => {

            if (log.value) {

                const messages = log.value.getElementsByClassName('message');

                if (messages.length) {

                    messages[messages.length - 1].scrollIntoView();

                }

            }

        }

        onUpdated(() => {

            scrollToEnd();

        });


        return {

            log,

            getMessages

        };

    }

});

export default LogComponent;

</script>
