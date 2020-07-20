import { Action } from "./actions/action";
import { HandEvaluator } from "./hand-evaluator";
import { HandDescriber } from "./hand-describer";
import { Board } from "../casino/tables/boards/board";
import { BestHandSelector } from "./hand-selectors/best-hand-selector";

export abstract class Game {

    public actions: Array<Action>;
    public handSelector: BestHandSelector;
    public handEvaluator: HandEvaluator;
    public handDescriber: HandDescriber;

    constructor(selector: BestHandSelector, evaluator: HandEvaluator, describer: HandDescriber) {

        this.handSelector = selector;
        this.handEvaluator = evaluator;
        this.handDescriber = describer;

        this.actions = new Array<Action>();

    }

    abstract newBoard(): Board;

}