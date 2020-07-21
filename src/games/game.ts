import { HandEvaluator } from "./hand-evaluator";
import { HandDescriber } from "./hand-describer";
import { Board } from "../casino/tables/boards/board";
import { BestHandSelector } from "./hand-selectors/best-hand-selector";
import { ITableStateMachine } from "../casino/tables/states/table-state-machine";

export abstract class Game {

    public stateMachine: ITableStateMachine;
    public handSelector: BestHandSelector;
    public handEvaluator: HandEvaluator;
    public handDescriber: HandDescriber;

    constructor(stateMachine: ITableStateMachine, selector: BestHandSelector, evaluator: HandEvaluator, describer: HandDescriber) {

        this.stateMachine = stateMachine;
        this.handSelector = selector;
        this.handEvaluator = evaluator;
        this.handDescriber = describer;

    }

    abstract newBoard(): Board;

}