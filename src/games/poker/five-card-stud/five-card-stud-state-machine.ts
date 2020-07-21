import { PokerStateMachine } from "../poker-state-machine";
import { DealState } from "../../../casino/tables/states/deal-state";
import { BetState } from "../../../casino/tables/states/betting/bet-state";
import { ShowdownState } from "../../../casino/tables/states/showdown-state";
import { HandCompleteState } from "../../../casino/tables/states/hand-complete-state";
import { StartHandState } from "../../../casino/tables/states/start-hand-state";

export class FiveCardStudStateMachine extends PokerStateMachine {


    constructor() {

        super();

        this.states.push(new StartHandState());

        this.states.push(new DealState(false));

        this.states.push(new DealState(true));
        this.states.push(new BetState(BetState.BEST_HAND));

        this.states.push(new DealState(false));
        this.states.push(new BetState(BetState.BEST_HAND));

        this.states.push(new DealState(false));
        this.states.push(new BetState(BetState.BEST_HAND));

        this.states.push(new DealState(false));
        this.states.push(new BetState(BetState.BEST_HAND));

        this.states.push(new ShowdownState());

        this.states.push(new HandCompleteState());

    }


}