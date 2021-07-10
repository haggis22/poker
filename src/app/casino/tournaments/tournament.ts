import { Deck } from '../../../app/cards/deck';
import { Game } from '../../../app/games/game';
import { TableRules } from '../tables/table-rules';
import { Stakes } from '../tables/betting/stakes';
import { Limits } from '../tables/betting/limits';

export class Tournament {

    public id: number;
    public name: string;

    public buyIn: number;
    public startingStack: number;

    public limits: Limits;
    public levels: Stakes[];

    public levelDuration: number;

    public currentLevelPtr: number;
    // The counter that tracks how far we are through the current level, whether by time or number of hands, etc
    public levelCounter: number;

    public rules: TableRules;

    public game: Game;
    public deck: Deck;



    public constructor(id: number, name: string, buyIn: number, startingStack: number,
        limits: Limits,
        levels: Stakes[], levelDuration: number,
        rules: TableRules,
        game: Game, deck: Deck) {


        this.id = id;
        this.name = name;
        this.buyIn = buyIn;
        this.startingStack = startingStack;
        this.limits = limits;

        this.levels = levels;
        this.levelDuration = levelDuration;
        this.currentLevelPtr = null;
        this.levelCounter = null;

        this.rules = rules;
        this.game = game;
        this.deck = deck;



    }


    public hasStarted(): boolean {

        return this.currentLevelPtr != null;

    }


}