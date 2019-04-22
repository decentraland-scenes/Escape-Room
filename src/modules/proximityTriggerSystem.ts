export class ProximityTriggerSystem implements ISystem{
    private triggers : TriggerData[] = []

    private static _instance: ProximityTriggerSystem = null

    static get instance(){ 
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

    public removeTrigger(trigger : ITriggerConfig) : void{
        for (let i=0; i<this.triggers.length; i++){
            if (this.triggers[i].triggerSettings == trigger){
                this.triggers.splice(i,1)
                break
            }
        }
    }

    public static isPositionInsideTrigger(position : Vector3, trigger : ITriggerConfig) : boolean{
        return Vector3.DistanceSquared(position, ProximityTriggerSystem.getTriggerPosition(trigger)) <= trigger.distance * trigger.distance
    }

    private static getTriggerPosition(trigger : ITriggerConfig) : Vector3{
        let root : Vector3  = trigger.parent? trigger.parent.position : Vector3.Zero()
        return root.add(trigger.positionOffset)
    }
}

export interface ITriggerConfig {
    enable : boolean
    distance : number
    positionOffset : Vector3
    parent : Transform
    onTriggerEnter : () => void
    onTriggerExit : () => void
}

class TriggerData{
    isColliding : boolean
    triggerSettings : ITriggerConfig    
}

