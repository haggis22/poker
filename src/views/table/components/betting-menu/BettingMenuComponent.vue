<template>

    <div class="betting-menu">

        <div class="bet-actions" v-if="remainsToAnte">

            <div class="buttons">

                <bet-button-component :action="'Sit Out'"
                                      :is-activated="isFoldActivated"
                                      @button-click="toggleFold"></bet-button-component>

                <bet-button-component :action="'Ante'"
                                      :is-activated="isAnteActivated"
                                      :amount="myCall.chipsAdded"
                                      @button-click="toggleAnte"></bet-button-component>

            </div>

        </div>

        <div class="bet-actions" v-if="remainsToAct">

            <div v-if="!showRaiseDialog" class="buttons">

                <bet-button-component v-if="isFoldAllowed"
                                      :action="'Fold'"
                                      :is-activated="isFoldActivated"
                                      @button-click="toggleFold"></bet-button-component>

                <bet-button-component v-if="isCheckAllowed"
                                      :action="'Check'"
                                      :is-activated="isCheckActivated"
                                      @button-click="toggleCheck"></bet-button-component>

                <bet-button-component v-if="isCallAllowed"
                                      :action="'Call'"
                                      :is-activated="isCallActivated"
                                      :amount="myCall.chipsAdded"
                                      @button-click="toggleCall"></bet-button-component>

                <bet-button-component v-if="isLimitRaiseAllowed"
                                      :action="betDescription"
                                      :is-activated="isRaiseActivated"
                                      :amount="myMinRaise.totalBet"
                                      @button-click="toggleLimitRaise"></bet-button-component>

                <bet-button-component v-if="isNoLimitRaiseAllowed && !isRaiseActivated"
                                      :action="betDescription"
                                      :is-activated="false"
                                      @button-click="readyRaise"></bet-button-component>

                <bet-button-component v-if="isNoLimitRaiseAllowed && isRaiseActivated"
                                      :action="betDescription"
                                      :is-activated="isRaiseActivated"
                                      :amount="myMinRaise.totalBet"
                                      @button-click="toggleNoLimitRaise"></bet-button-component>

            </div><!-- buttons -->

            <div v-if="showRaiseDialog" class="raise-dialog">

                <div>
                    <span class="min-raise">{{ chipFormatter.format(minRaise) }}</span>
                    <button type="button" 
                            @click.stop="stepDown"
                            :disabled="raiseChips === minRaise">&#9664;</button>
                    <input type="range" 
                           class="chips-slider"
                           v-model.number="raiseChips" 
                           :min="minRaise" 
                           :max="maxRaise" 
                           :step="step" />
                    <button type="button" 
                            @click.stop="stepUp"
                            :disabled="raiseChips === maxRaise">&#9654;</button>
                    <span class="max-raise">{{ chipFormatter.format(maxRaise) }}</span>
                </div>
                <div class="buy-amount">{{ chipFormatter.format(raiseChips) }}</div>
                <div class="buttons">
                    <button type="button" class="cancel" @click.stop="cancelRaise">Cancel</button>
                    <button type="button" class="raise" @click.stop="lockInRaise">Raise</button>
                </div>
            </div>

        </div>

    </div>

</template>


<script lang="ts">
    
import './betting-menu.scss';

    import { defineComponent, computed, ref } from "vue";

    import { AnteCommand } from '@/app/commands/table/betting/ante-command';
    import { BetCommand } from '@/app/commands/table/betting/bet-command';
    import { CheckCommand } from '@/app/commands/table/betting/check-command';
    import { CallCommand } from '@/app/commands/table/betting/call-command';
    import { RaiseCommand } from '@/app/commands/table/betting/raise-command';
    import { FoldCommand } from '@/app/commands/table/betting/fold-command';
    import { Bet } from '@/app/casino/tables/betting/bet';


    import { tableUI } from '../../table-ui';
    import BetButtonComponent from '../bet-button/BetButtonComponent.vue';

    import { tableState } from "@/store/table-state";
    import { IChipFormatter } from '@/app/casino/tables/chips/chip-formatter';
    import { TableState } from '@/app/casino/tables/states/table-state';
    import { BetState } from '@/app/casino/tables/states/betting/bet-state';
    import { BlindsAndAntesState } from '@/app/casino/tables/states/betting/blinds-and-antes-state';
