<template>

    <div class="table-menu">

        <div v-if="!showAddChips" class="table-actions">

            <div class="sit-out" :class="{ 'disabled': hasPendingStatusRequest }">

                <label>
                    <input type="checkbox"
                           value="true"
                           :checked="localSittingOut"
                           :disabled="hasPendingStatusRequest"
                           @change="setStatus" />
                    Sit out next hand
                </label>

            </div>

            <div>
                <button type="button" class="stand-up" @click.stop="standUp">Stand Up</button>
            </div>
            <div>
                <button type="button" class="add-chips" @click.stop="checkBalance">Add Chips</button>
            </div>

        </div>

        <div v-if="showAddChips" class="add-chips-dialog">
            <div>
                <span class="min-buy-in">{{ chipFormatter.format(minBuyIn) }}</span>
                <button type="button"
                        @click.stop="stepDown"
                        :disabled="numAddChips === minBuyIn">
                    &#9664;
                </button>
                <input type="range" 
                        class="chips-slider"
                        v-model.number="numAddChips" 
                       :min="minBuyIn" 
                       :max="maxBuyIn" 
                       :step="step" />
                <button type="button"
                        @click.stop="stepUp"
                        :disabled="numAddChips === maxBuyIn">
                    &#9654;
                </button>
                <span class="max-buy-in">{{ chipFormatter.format(maxBuyIn) }}</span>
            </div>
            <div class="buy-amount">{{ chipFormatter.format(numAddChips) }}</div>
            <div class="buttons">
                <button type="button" class="cancel" @click.stop="cancelBuyIn">Cancel</button>
                <button type="button" class="buy-in" @click.stop="buyIn">Buy In</button>
            </div>
        </div>

    </div>

</template>


<script lang="ts">

    import './table-menu.scss';

    import { defineComponent, computed, ref, watch } from 'vue';

    import { tableUI } from '../../table-ui';
    import { SetStatusCommand, StandUpCommand, AddChipsCommand } from '@/app/communication/serializable';

    import { tableState } from "@/store/table-state";

    const TableMenuComponent = defineComponent({

        setup() {

            const chipFormatter = computed(() => tableState.getChipFormatter.value);

            const numAddChips = ref(1000);
            const step = ref(100);

            const showAddChips = ref(false);

            const stepDown = (): void => {

                numAddChips.value -= step.value;

            };

            const stepUp = (): void => {

                numAddChips.value += step.value;

            };

            const isSittingOut = computed((): boolean => tableState.getTable.value.seats[tableState.getMySeatIndex.value].player.isSittingOut);

            const localSittingOut = computed((): boolean => tableState.getLocalSittingOut.value);

            watch(() => isSittingOut.value, (newValue) => {
                tableState.setLocalSittingOut(newValue);
            });

            const hasPendingStatusRequest = computed((): boolean => tableState.getHasPendingStatusRequest.value);

            const currentBalance = computed((): number => tableState.getCurrentBalance.value);

            const minBuyIn = computed((): number => showAddChips.value ? 0 : null);

            const maxBuyIn = computed((): number => currentBalance.value);

            const setStatus = (event: Event): void => {

                // The actual local value hasn't changed yet, so use the checked flag of the input checkbox itself
                if (event.target instanceof HTMLInputElement) {
                    tableState.setHasPendingStatusRequest(true);
                    tableUI.sendCommand(new SetStatusCommand(tableState.getTableID.value, event.target.checked));
                }

            };

            const standUp = (): void => {

                tableUI.sendCommand(new StandUpCommand(tableState.getTableID.value));

            };

            const checkBalance = (): void => {

                tableUI.checkBalance();
                showAddChips.value = true;

            };

            const buyIn = (): void => {

                let numChips: number = numAddChips.value;

                if (!isNaN(numChips)) {

                    if (numChips === 0) {

                        showAddChips.value = false;
                        return;

                    }

                    if (numChips <= currentBalance.value) {

                        tableUI.sendCommand(new AddChipsCommand(tableState.getTableID.value, numChips));
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
                showAddChips,
                step,
                stepDown,
                stepUp,

                currentBalance,
                minBuyIn,
                maxBuyIn,

                setStatus,
                standUp,
                checkBalance,
                buyIn,
                cancelBuyIn,

                hasPendingStatusRequest,
                localSittingOut

            };

        },

    });

    export default TableMenuComponent;

</script>

<style scoped lang="scss">


    .sit-out.disabled
    {
        color: #888;
    }



</style>