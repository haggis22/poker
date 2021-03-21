<template>

    <div class="table-menu">

        <div class="sit-out">

            <label>
                <input type="checkbox" value="true" :checked="isSittingOut" @change="setStatus" />
                Sit out next hand
            </label>

        </div>
        <div>
            <button type="button" class="stand-up" @click.stop="standUp">Stand Up</button>
        </div>
        <div v-if="addChipsButtonReady">
            <button type="button" class="add-chips" @click.stop="checkBalance">Add Chips</button>
        </div>
        <div v-if="addChipsDialogReady" class="add-chips-dialog">
            <div>
                <span class="min-buy-in">{{ chipFormatter.format(minBuyIn) }}</span>
                <input type="range" v-model="numAddChips" :min="minBuyIn" :max="maxBuyIn" :step="step" />
                <span class="max-buy-in">{{ chipFormatter.format(maxBuyIn) }}</span>
            </div>
            <div class="buy-amount">{{ chipFormatter.format(numAddChips) }}</div>
            <div>
                <button type="button" class="buy-in" @click.stop="buyIn">Buy In</button>
                <button type="button" class="cancel" @click.stop="cancelBuyIn">Cancel</button>
            </div>
        </div>

    </div>

</template>


<script lang="ts">
    
    import './table-menu.scss';

    import { defineComponent, computed, ref } from 'vue';

    import { TableUI } from '../../table-ui';
    import { SetStatusCommand, StandUpCommand, AddChipsCommand } from '@/app/communication/serializable';

    import { tableState } from "@/store/table-state";

    const TableMenuComponent = defineComponent({

        props: {

            ui: {
                type: TableUI,
                required: true
            },
            isSittingOut: {
                type: Boolean,
                required: false
            },

        },
        setup(props) {

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const numAddChips = ref('1000');
            const step = ref(100);
            const showAddChips = ref(false);

            const currentBalance = computed((): number => tableState.getCurrentBalance.value);

            const addChipsButtonReady = computed((): boolean => !showAddChips.value);

            const minBuyIn = computed((): number => showAddChips.value ? 0 : null);

            const maxBuyIn = computed((): number => currentBalance.value);

            const addChipsDialogReady = computed((): boolean => showAddChips.value && maxBuyIn.value > 0);

            const setStatus = (event: Event): void => {

                // The actual local value hasn't changed yet, so use the checked flag of the input checkbox itself
                if (event.target instanceof HTMLInputElement) {
                    props.ui.sendCommand(new SetStatusCommand(tableState.getTableID.value, event.target.checked));
                    // this.$emit('update:isSittingOut', event.target.checked);
                }

            };

            const standUp = (): void => {

                props.ui.sendCommand(new StandUpCommand(tableState.getTableID.value));

            };

            const checkBalance = (): void => {

                props.ui.checkBalance();
                showAddChips.value = true;

            };

            const buyIn = (): void => {

                let numChips: number = parseInt(numAddChips.value, 10);

                if (!isNaN(numChips)) {

                    if (numChips === 0) {

                        showAddChips.value = false;
                        return;

                    }

                    if (numChips <= currentBalance.value) {

                        props.ui.sendCommand(new AddChipsCommand(tableState.getTableID.value, numChips));
                        showAddChips.value = false;

                    }

                }

            };

            const cancelBuyIn = (): void => {

                showAddChips.value = false;

            };



            return {

                chipFormatter,

                numAddChips,
                step,
                showAddChips,

                currentBalance,
                addChipsButtonReady,
                minBuyIn,
                maxBuyIn,
                addChipsDialogReady,

                setStatus,
                standUp,
                checkBalance,
                buyIn,
                cancelBuyIn

            };

        },

    });

    export default TableMenuComponent;

</script>
