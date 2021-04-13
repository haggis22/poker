import { reactive, computed } from "vue";


const state = reactive({

    messages: [] as string[]

});


const getMessages = computed((): string[] => state.messages);

const addMessage = (message: string): void => {
    state.messages.push(message);
};

const clearMessages = (): void => {
    state.messages.splice(0, state.messages.length);
};


export const messageState = {

    getMessages,
    addMessage,
    clearMessages

};
