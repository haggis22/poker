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
                            :disabled="raiseChips === minRaise">
                        &#x2039;
                    </button>
                    <input type="range"
                           class="chips-slider"
                           v-model.number="raiseChips"
                           :min="minRaise"
                           :max="maxRaise"
                           :step="step" />
                    <button type="button"
                            @click.stop="stepUp"
                            :disabled="raiseChips === maxRaise">
                        &#x203a;
                    </button>
                    <span class="max-raise">{{ chipFormatter.format(maxRaise) }}</span>
                </div>
                <div class="raise-amount">{{ chipFormatter.format(raiseChips) }}</div>
                <div class="buttons">
                    <button type="button" class="raise-pot" @click.stop="setRaiseChips(raiseThirdPotAmount)">1/3</button>
                    <button type="button" class="raise-pot" @click.stop="setRaiseChips(raiseHalfPotAmount)">1/2</button>
                    <button type="button" class="raise-pot" @click.stop="setRaiseChips(raisePotAmount)">Pot</button>
                    <button type="button" class="raise-pot" @click.stop="setRaiseChips(allInAmount)">All</button>
                </div>
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
    import { BettingCommand } from '@/app/commands/table/betting/betting-command';
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
    import { userState } from '@/store/user-state';
import { Table } from '@/app/casino/tables/table';

    const TableMenuComponent = defineComponent({

        setup() {

            const pendingBetCommand = computed((): BettingCommand => tableState.getPendingBetCommand.value);

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

            const step = ref(25);

            const minRaise = computed((): number => myMinRaise.value ? myMinRaise.value.totalBet : 0);

            const maxRaise = computed((): number => myMaxRaise.value ? myMaxRaise.value.totalBet : 0);

            const chipFormatter = computed((): IChipFormatter => tableState.getChipFormatter.value);

            const mySeatIndex = computed((): number => tableState.getMySeatIndex.value);

            const myUserID = computed((): number => userState.getUserID.value);

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

                return isBettingTime.value
                    // either it's my turn right now, or it's coming up
                    && (betStatus.value.isActionOn(mySeatIndex.value, myUserID.value) || betStatus.value.doesSeatRemainToAct(mySeatIndex.value, myUserID.value));


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

            const goAllIn = (): void => {



            }

            const currentTotalPot = computed((): number => tableState.getTable.value.betStatus.getCurrentTotalPot());


            // Calculates the TotalBet for a given raise
            const raisePotAmount = computed((): number => {

                // This is how much is already in the pot...
                let potRaiseAmount = tableState.getTable.value.betStatus.getCurrentTotalPot();

                if (myCall.value != null) {

                    // This will be how much is in there once I call...
                    potRaiseAmount += myCall.value.chipsAdded;

                }

                // Add this raise amount on TOP of what the existing bet already is
                potRaiseAmount += tableState.getTable.value.betStatus.currentBet;

                return Math.round(potRaiseAmount);

            });

            const raiseHalfPotAmount = computed((): number => {

                // This is how much is already in the pot...
                let potRaiseAmount = tableState.getTable.value.betStatus.getCurrentTotalPot();

                if (myCall.value != null) {

                    // This will be how much is in there once I call...
                    potRaiseAmount += myCall.value.chipsAdded;

                }

                // Add this raise amount on TOP of what the existing bet already is
                return Math.round((potRaiseAmount / 2) + tableState.getTable.value.betStatus.currentBet);

            });

            const raiseThirdPotAmount = computed((): number => {

                // This is how much is already in the pot...
                let potRaiseAmount = tableState.getTable.value.betStatus.getCurrentTotalPot();

                if (myCall.value != null) {

                    // This will be how much is in there once I call...
                    potRaiseAmount += myCall.value.chipsAdded;

                }

                // Add this raise amount on TOP of what the existing bet already is
                return Math.round((potRaiseAmount / 3) + tableState.getTable.value.betStatus.currentBet);

            });


            const myChips = computed((): number => {

                const table: Table = tableState.getTable.value;

                if (table && mySeatIndex.value != null) {

                    return table.seats[mySeatIndex.value].player.chips;

                }

                return null;

            });


            const allInAmount = computed((): number => {

                let potRaiseAmount: number = tableState.getTable.value.betStatus.currentBet;

                if (myCall.value != null) {

                    // Reduce my bet by what I would have to put in to call it flat
                    potRaiseAmount -= myCall.value.chipsAdded;

                }

                if (myChips.value != null) {
                    potRaiseAmount += myChips.value;
                }

                return potRaiseAmount;

            });

            const setRaiseChips = (amount: number) => {

                raiseChips.value = amount;

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
                setRaiseChips,
                raisePotAmount,
                raiseHalfPotAmount,
                raiseThirdPotAmount,
                allInAmount,
                lockInRaise,
                cancelRaise,

                currentTotalPot,


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

        .buttons
        {
            button
            {
                font-weight: bold;

                &.raise
                {
                    color: white;
                    background-color: green;
                }

                &.cancel {
                    color: white;
                    background-color: red;
                }

            }

        }

    }


</style>
