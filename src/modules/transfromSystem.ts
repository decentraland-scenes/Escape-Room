export class TransformSystem implements ISystem {
    update (dt : number){
        let moveGroup = engine.getComponentGroup(MoveTransformComponent, Transform)
        let rotateGroup = engine.getComponentGroup(RotateTransformComponent, Transform)
        let scaleGroup = engine.getComponentGroup(ScaleTransformComponent, Transform)
        let followPathGroup = engine.getComponentGroup(FollowPathComponent, Transform)

        for (let entity of moveGroup.entities){
            if (entity.hasComponent(Transform)){
                let transform = entity.getComponent(Transform)
                this.updateComponent(entity.getComponent(MoveTransformComponent), entity, transform, dt)
            }
        }

        for (let entity of rotateGroup.entities){
            if (entity.hasComponent(Transform)){
                let transform = entity.getComponent(Transform)
                this.updateComponent(entity.getComponent(RotateTransformComponent), entity, transform, dt)
            }
        }

        for (let entity of scaleGroup.entities){
            if (entity.hasComponent(Transform)){
                let transform = entity.getComponent(Transform)
                this.updateComponent(entity.getComponent(ScaleTransformComponent), entity, transform, dt)
            }
        }

        for (let entity of followPathGroup.entities){
            if (entity.hasComponent(Transform)){
                let transform = entity.getComponent(Transform)
                this.updateComponent(entity.getComponent(FollowPathComponent), entity, transform, dt)
            }
        }
    }

    private updateComponent(component: ITransformComponent, entity: IEntity, transform: Transform, dt: number){
        component.update(dt)
        component.setValue(transform)
        if (component.hasFinished()){
            entity.removeComponent(component)
            if (component.onFinishCallback != null) component.onFinishCallback()
        }
    }
}

export namespace TransformSystem{
    export enum Interpolation{
        LINEAR,
        EASEINQUAD,
        EASEOUTQUAD,
        EASEQUAD
    }

    export function Interpolate(type: Interpolation, t: number) : number{
        switch(type){
            case Interpolation.LINEAR:
                return InterpolateLinear(t)
            case Interpolation.EASEINQUAD:
                return InterpolateEaseInQuad(t)
            case Interpolation.EASEOUTQUAD:
                return InterpolateEaseOutQuad(t)
            case Interpolation.EASEQUAD:
                return InterpolateEaseQuad(t)
            default:
                return InterpolateLinear(t)
        }
    }
    function InterpolateLinear(t: number) : number{
        return t
    }
    function InterpolateEaseInQuad(t: number) : number{
        return t*t
    }
    function InterpolateEaseOutQuad(t: number) : number{
        return t*(2-t)
    }
    function InterpolateEaseQuad(t: number) : number{
        return (t*t) / (2.0 * ((t*t) - t) + 1.0)
    }
}


interface ITransformComponent{
    onFinishCallback : ()=>void
    update(dt: number)
    hasFinished(): boolean
    setValue(transform: Transform)
}

/**
 * Component to translate entity from one position (start) to another (end) in an amount of time
 */
@Component("moveTransformComponent")
export class MoveTransformComponent implements ITransformComponent{
    private start: ReadOnlyVector3
    private end: ReadOnlyVector3
    private speed: number
    private normalizedTime: number
    private interpolationType: TransformSystem.Interpolation
    private lerpTime : number

    onFinishCallback : ()=>void

    /**
     * Create a MoveTransformComponent instance to add as a component to a Entity
     * @param start starting position
     * @param end ending position
     * @param duration duration (in seconds) of start to end translation
     * @param onFinishCallback called when translation ends
     * @param interpolationType type of interpolation to be used (default: LINEAR)
     */
    constructor(start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void, interpolationType: TransformSystem.Interpolation = TransformSystem.Interpolation.LINEAR){
        this.start = start
        this.end = end
        this.normalizedTime = 0;
        this.lerpTime = 0;
        this.onFinishCallback = onFinishCallback
        this.interpolationType = interpolationType

        if (duration != 0){
            this.speed = 1 / duration
        }
        else{
            this.speed = 0
            this.normalizedTime = 1;
            this.lerpTime = 1;
        }
    }

    update(dt: number){
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
        this.lerpTime = TransformSystem.Interpolate(this.interpolationType, this.normalizedTime)
    }

    getPosition(): Vector3{
        return Vector3.Lerp(this.start, this.end, this.lerpTime)
    }

    hasFinished(): boolean{
        return this.normalizedTime >= 1
    }

    setValue(transform: Transform){
        transform.position = this.getPosition()
    }
}

/**
 * Component to rotate entity from one rotation (start) to another (end) in an amount of time
 */
@Component("rotateTransformComponent")
export class RotateTransformComponent{
    private start: ReadOnlyQuaternion
    private end: ReadOnlyQuaternion
    private speed: number
    private normalizedTime: number
    private interpolationType: TransformSystem.Interpolation
    private lerpTime : number

    onFinishCallback : ()=>void

