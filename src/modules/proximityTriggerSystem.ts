export class ProximityTriggerSystem implements ISystem{
    private triggers : TriggerData[] = []

    private static _instance: ProximityTriggerSystem = null

    /**
     * Get singleton instance of ProximityTriggerSystem
     */
    static get instance(): ProximityTriggerSystem { 
        if (ProximityTriggerSystem._instance == null){
            ProximityTriggerSystem._instance = new ProximityTriggerSystem()
            engine.addSystem(ProximityTriggerSystem._instance)
        }
        return ProximityTriggerSystem._instance
    }


    update(dt : number){
        this.triggers.forEach(triggerData => {
            if (triggerData.triggerSettings.enable){
                let collided = ProximityTriggerSystem.isPositionInsideTrigger(Camera.instance.position, triggerData.triggerSettings)
                if (collided && !triggerData.isColliding && triggerData.triggerSettings.onTriggerEnter)triggerData.triggerSettings.onTriggerEnter()
                if (!collided && triggerData.isColliding && triggerData.triggerSettings.onTriggerExit)triggerData.triggerSettings.onTriggerExit()
                triggerData.isColliding = collided
            }
        });
    }

    /**
     * Add a new trigger to system
     * @param trigger trigger instance
     */
    public addTrigger(trigger : ITriggerConfig) : void{
        let triggerData = {
            isColliding: ProximityTriggerSystem.isPositionInsideTrigger(Camera.instance.position, trigger), 
            triggerSettings: trigger
        }
        this.triggers.push(triggerData)
        if (triggerData.triggerSettings.enable && triggerData.isColliding){
            if (triggerData.triggerSettings.onTriggerEnter) triggerData.triggerSettings.onTriggerEnter()
        }
    }

    /**
     * Remove a trigger from system
     * @param trigger trigger instance
     */
    public removeTrigger(trigger : ITriggerConfig) : void{
        for (let i=0; i<this.triggers.length; i++){
            if (this.triggers[i].triggerSettings == trigger){
                this.triggers.splice(i,1)
                break
            }
        }
    }

    /**
     * Get if a position is inside a trigger
     * @param position position to check
     * @param trigger trigger to check against
     */
    public static isPositionInsideTrigger(position : Vector3, trigger : ITriggerConfig) : boolean{
        return Vector3.DistanceSquared(position, ProximityTriggerSystem.getTriggerPosition(trigger)) <= trigger.distance * trigger.distance
    }

    private static getTriggerPosition(trigger : ITriggerConfig) : Vector3{
        let root : Vector3  = trigger.parent? trigger.parent.position : Vector3.Zero()
        return root.add(trigger.positionOffset)
    }
}

export interface ITriggerConfig {
    /**
     * is trigger enable?
     */
    enable : boolean
    /**
     * radius size of the trigger
     */
    distance : number
    /**
     * offset position from parent (if it has no parent it is the offset from the root of the scene Vector3.Zero())
     */
    positionOffset : Vector3
    /**
     * transform parent of the trigger (usefull to move the trigger with an entity)
     */
    parent : Transform
    /**
     * callback when trigger is entered
     */
    onTriggerEnter : () => void
    /**
     * callback when trigger is exit
     */
    onTriggerExit : () => void
}

class TriggerData{
    isColliding : boolean
    triggerSettings : ITriggerConfig    
}

