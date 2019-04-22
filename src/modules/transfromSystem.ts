export class TransformSystem implements ISystem {
    private tasks: TransformTask[] = []
    private removeQueue : number[] = []

    private static _instance: TransformSystem = null

    static get instance(){ 
        if (TransformSystem._instance == null){
            TransformSystem._instance = new TransformSystem()
            engine.addSystem(TransformSystem._instance)
        }
        return TransformSystem._instance
    }

    /**
     * Move transfrom from start position to end position in a period of time
     * @param transform - transform that is going to be moved
     * @param start - defines the starting position
     * @param end - defines the target position
     * @param duration - defines the duration of the movement
     * @param onFinishCallback - callback fired when movement ends
     * @returns instance of the task
     */
    public move(transform: Transform, start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void) : TransformTask {
        var task = new MoveTask(transform, start, end, duration, onFinishCallback)
        this.runTask(task)
        return task
    }

    /**
     * Rotate transfrom from start rotation to end rotation in a period of time
     * @param transform - transform that is going to be rotated
     * @param start - defines the starting rotation
     * @param end - defines the target rotation
     * @param duration - defines the duration of the rotation
     * @param onFinishCallback - callback fired when rotation ends
     * @returns instance of the task
     */
    public rotate(transform: Transform, start: ReadOnlyQuaternion, end: ReadOnlyQuaternion, duration: number, onFinishCallback?: ()=>void) : TransformTask {
        var task = new RotateTask(transform, start, end, duration, onFinishCallback)
        this.runTask(task)
        return task
    }

    /**
     * Run an instance of a transform task
     * @param task - instance of the task
     */
    public runTask(task: TransformTask){
        this.tasks.push(task)
    }

    update (dt : number){
        for (let i=0; i<this.tasks.length; i++){
            let element = this.tasks[i]
            if (element.isRunning()){
                element.update(dt)
            }
            else if (element.isStopped()){
                this.removeQueue.push(i)
            }
        }
        for (let i=0; i<this.removeQueue.length; i++){
            this.tasks.splice(this.removeQueue.pop(),1)
        }
    }

    private constructor(){

    }
}

abstract class TransformTask {
    protected transform: Transform

    private stopped: boolean

    protected constructor (transform: Transform){
        this.transform = transform
        this.stopped = false
    }

    public abstract update(dt: number)

    public stopTask() : void{
        this.stopped = true
    }

    public isRunning(): boolean{
        return !this.stopped
    }

    public isStopped(): boolean{
        return this.stopped
    }
}

abstract class TransformTaskWithFinishCallback extends TransformTask{
    private onFinishCallback : ()=>void

    protected constructor (transform: Transform,  onFinishCallback?: ()=>void){
        super(transform)
        this.onFinishCallback = onFinishCallback
    }

    public stopTask(){
        super.stopTask()
        if (this.onFinishCallback)this.onFinishCallback()
    }
}

export class MoveTask extends TransformTaskWithFinishCallback{

    private start: ReadOnlyVector3
    private end: ReadOnlyVector3
    private speed: number
    private normalizedTime: number

    constructor(transform: Transform, start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void){
        super(transform, onFinishCallback)
        this.start = start
        this.end = end
        this.normalizedTime = 0;

        if (duration != 0){
            this.speed = 1 / duration
        }
        else{
            transform.position = new Vector3(end.x, end.y, end.z)
            this.stopTask();
        }
    }

    public update(dt: number){
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
        this.transform.position = Vector3.Lerp(this.start, this.end, this.normalizedTime)
        if (this.normalizedTime >= 1){
            this.stopTask()
        }
    }
}

export class RotateTask extends TransformTaskWithFinishCallback{
    private start: ReadOnlyQuaternion
    private end: ReadOnlyQuaternion
    private speed: number
    private normalizedTime: number

    constructor(transform: Transform, start: ReadOnlyQuaternion, end: ReadOnlyQuaternion, duration: number, onFinishCallback?: ()=>void){
        super(transform, onFinishCallback)
        this.start = start
        this.end = end
        this.normalizedTime = 0;

        if (duration != 0){
            this.speed = 1 / duration
        }
        else{
            transform.rotation = new Quaternion(end.x, end.y, end.z, end.w)
            this.stopTask();
        }
    }

    public update(dt: number) {
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
        this.transform.rotation = Quaternion.Slerp(this.start, this.end, this.normalizedTime)
        if (this.normalizedTime >= 1){
            this.stopTask()
        }
    }

}