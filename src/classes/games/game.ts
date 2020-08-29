import { HandEvaluator } from "./hand-evaluator";
import { HandDescriber } from "./hand-describer";
import { Board } from "../casino/tables/boards/board";
import { BestHandSelector } from "./hand-selectors/best-hand-selector";
import { TableStateMachine } from "../casino/tables/states/table-state-machine";
import { TableState } from "../communication/serializable";

export abstract class Game {

    public id: string;
    public stateMachine: TableStateMachine;
    public handSelector: BestHandSelector;
    public handEvaluator: HandEvaluator;
    public handDescriber: HandDescriber;

    constructor(id: string, selector: BestHandSelector, evaluator: HandEvaluator, describer: HandDescriber) {

        this.id = id;

        this.stateMachine = new TableStateMachine(this.getStates());

        this.handSelector = selector;
        this.handEvaluator = evaluator;
        this.handDescriber = describer;

    }

    abstract newBoard(): Board;

    abstract getName(): string;

    protected abstract getStates(): TableState[];

}