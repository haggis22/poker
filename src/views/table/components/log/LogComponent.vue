<template>

    <div class="action-log">

        <div v-for="(message, index) in getMessages" 
             :key="`log-${index}`"
             class="message">{{ message }}</div>

    </div>

</template>


<script lang="ts">


import './log.scss';

    import { defineComponent } from 'vue';

    import { tableState } from "@/store/table-state";


const LogComponent = defineComponent({

    computed: {

        getMessages: (): string[] => tableState.getMessages.value

    },

    methods: {


        scrollToEnd() {

            const messages = this.$el.getElementsByClassName('message');

            if (messages.length) {

                messages[messages.length - 1].scrollIntoView();

            }


        }
    },
    updated() {

        this.scrollToEnd();

    }

});

export default LogComponent;

</script>
