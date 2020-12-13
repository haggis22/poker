export class Timer {

    private static readonly STEP_TIME: number = 50;

    private timer: ReturnType<typeof setTimeout>;

    private startTime: number;
    private expireTime: number;
    private totalTime: number;

    public timeRemaining: number;



    constructor(expireTime: number) {

        this.startTime = Date.now();
        this.expireTime = expireTime;

        this.timeRemaining = this.totalTime = Math.max(this.expireTime - this.startTime, 0);

    }

    public percentRemaining(): number {

        if (this.totalTime > 0) {
            return 100 * (this.timeRemaining / this.totalTime);
        }

        return 0;

    }


    private stepDown(): void {

        clearTimeout(this.timer);

        this.timeRemaining = Math.max(this.expireTime - Date.now(), 0);

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