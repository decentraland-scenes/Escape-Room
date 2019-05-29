export class TriggerSystem implements ISystem{
    private triggers : TriggerData[] = []
    private triggersDebug : DebugShapeData[] = []
    private triggerDebugMaterial: Material = null
    private cameraTrigger : TriggerData

    private static _instance: TriggerSystem = null

    /**
     * Get singleton instance of ProximityTriggerSystem
     */
    static get instance(): TriggerSystem { 
        if (TriggerSystem._instance == null){
            TriggerSystem._instance = new TriggerSystem()
            engine.addSystem(TriggerSystem._instance)

            //create trigger for camera
            TriggerSystem._instance.cameraTrigger = {
                 trigger: new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(0.5,1.8,0.5), new Vector3(0,0.91,0))),
                 collidingWith: [],
                 debugging: false,
                 enabled: true
                }
        }
        return TriggerSystem._instance
    }

    update(dt : number){
        //first we update debugging entities if any
        this.triggersDebug.forEach(dbgTrigger=>{
            dbgTrigger.thisTransform.position = TriggerSystem.getTriggerPosition(dbgTrigger.thisTrigger)
        })

        //get camera position and apply trigger offset
        let cameraTriggerPosition = Camera.instance.position.add(this.cameraTrigger.trigger.shape.position)

        //iterate triggers
        this.triggers.forEach(t1 => {
            //check if trigger is enable
            if (t1.trigger.enable){
                //store enable value
                t1.enabled = true

                //check collision with camera trigger (only if trigger has proper callbacks set)
                if (t1.trigger.onCameraEnter != null || t1.trigger.onCameraExit != null){
                    let isColliding = TriggerSystem.isColliding(TriggerSystem.getTriggerPosition(t1.trigger), t1.trigger.shape,
                        cameraTriggerPosition, this.cameraTrigger.trigger.shape)

                    //check if trigger were already colliding
                    let wasCollidingIndex = -1
                    for (let i=0; i<t1.collidingWith.length; i++){
                        if (t1.collidingWith[i] == this.cameraTrigger){
                            wasCollidingIndex = i
                            break
                        }
                    }

                    //if trigger were colliding but they are not colliding any more
                    if (wasCollidingIndex != -1 && !isColliding){
                        t1.collidingWith.splice(wasCollidingIndex, 1)
                        if (t1.trigger.onCameraExit) t1.trigger.onCameraExit()
                    }
                    //if trigger are colliding and they weren't colliding before this frame
                    else if (wasCollidingIndex == -1 && isColliding){
                        t1.collidingWith.push(this.cameraTrigger)
                        if (t1.trigger.onCameraEnter) t1.trigger.onCameraEnter()
                    }
                }

                //check collision with other triggers (only if trigger has proper callbacks set)
                if (t1.trigger.onTriggerEnter != null || t1.trigger.onTriggerExit != null){
                    this.triggers.forEach(t2 => {
                        //check that we are not checking against the same collider and that the other collider is enable
                        if (t1 != t2 && t2.trigger.enable){
                            //check triggers layer/triggeredByLayer relation to see if triggers can collide
                            if (TriggerSystem.canCollideWithTrigger(t1.trigger,  t2.trigger)){
                                 //check if trigger were already colliding
                                let wasCollidingIndex = -1
                                for (let i=0; i<t1.collidingWith.length; i++){
                                    if (t1.collidingWith[i].trigger == t2.trigger){
                                        wasCollidingIndex = i
                                        break
                                    }
                                }
                                //get if triggers are colliding
                                let isColliding = TriggerSystem.isColliding(TriggerSystem.getTriggerPosition(t1.trigger), t1.trigger.shape,
                                    TriggerSystem.getTriggerPosition(t2.trigger), t2.trigger.shape)

                                //if trigger were colliding but they are not colliding any more
                                if (wasCollidingIndex != -1 && !isColliding){
                                    t1.collidingWith.splice(wasCollidingIndex, 1)
                                    if (t1.trigger.onTriggerExit) t1.trigger.onTriggerExit(t2.trigger)
                                }
                                //if trigger are colliding and they weren't colliding before this frame
                                else if (wasCollidingIndex == -1 && isColliding){
                                    t1.collidingWith.push(t2)
                                    if (t1.trigger.onTriggerEnter) t1.trigger.onTriggerEnter(t2.trigger)
                                }
                            }
                        }

                    })
                }
            }
            //if is not enable but was enable
            else if (t1.enabled){
                TriggerSystem.clearTriggerCollisions(t1)
                t1.enabled = false
            }
        });
    }

    /**
     * Add a new trigger to system
     * @param trigger trigger instance
     */
    public addTrigger(trigger : TriggerSystem.Trigger, addDebugginShape: boolean = false) : void{
        //create data for this trigger
        let triggerData = {
            collidingWith: [],
            trigger: trigger,
            debugging: addDebugginShape,
            enabled: false
        }
        this.triggers.push(triggerData)

        //create entity, shape and transform for debugging
        if (addDebugginShape){
            let dbgEntity = new Entity()
            let entityTransform = new Transform()
            let entityShape
            if (trigger.shape instanceof TriggerSystem.TriggerBoxShape){
                entityShape = new BoxShape()
                entityTransform.scale = trigger.shape.size
            }
            else if (trigger.shape instanceof TriggerSystem.TriggerSphereShape){
                entityShape = new SphereShape()
                entityTransform.scale = new Vector3(trigger.shape.radius,trigger.shape.radius,trigger.shape.radius)
            }
            entityShape.withCollisions = false
            dbgEntity.addComponent(entityTransform)
            dbgEntity.addComponent(entityShape)
            engine.addEntity(dbgEntity)

            if (this.triggerDebugMaterial == null){
                this.triggerDebugMaterial = new Material()
                this.triggerDebugMaterial.hasAlpha = true
                this.triggerDebugMaterial.alpha = 0.5
            }
            dbgEntity.addComponent(this.triggerDebugMaterial)

            this.triggersDebug.push({thisTransform: entityTransform, thisTrigger: trigger, thisEntity: dbgEntity})
        }
    }

    /**
     * Remove a trigger from system
     * @param trigger trigger instance
     */
    public removeTrigger(trigger : TriggerSystem.Trigger) : void{
        for (let i=0; i<this.triggers.length; i++){
            if (this.triggers[i].trigger == trigger){
                //remove debugging data
                if (this.triggers[i].debugging){
                    for (let j=0; j<this.triggersDebug.length; j++){
                        if (this.triggersDebug[j].thisTrigger == trigger){
                            engine.removeEntity(this.triggersDebug[j].thisEntity)
                            this.triggersDebug.splice(j,1)
                            break
                        }
                    }
                }
                //remove trigger from other triggers list
                TriggerSystem.clearTriggerCollisions(this.triggers[i])

                //remove from list
                this.triggers.splice(i,1)
                break
            }
        }
    }

    private static clearTriggerCollisions(triggerData : TriggerData){
        for (let j=0; j<triggerData.collidingWith.length; j++){
            for (let k=0; k<triggerData.collidingWith[j].collidingWith.length; k++){
                if (triggerData.collidingWith[j].collidingWith[k].trigger == triggerData.trigger){
                    triggerData.collidingWith[j].collidingWith.splice(k,1)
                    break
                }
            }
        }
        triggerData.collidingWith = []
    }

    private static getTriggerPosition(trigger : TriggerSystem.Trigger) : Vector3{
        if (trigger.parent){
            return TriggerSystem.getTriggerParentPosition(trigger).add(trigger.shape.position)
        }
        return trigger.shape.position
    }

    private static getTriggerParentPosition(trigger : TriggerSystem.Trigger): Vector3{
        if (trigger.parent.hasComponent(Transform)){
            return TriggerSystem.getEntityWorldPosition(trigger.parent)
        }
        return Vector3.Zero()
    }

    private static getEntityWorldPosition(entity: IEntity) : Vector3{
        if (entity.hasComponent(Transform)){
            if (entity.getParent() != null){
                let parent = entity.getParent()
                if (parent.hasComponent(Transform)){
                    return TriggerSystem.getEntityWorldPosition(parent).add(entity.getComponent(Transform).position.rotate(parent.getComponent(Transform).rotation))
                }
            }
            return entity.getComponent(Transform).position
        }
        return Vector3.Zero()
    }

    private static canCollideWithTrigger(t1: TriggerSystem.Trigger, t2: TriggerSystem.Trigger): boolean{
        if (t1.triggeredByLayer == 0) return true
        return (t2.layer & t1.triggeredByLayer) != 0
    }

    private static isColliding(center1: Vector3, shape1 : TriggerShape, center2: Vector3, shape2 : TriggerShape) : boolean{
        //AABB vs AABB
        if (shape1 instanceof TriggerSystem.TriggerBoxShape && shape2 instanceof TriggerSystem.TriggerBoxShape){
            let t1 = TriggerSystem.getBoxShapeValues(center1,shape1)
            let t2 = TriggerSystem.getBoxShapeValues(center2,shape2)
            return (t1.min.x <= t2.max.x && t1.max.x >= t2.min.x) && (t1.min.y <= t2.max.y && t1.max.y >= t2.min.y) && (t1.min.z <= t2.max.z && t1.max.z >= t2.min.z)
        }
        //Sphere vs Sphere
        else if (shape1 instanceof TriggerSystem.TriggerSphereShape && shape2 instanceof TriggerSystem.TriggerSphereShape){
            let sqDist = Vector3.DistanceSquared(center1, center2)
            return sqDist < (shape1.radius * shape1.radius) + (shape2.radius * shape2.radius)
        }
        //AABB vs Sphere
        else if ((shape1 instanceof TriggerSystem.TriggerBoxShape && shape2 instanceof TriggerSystem.TriggerSphereShape) || (shape1 instanceof TriggerSystem.TriggerSphereShape && shape2 instanceof TriggerSystem.TriggerBoxShape)){
            let box = {min: Vector3.Zero(), max: Vector3.Zero()}
            let sphere = {center: Vector3.Zero(), radius: 0}
            let boxCenter = center1

            if (shape1 instanceof TriggerSystem.TriggerBoxShape){
                box = TriggerSystem.getBoxShapeValues(center1,shape1)
            }
            else if (shape2 instanceof TriggerSystem.TriggerBoxShape){
                box = TriggerSystem.getBoxShapeValues(center2,shape2)
                boxCenter = center2
            }
            if (shape1 instanceof TriggerSystem.TriggerSphereShape){
                sphere.center = center1
                sphere.radius = shape1.radius
            }
            else if (shape2 instanceof TriggerSystem.TriggerSphereShape){
                sphere.center = center2
                sphere.radius = shape2.radius
            }

            let maxAxis = Math.max(Math.max(box.max.x - box.min.x, box.max.y - box.min.y), box.max.z - box.min.z) * 0.5
            if (Vector3.DistanceSquared(sphere.center, boxCenter) <= (maxAxis * maxAxis + sphere.radius * sphere.radius)) {
                let dmin = 0;
                if(sphere.center.x < box.min.x) dmin += (box.min.x - sphere.center.x) * (box.min.x - sphere.center.x)
                if(sphere.center.x > box.max.x) dmin += (sphere.center.x - box.max.x) * (sphere.center.x - box.max.x)
                if(sphere.center.y < box.min.y) dmin += (box.min.y - sphere.center.y) * (box.min.y - sphere.center.y)
                if(sphere.center.y > box.max.y) dmin += (sphere.center.y - box.max.y) * (sphere.center.y - box.max.y)
                if(sphere.center.z < box.min.z) dmin += (box.min.z - sphere.center.z) * (box.min.z - sphere.center.z)
                if(sphere.center.z > box.max.z) dmin += (sphere.center.z - box.max.z) * (sphere.center.z - box.max.z)
    
                return dmin < sphere.radius * sphere.radius
            }
        }
        return false
    }

    private static getBoxShapeValues(center: Vector3, shape : TriggerSystem.TriggerBoxShape): {min: Vector3, max: Vector3}{
        return {
            min: center.subtract(shape.size.scale(0.5)), 
            max: center.add(shape.size.scale(0.5))
        }
    }
}