    /**
     * Create a RotateTransformComponent instance to add as a component to a Entity
     * @param start starting rotation
     * @param end ending rotation
     * @param duration duration (in seconds) of start to end rotation
     * @param onFinishCallback called when rotation ends
     * @param interpolationType type of interpolation to be used (default: LINEAR)
     */
    constructor(start: ReadOnlyQuaternion, end: ReadOnlyQuaternion, duration: number, onFinishCallback?: ()=>void, interpolationType: TransformSystem.Interpolation = TransformSystem.Interpolation.LINEAR){
        this.start = start
        this.end = end
        this.normalizedTime = 0;
        this.lerpTime = 0;
        this.onFinishCallback = onFinishCallback
        this.interpolationType = interpolationType

        if (duration != 0){
            this.speed = 1 / duration
        }
        else{
            this.speed = 0
            this.normalizedTime = 1;
            this.lerpTime = 1;
        }
    }

    update(dt: number){
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
        this.lerpTime = TransformSystem.Interpolate(this.interpolationType, this.normalizedTime)
    }

    getRotation(): Quaternion{
        return Quaternion.Slerp(this.start, this.end, this.lerpTime)
    }

    hasFinished(): boolean{
        return this.normalizedTime >= 1
    }

    setValue(transform: Transform){
        transform.rotation = this.getRotation()
    }
}

/**
 * Component to scale entity from one value (start) to another (end) in an amount of time
 */
@Component("scaleTransformComponent")
export class ScaleTransformComponent implements ITransformComponent{
    private start: ReadOnlyVector3
    private end: ReadOnlyVector3
    private speed: number
    private normalizedTime: number
    private interpolationType: TransformSystem.Interpolation
    private lerpTime : number

    onFinishCallback : ()=>void

    /**
     * Create a ScaleTransformComponent instance to add as a component to a Entity
     * @param start starting scale
     * @param end ending scale
     * @param duration duration (in seconds) of start to end scaling
     * @param onFinishCallback called when scaling ends
     */
    constructor(start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void, interpolationType: TransformSystem.Interpolation = TransformSystem.Interpolation.LINEAR){
        this.start = start
        this.end = end
        this.normalizedTime = 0;
        this.lerpTime = 0;
        this.onFinishCallback = onFinishCallback
        this.interpolationType = interpolationType

        if (duration != 0){
            this.speed = 1 / duration
        }
        else{
            this.speed = 0
            this.normalizedTime = 1;
            this.lerpTime = 1;
        }
    }

    update(dt: number){
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
        this.lerpTime = TransformSystem.Interpolate(this.interpolationType, this.normalizedTime)
    }

    getScale(): Vector3{
        return Vector3.Lerp(this.start, this.end, this.lerpTime)
    }

    hasFinished(): boolean{
        return this.normalizedTime >= 1
    }

    setValue(transform: Transform){
        transform.scale = this.getScale()
    }
}

/**
 * Component to move a entity down a fixed path in an amount of time
 */
@Component("followPathComponent")
export class FollowPathComponent implements ITransformComponent{
    private points : Vector3[]
    private speed: number[] = []
    private normalizedTime: number
    private currentIndex: number

    onFinishCallback : ()=>void
    onPointReachedCallback : (currentPoint:Vector3, nextPoint:Vector3)=>void

    /**
     * Create a FollowPathComponent instance to add as a component to a Entity
     * @param points array of points for the path
     * @param duration duration of the movement through the path
     * @param onFinishCallback called when movement ends
     * @param onPointReachedCallback called everytime an entity reaches a point of the path
     */
    constructor(points : Vector3[], duration: number, onFinishCallback?: ()=>void, onPointReachedCallback?: (currentPoint:Vector3, nextPoint:Vector3)=>void){
        this.normalizedTime = 0
        this.currentIndex = 0
        this.points = points
        this.onFinishCallback = onFinishCallback
        this.onPointReachedCallback = onPointReachedCallback

        if (points.length < 2){
            throw new Error("At least 2 points are needed for FollowPathComponent.");
        }

        if (duration > 0){
            let sqTotalDist = 0
            let sqPointsDist = []
            for (let i=0; i<points.length-1; i++){
                let sqDist = Vector3.DistanceSquared(points[i], points[i+1])
                sqTotalDist += sqDist
                sqPointsDist.push(sqDist)
            }
            for (let i=0; i<sqPointsDist.length; i++){
                this.speed.push(1 / (sqPointsDist[i] / sqTotalDist * duration))
            }
        }
        else{
            this.normalizedTime = 1
            this.currentIndex = points.length-2
        }
    }

    update(dt: number) {
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed[this.currentIndex], 0, 1)
        if (this.normalizedTime >= 1 && this.currentIndex < this.points.length-2){
            this.currentIndex ++
            this.normalizedTime = 0
            if (this.onPointReachedCallback && this.currentIndex < this.points.length-1) this.onPointReachedCallback(this.points[this.currentIndex],this.points[this.currentIndex+1])
        }
    }
    hasFinished(): boolean {
        return this.currentIndex >= this.points.length-2 && this.normalizedTime >= 1
    }
    setValue(transform: Transform) {
        transform.position = this.getPosition()
    }
    getPosition() : Vector3{
        return Vector3.Lerp(this.points[this.currentIndex], this.points[this.currentIndex+1], this.normalizedTime)
    }
}