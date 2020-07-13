import { Action } from "./actions/action";
import { HandEvaluator } from "./hand-evaluator";
import { HandDescriber } from "./hand-describer";

export abstract class Game {

    public actions: Array<Action>;
    public handEvaluator: HandEvaluator;
    public handDescriber: HandDescriber;


    constructor(evaluator: HandEvaluator, describer: HandDescriber) {

        this.handEvaluator = evaluator;
        this.handDescriber = describer;

        this.actions = new Array<Action>();


    }


}