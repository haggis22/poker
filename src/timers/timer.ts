export class Timer {

    private static readonly STEP_TIME: number = 50;

    private timer: ReturnType<typeof setTimeout>;

    public totalTime: number;
    public timeRemaining: number;



    constructor(totalTime: number) {

        this.timeRemaining = this.totalTime = totalTime;

    }

    public percentRemaining(): number {

        if (this.totalTime > 0) {
            return 100 * (this.timeRemaining / this.totalTime);
        }

        return 0;

    }


    private stepDown(): void {

        clearTimeout(this.timer);

        this.timeRemaining = Math.max(this.timeRemaining - Timer.STEP_TIME, 0);

        if (this.timeRemaining > 0) {

            this.timer = setTimeout(() => { this.stepDown(); }, Math.min(Timer.STEP_TIME, this.timeRemaining));

        }

    }  // stepDown


    public start(): void {

        this.timer = setTimeout(() => { this.stepDown(); }, Timer.STEP_TIME);

    }

    public stop(): void {

        clearTimeout(this.timer);

    }

}