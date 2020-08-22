import { HandEvaluator } from "./hand-evaluator";
import { HandDescriber } from "./hand-describer";
import { Board } from "../casino/tables/boards/board";
import { BestHandSelector } from "./hand-selectors/best-hand-selector";
import { TableStateMachine } from "../casino/tables/states/table-state-machine";

export abstract class Game {

    public id: string;
    public stateMachine: TableStateMachine;
    public handSelector: BestHandSelector;
    public handEvaluator: HandEvaluator;
    public handDescriber: HandDescriber;

    constructor(id: string, stateMachine: TableStateMachine, selector: BestHandSelector, evaluator: HandEvaluator, describer: HandDescriber) {

        this.id = id;

        this.stateMachine = stateMachine;
        this.handSelector = selector;
        this.handEvaluator = evaluator;
        this.handDescriber = describer;

    }

    abstract newBoard(): Board;

}