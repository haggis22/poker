export class Timer {

    public static readonly STEP_TIME: number = 50;

    public startTime: number;
    public expireTime: number;
    public totalTime: number;

    public percentRemaining: number;



    constructor(expireTime: number) {

        this.startTime = Date.now();
        this.expireTime = expireTime;

        this.totalTime = Math.max(this.expireTime - this.startTime, 0);

    }

}