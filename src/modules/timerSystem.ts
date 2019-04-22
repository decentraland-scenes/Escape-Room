export class TimerSystem implements ISystem {
    private runningTimers: Timer[] = []
    private removeTimers: number[] = []

    private static _instance: TimerSystem = null

    static get instance(){ 
        if (TimerSystem._instance == null){
            TimerSystem._instance = new TimerSystem()
            engine.addSystem(TimerSystem._instance)
        }
        return TimerSystem._instance
    }

    private constructor(){
    }

    public runTimer(time: number, onTimerEnds: ()=>void) : Timer{
        let timer = new Timer(time,onTimerEnds)
        this.run(timer)
        return timer
    }

    public run(timer: Timer){
        timer.reset()
        this.runningTimers.push(timer)
        timer.resume()
    }

    public stop(timer: Timer){
        for (let i=0; i<this.runningTimers.length; i++){
            if (timer == this.runningTimers[i]){
                this.runningTimers.splice(i, 1)
                break
            }
        }        
    }

    update(dt: number){
        for (let i=0; i<this.runningTimers.length; i++){
            let timer = this.runningTimers[i]
            timer.update(dt)
            if (timer.hasFinished()){
                this.removeTimers.push(i)
            }
        }
        for (let i=0; i<this.removeTimers.length; i++){
            this.runningTimers.splice(this.removeTimers.pop(), 1)
        }
    }

}

export class Timer {
    protected time: number
    protected timeElapsed: number
    protected onTimerEnds: ()=>void
    protected onTimerUpdate: (dt: number)=>void
    protected running: boolean
    protected finished: boolean

    constructor(seconds: number, onTimerEnds: ()=>void = null, onTimerUpdate: (dt: number)=>void = null){
        this.time = seconds
        this.setOnTimerEnds(onTimerEnds)
        this.setOnTimerUpdate(onTimerUpdate)
        this.reset()
    }

    public reset(){
        this.timeElapsed = 0
        this.running = false
        this.finished = false
    }

    public update(dt: number){
        if (this.running){
            this.timeElapsed = Scalar.Clamp(this.timeElapsed + dt, 0, this.time)
            if (this.onTimerUpdate)this.onTimerUpdate(dt)
            if (this.timeElapsed >= this.time){
                if (this.onTimerEnds)this.onTimerEnds()
                this.running = false
                this.finished = true
            }
        }
    }

    public pause(){
        this.running = false
    }

    public resume(){
        this.running = true
    }

    public isRunning(): boolean{
        return this.running
    }

    public hasFinished(): boolean{
        return this.finished
    }

    public getTimeLeft(): number{
        return this.time - this.timeElapsed
    }

    public getElapsedTime(): number{
        return this.timeElapsed
    }

    public setOnTimerEnds(onTimerEnds: ()=>void): void{
        this.onTimerEnds = onTimerEnds
    }

    public setOnTimerUpdate(onTimerUpdate: (dt: number)=>void){
        this.onTimerUpdate = onTimerUpdate
    }
}