import { CardSuit } from '@/app/cards/card-suit';

    const TableMenuComponent = defineComponent({

        setup(props, { emit }) {

            const pendingBetCommand = computed((): BetCommand | FoldCommand => tableState.getPendingBetCommand.value);

            const myCall = computed((): Bet => tableState.getMyCall.value);
            const myMinRaise = computed((): Bet => tableState.getMyMinRaise.value);
            const myMaxRaise = computed((): Bet => tableState.getMyMaxRaise.value);

            const numRaises = computed((): number => tableState.getBetStatus.value?.numRaises || 0);

            const isFoldAllowed = computed((): boolean => true);

            const isFoldActivated = computed((): boolean => pendingBetCommand.value instanceof FoldCommand);

            const isAnteActivated = computed((): boolean => pendingBetCommand.value instanceof AnteCommand);

            const isCheckAllowed = computed((): boolean => myCall.value && myCall.value.chipsAdded === 0);

            const isCheckActivated = computed((): boolean => pendingBetCommand.value instanceof CheckCommand);

            const isCallAllowed = computed((): boolean => myCall.value && myCall.value.chipsAdded > 0);

            const isCallActivated = computed((): boolean => pendingBetCommand.value instanceof CallCommand);

            const isLimitRaiseAllowed = computed((): boolean => myMinRaise.value && myMaxRaise.value && myMinRaise.value.chipsAdded === myMaxRaise.value.chipsAdded);

            const isNoLimitRaiseAllowed = computed((): boolean => myMinRaise.value && myMaxRaise.value && myMaxRaise.value.chipsAdded > myMinRaise.value.chipsAdded);

            const isRaiseActivated = computed((): boolean => pendingBetCommand.value instanceof RaiseCommand);

            const betDescription = computed((): string => numRaises.value > 0 ? 'Raise To' : 'Bet');

            const showRaiseDialog = ref(false);

            const raiseChips = ref(null as number);

            const raiseChipsModel = computed({

                get: () => raiseChips.value,
                set: (value) => emit('update:raiseChips', value)

            });

            const step = ref(25);

            const minRaise = computed((): number => myMinRaise.value ? myMinRaise.value.totalBet : 0);

            const maxRaise = computed((): number => myMaxRaise.value ? myMaxRaise.value.totalBet : 0);

            const chipFormatter = computed((): IChipFormatter => tableState.getChipFormatter.value);

            const mySeatIndex = computed((): number => tableState.getMySeatIndex.value);

            const currentTableState = computed((): TableState => tableState.getTable.value.state);

            const betStatus = computed(() => tableState.getBetStatus.value);

            const isAnteTime = computed(() => currentTableState.value instanceof BlindsAndAntesState);

            const isBettingTime = computed(() => currentTableState.value instanceof BetState);

            const remainsToAnte = computed((): boolean => {

                return mySeatIndex.value != null
                    && isAnteTime.value
                    && myCall.value != null;
                    // && (this.table.seats[tableState.getMySeatIndex.value].player.isSittingOut === null);

            });


            const remainsToAct = computed((): boolean => {

                return mySeatIndex.value != null
                    && isBettingTime.value
                    // either it's my turn right now, or it's coming up
                    && (betStatus.value.seatIndex == mySeatIndex.value || betStatus.value.doesSeatRemainToAct(mySeatIndex.value));


            });


            const toggleFold = (): void => {

                if (isFoldActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new FoldCommand(tableState.getTableID.value));

            };

            const toggleAnte = (): void => {

                if (isAnteActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new AnteCommand(tableState.getTableID.value));

            };

            const toggleCheck = (): void => {

                if (isCheckActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new CheckCommand(tableState.getTableID.value));

            };

            const toggleCall = (): void => {

                if (isCallActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new CallCommand(tableState.getTableID.value, tableState.getMyCall.value.chipsAdded));

            };

            const toggleLimitRaise = (): void => {

                if (isRaiseActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                tableUI.setBetCommand(new RaiseCommand(tableState.getTableID.value, tableState.getMyMinRaise.value.chipsAdded));

            };

            const toggleNoLimitRaise = (): void => {

                if (isRaiseActivated.value) {

                    return tableState.clearPendingBetCommands();

                }

                // tableUI.setBetCommand(new RaiseCommand(tableState.getTableID.value, tableState.getMyMinRaise.value.chipsAdded));

            };

            const readyRaise = (): void => {

                raiseChips.value = myMinRaise.value.totalBet;
                showRaiseDialog.value = true;

            };

            const stepDown = (): void => {

                raiseChips.value -= step.value;

            };

            const stepUp = (): void => {

                raiseChips.value += step.value;

            };

            const lockInRaise = (): void => {

                showRaiseDialog.value = false;
                const chipsAdded = tableState.getMyMinRaise.value.chipsAdded + (raiseChips.value - tableState.getMyMinRaise.value.totalBet);
                tableUI.setBetCommand(new RaiseCommand(tableState.getTableID.value, chipsAdded));

            }

            const cancelRaise = (): void => {

                tableState.clearPendingBetCommands();
                showRaiseDialog.value = false;

            }

            return {

                pendingBetCommand,

                myCall,
                myMinRaise,
                myMaxRaise,

                numRaises,

                isFoldAllowed,
                isFoldActivated,

                isAnteActivated,

                isCheckAllowed,
                isCheckActivated,

                isCallAllowed,
                isCallActivated,

                isLimitRaiseAllowed,
                isNoLimitRaiseAllowed,
                isRaiseActivated,

                betDescription,

                minRaise,
                maxRaise,

                chipFormatter,

                mySeatIndex,
                currentTableState,
                betStatus,
                isBettingTime,

                remainsToAnte,
                remainsToAct,

                raiseChips,
                raiseChipsModel,
                step,

                toggleFold,
                toggleAnte,
                toggleCheck,
                toggleCall,
                toggleLimitRaise,
                toggleNoLimitRaise,


                showRaiseDialog,
                readyRaise,
                stepDown,
                stepUp,
                lockInRaise,
                cancelRaise,

            };


        },

    components: {

        BetButtonComponent

    },

});

export default TableMenuComponent;

</script>


<style scoped lang="scss">

    .raise-dialog
    {
        text-align: center;
    }

</style>