class DebugShapeData{
    thisTransform: Transform
    thisTrigger: TriggerSystem.Trigger
    thisEntity: Entity
}

class TriggerData{
    collidingWith : TriggerData[] = []
    trigger : TriggerSystem.Trigger
    enabled: boolean = false
    debugging : boolean = false
}

interface TriggerShape{
    position: Vector3
}

export namespace TriggerSystem{
    export class Trigger {
        /**
         * is trigger enable?
         */
        enable : boolean = true
        /**
         * parent of the trigger (usefull to move the trigger with an entity)
         */
        parent : Entity = null
        /**
         * shape of the collider
         */
        shape : TriggerShape
        /**
         * byte layer of the Tigger (usefull to discriminate between trigger events)
         */
        layer : number = 0
        /**
         * against which layer are we going to check trigger's collisions
         */
        triggeredByLayer: number = 0
        /**
         * callback when trigger is entered
         */
        onTriggerEnter : (trigger: Trigger) => void = null
        /**
         * callback when trigger is exit
         */
        onTriggerExit : (trigger: Trigger) => void = null
        /**
         * callback when trigger is entered
         */
        onCameraEnter : () => void = null
        /**
         * callback when trigger is exit
         */
        onCameraExit : () => void = null
        /**
         * 
         * @param shape trigger's shape
         * @param parent trigger's parent (if any)
         * @param layer trigger's layer
         * @param triggeredByLayer which layers are we going to check collision against
         * @param onTriggerEnter triggered when another trigger enter
         * @param onTriggerExit triggered when another trigger exit
         * @param onCameraEnter triggered when camera enter trigger
         * @param onCameraExit triggered when camera exit trigger
         */
        constructor(shape: TriggerShape, parent?: Entity, layer: number= 0, triggeredByLayer: number= 0, onTriggerEnter:(trigger: Trigger)=>void = null, onTriggerExit:(trigger: Trigger)=>void = null,
        onCameraEnter:()=>void= null, onCameraExit:()=>void= null){
            this.shape = shape
            this.parent = parent
            this.layer = layer
            this.triggeredByLayer = triggeredByLayer
            this.onTriggerEnter = onTriggerEnter
            this.onTriggerExit = onTriggerExit
            this.onCameraEnter = onCameraEnter
            this.onCameraExit = onCameraExit
        }
    }

    export class TriggerBoxShape implements TriggerShape{
        size: Vector3
        position: Vector3

        constructor(size: Vector3, position: Vector3){
            this.size = size
            this.position = position
        }
    }

    export class TriggerSphereShape implements TriggerShape{
        radius: number
        position: Vector3

        constructor(radius: number, position: Vector3){
            this.radius = radius
            this.position = position
        }
    }
}