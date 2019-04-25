export class TransformSystem implements ISystem {
    update (dt : number){
        let moveGroup = engine.getComponentGroup(MoveTransformComponent)
        let rotateGroup = engine.getComponentGroup(RotateTransformComponent)

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
    }

    private updateComponent(component: ITransformComponent, entity: Entity, transform: Transform, dt: number){
        component.update(dt)
        component.setValue(transform)
        if (component.hasFinished()){
            if (component.onFinishCallback != null) component.onFinishCallback()
            entity.removeComponent(component)
        }
    }
}

interface ITransformComponent{
    onFinishCallback : ()=>void
    update(dt: number)
    hasFinished(): boolean
    setValue(transform: Transform)
}

@Component("moveTransformComponent")
export class MoveTransformComponent implements ITransformComponent{
    private start: ReadOnlyVector3
    private end: ReadOnlyVector3
    private speed: number
    private normalizedTime: number

    onFinishCallback : ()=>void

    constructor(start: ReadOnlyVector3, end: ReadOnlyVector3, duration: number, onFinishCallback?: ()=>void){
        this.start = start
        this.end = end
        this.normalizedTime = 0;
        this.onFinishCallback = onFinishCallback

        if (duration != 0){
            this.speed = 1 / duration
        }
        else{
            this.speed = 0
            this.normalizedTime = 1;
        }
    }

    update(dt: number){
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
    }

    getPosition(): Vector3{
        return Vector3.Lerp(this.start, this.end, this.normalizedTime)
    }

    hasFinished(): boolean{
        return this.normalizedTime >= 1
    }

    setValue(transform: Transform){
        transform.position = this.getPosition()
    }
}

@Component("rotateTransformComponent")
export class RotateTransformComponent{
    private start: ReadOnlyQuaternion
    private end: ReadOnlyQuaternion
    private speed: number
    private normalizedTime: number

    onFinishCallback : ()=>void

    constructor(start: ReadOnlyQuaternion, end: ReadOnlyQuaternion, duration: number, onFinishCallback?: ()=>void){
        this.start = start
        this.end = end
        this.normalizedTime = 0;
        this.onFinishCallback = onFinishCallback

        if (duration != 0){
            this.speed = 1 / duration
        }
        else{
            this.speed = 0
            this.normalizedTime = 1;
        }
    }

    update(dt: number){
        this.normalizedTime = Scalar.Clamp(this.normalizedTime + dt * this.speed, 0, 1)
    }

    getRotation(): Quaternion{
        return Quaternion.Slerp(this.start, this.end, this.normalizedTime)
    }

    hasFinished(): boolean{
        return this.normalizedTime >= 1
    }

    setValue(transform: Transform){
        transform.rotation = this.getRotation()
    }
}