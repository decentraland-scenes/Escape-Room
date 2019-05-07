import { ProximityTriggerSystem, Trigger, TriggerBoxShape } from "./modules/proximityTriggerSystem";
import { ToggleComponent, ToggleState } from "./modules/toggleComponent";

export function CreateRoom8(): void{
    //set trigger layers
    const MouseLayer = 8
    const PikesLayer = 16
    const BoxLayer = 32
    const FanLayer = 64

    //create room entity
    const roomEntity = new Entity()
    //add gltf shape
    roomEntity.addComponent(new GLTFShape("models/room8/room8.glb"))
    //add and set transform
    //roomEntity.addComponent(new Transform({position: new Vector3(32,0,1)}))
    roomEntity.addComponent(new Transform({position: new Vector3(1,0,1)}))
    //create animator
    const roomAnimator = new Animator()
    //create animation state for room
    const roomAnimation = new AnimationState("idle", {looping: true}) 
    //add clip to animator
    roomAnimator.addClip(roomAnimation)
    //add animator to entity
    roomEntity.addComponent(roomAnimator)
    //play animation
    roomAnimation.play()
    //add room to engine
    engine.addEntity(roomEntity)

    //create fan shape
    const fanShape = new GLTFShape("models/room8/fan.glb")

    //create fan entities array
    const fans: Entity[] = []

    //create fans transfrom
    const fansTransform: Transform[] = [
        new Transform({position: new Vector3(-0.5,0,1.5), rotation: Quaternion.Euler(0,90,0)}), 
        new Transform({position: new Vector3(-0.5,0,2.5), rotation: Quaternion.Euler(0,90,0)}), 
        new Transform({position: new Vector3(2.5,0,-0.5)}), 
        new Transform({position: new Vector3(3.5,0,-0.5)}), 
        new Transform({position: new Vector3(0.5,0,5.5), rotation: Quaternion.Euler(0,180,0)}), 
        new Transform({position: new Vector3(6.5,0,4.5), rotation: Quaternion.Euler(0,-90,0)}), 
    ]

    fansTransform.forEach(transform => {
        //instantiate animation
        let fanAnimation = new AnimationState("turnon",{looping:true})
        //create animator
        let fanAnimator = new Animator()        
        //add clip to animator
        fanAnimator.addClip(fanAnimation)
        //create entity
        let fanEntity = new Entity()
        //add shape
        fanEntity.addComponent(fanShape)
        //add animator
        fanEntity.addComponent(fanAnimator)
        //add transform
        fanEntity.addComponent(transform)
        //set room as parent
        fanEntity.setParent(roomEntity)
        //add entity to engine
        engine.addEntity(fanEntity)
        //add toggle component
        fanEntity.addComponent(new ToggleComponent(ToggleState.Off, newValue=>{
            if (newValue == ToggleState.On){
                fanAnimation.play()
            }
            else{
                fanAnimation.stop()
            }
        }))
        //listen for click
        fanEntity.addComponent(new OnClick(event=>{
            fanEntity.getComponent(ToggleComponent).toggle()
        }))
        //get transform forward vector
        //let triggerSize = new Vector3(0.5,0.5,1).rotate(transform.rotation)
        let triggerSize = new Vector3(0.5,0.5,0.5)
        //let triggerPosition = new Vector3(0,1,0.5)
        let triggerPosition = Vector3.Zero()
        //create trigger
        let trigger = new Trigger(new TriggerBoxShape(triggerSize,triggerPosition),fanEntity, FanLayer)
        //add trigger to system
        ProximityTriggerSystem.instance.addTrigger(trigger, true)
        //add entity to array
        fans.push(fanEntity)
    });

    //set some fans to ON state
    fans[0].getComponent(ToggleComponent).set(ToggleState.On)
    fans[3].getComponent(ToggleComponent).set(ToggleState.On)
    fans[4].getComponent(ToggleComponent).set(ToggleState.On)

    //create pikes' triggers
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(Vector3.One(),new Vector3(0.5,0.5,0.5)), roomEntity, PikesLayer))
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(Vector3.One(),new Vector3(5.5,0.5,4.5)), roomEntity, PikesLayer))

    //create boxes's triggers
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(1.5,0.25,1.5)), roomEntity, BoxLayer))
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(3.5,0.25,2.5)), roomEntity, BoxLayer))
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(1.5,0.25,4.5)), roomEntity, BoxLayer))
}