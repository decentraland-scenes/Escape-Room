import { ProximityTriggerSystem, Trigger, TriggerBoxShape } from "./modules/proximityTriggerSystem";
import { ToggleComponent, ToggleState } from "./modules/toggleComponent";
import { StateMachine } from "./modules/stateMachine";
import { ScaleTransformComponent, MoveTransformComponent } from "./modules/transfromSystem";

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

    //create mouse
    const mouseEntity = new Entity()
    //set mouse as child of room
    mouseEntity.setParent(roomEntity)
    //add mouse to engine
    //engine.addEntity(mouseEntity)
    //add gltf
    mouseEntity.addComponent(new GLTFShape("models/room7/mouse.glb"))
    //create and add transform
    const mouseTransform = new Transform()
    mouseEntity.addComponent(mouseTransform)
    //create and add mouse component
    const mouseComponent = new MouseComponent(mouseEntity)
    mouseEntity.addComponent(mouseComponent)
    //create trigger for mouse
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(new Vector3(0.2,0.4,0.2), new Vector3(0,0.15,0)), mouseEntity, MouseLayer, PikesLayer | BoxLayer | FanLayer, 
    (trigger: Trigger)=>{
        let triggerType = StateMachineCollisionEvent.BOXES
        if (trigger.layer == PikesLayer){
            triggerType = StateMachineCollisionEvent.PIKES
        }
        else if (trigger.layer == FanLayer){
            triggerType = StateMachineCollisionEvent.FANS
        }
        mouseStateMachine.handleEvent(new StateMachineCollisionEvent(mouseStateMachine, trigger, triggerType))
    }))

    //listen for click on mouse
    mouseEntity.addComponent(new OnClick(event=>{
        mouseStateMachine.handleEvent(new StateMachineOnClickEvent(mouseStateMachine, mouseStateBubbleAppear, mouseStateBurstBubble))
    }))

    //create bubble
    const bubbleEntity = new Entity()
    bubbleEntity.addComponent(new Transform({position: new Vector3(0,0.2,0.05)}))
    const bubbleShape = new SphereShape()
    bubbleEntity.addComponent(bubbleShape)
    bubbleShape.visible = false
    const bubbleMaterial = new Material()
    bubbleMaterial.albedoTexture = new Texture("images/room8/bubbleTexture.png",{hasAlpha: false})
    bubbleMaterial.hasAlpha = true
    bubbleMaterial.alpha = 0.5
    bubbleEntity.addComponent(bubbleMaterial)
    bubbleEntity.setParent(mouseEntity)
    mouseComponent.bubble = bubbleEntity

    //listen for click on bubble
    bubbleEntity.addComponent(new OnClick(event=>{
        mouseStateMachine.handleEvent(new StateMachineOnClickEvent(mouseStateMachine, mouseStateBubbleAppear, mouseStateBurstBubble))
    }))

    //create state machine
    const mouseStateMachine = new StateMachine()
    engine.addSystem(mouseStateMachine)

    //create mouse states
    //state for mouse appearing when game start
    const mouseStateAppear = new MouseStateAppear(mouseComponent)
    //state for mouse walking
    const mouseStateWalking = new MouseStateWalking(mouseComponent)
    //state for bursting bubble
    const mouseStateBurstBubble = new MouseBurstBubbleState(mouseComponent)
    //state for mouse floating inside bubble
    const mouseStateBubble = new MouseBubbleState(mouseComponent, mouseStateBurstBubble)
    //state for bubble appearing and going up
    const mouseStateBubbleAppear = new MouseBubbleStartState(mouseComponent, mouseStateBubble)
    //state for mouse falling to the ground
    const mouseStateFalling = new MouseFallingState(mouseComponent)

    mouseStateAppear.nextState = mouseStateWalking
    mouseStateBurstBubble.nextState = mouseStateFalling
    mouseStateFalling.nextState = mouseStateWalking
    //set initial state
    mouseStateMachine.setState(mouseStateAppear)

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
        new Transform({position: new Vector3(4.5,0,4.5), rotation: Quaternion.Euler(0,-90,0)}),
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
        //engine.addEntity(fanEntity)
        //calc trigger size and position
        let triggerSize = new Vector3(0.5,0.5,2.25).rotate(transform.rotation)
        triggerSize.x = Math.abs(triggerSize.x)
        triggerSize.y = Math.abs(triggerSize.y)
        triggerSize.z = Math.abs(triggerSize.z)
        let triggerPosition = new Vector3(0,1.5,1.25).rotate(transform.rotation)
        //create trigger
        let trigger = new Trigger(new TriggerBoxShape(triggerSize,triggerPosition),fanEntity, FanLayer)
        trigger.enable = false
        //add toggle component
        fanEntity.addComponent(new ToggleComponent(ToggleState.Off, newValue=>{
            if (newValue == ToggleState.On){
                fanAnimation.play()
                trigger.enable = true
            }
            else{
                fanAnimation.stop()
                trigger.enable = false
            }
        }))
        //listen for click
        fanEntity.addComponent(new OnClick(event=>{
            fanEntity.getComponent(ToggleComponent).toggle()
        }))
        //add trigger to system
        ProximityTriggerSystem.instance.addTrigger(trigger)
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

@Component("mouseComponent")
class MouseComponent{
    direction: Vector3
    mouseEntity: Entity
    transform: Transform
    bubble: Entity = null

    constructor(mouseEntity: Entity){
        this.transform = mouseEntity.getComponent(Transform)
        this.mouseEntity = mouseEntity
    }
}

class MouseStateAppear extends StateMachine.State{
    mouseComponent: MouseComponent

    constructor(mouseComponent: MouseComponent){
        super()
        this.mouseComponent = mouseComponent
    }

    onStart(){
        this.mouseComponent.transform.position = new Vector3(0.5,0,1.5)
        this.mouseComponent.direction = Vector3.Right()
        this.mouseComponent.transform.lookAt(this.mouseComponent.transform.position.add(this.mouseComponent.direction))
    }
}

class MouseStateWalking extends StateMachine.State{
    mouseComponent: MouseComponent

    constructor(mouseComponent: MouseComponent){
        super()
        this.mouseComponent = mouseComponent
    }
    onUpdate(dt: number){
        this.mouseComponent.transform.position = this.mouseComponent.transform.position.add(this.mouseComponent.direction.scale(dt))
        if (this.mouseComponent.transform.position.x < 0.3){
            this.mouseComponent.transform.position.x = 0.3
            this.changeDirection()              
        }
        else if (this.mouseComponent.transform.position.x > 5.7){
            this.mouseComponent.transform.position.x = 5.7
            this.changeDirection()              
        }
        if (this.mouseComponent.transform.position.z > 5){
            this.mouseComponent.transform.position.z = 5
            this.changeDirection()              
        }
        return true
    }
    onHandleEvent(event: StateMachine.IStateEvent){
        if (event instanceof StateMachineCollisionEvent){
            if (event.triggerType == StateMachineCollisionEvent.PIKES){
            }
            else if (event.triggerType == StateMachineCollisionEvent.BOXES){
                this.changeDirection()
            }
        }
        else if (event instanceof StateMachineOnClickEvent){
            event.stateMachine.setState(event.bubbleState)
        }
    }

    private changeDirection(){
        this.mouseComponent.direction = this.mouseComponent.direction.scale(-1)
        this.mouseComponent.transform.lookAt(this.mouseComponent.transform.position.add(this.mouseComponent.direction))
    }
}

class MouseBubbleStartState extends StateMachine.State{
    mouseComponent: MouseComponent
    bubbleState: StateMachine.State
    isUp: boolean

    constructor(mouseComponent: MouseComponent, bubbleState: StateMachine.State){
        super()
        this.mouseComponent = mouseComponent
        this.bubbleState = bubbleState
    }

    onStart(){
        this.isUp = false
        this.mouseComponent.bubble.getComponent(SphereShape).visible = true
        this.mouseComponent.bubble.addComponent(new ScaleTransformComponent(Vector3.Zero(), new Vector3(0.5,0.5,0.5), 1.5,()=>{
            let currentPosition = this.mouseComponent.transform.position
            let targetPosition = new Vector3(currentPosition.x, 1, currentPosition.z)
            this.mouseComponent.mouseEntity.addComponent(new MoveTransformComponent(currentPosition, targetPosition, 1, ()=>{
                this.isUp = true
            }))
        }))
    }

    onUpdate(dt: number){
        return true
    }

    onHandleEvent(event: StateMachine.IStateEvent){
        if (event instanceof StateMachineOnClickEvent){
            if (this.isUp){
                event.stateMachine.setState(event.burstState)
            }
        }
        else if (event instanceof StateMachineCollisionEvent){
            if (event.triggerType == StateMachineCollisionEvent.FANS){
                let parentForward = Vector3.Forward().rotate(event.trigger.parent.getComponent(Transform).rotation)
                this.mouseComponent.direction = parentForward
                event.stateMachine.setState(this.bubbleState)
            }
        }
    }
}

class MouseBubbleState extends StateMachine.State{
    mouseComponent: MouseComponent
    bubbleBurstState: StateMachine.State
    time: number

    constructor(mouseComponent: MouseComponent, bubbleBurstState: StateMachine.State){
        super()
        this.mouseComponent = mouseComponent
        this.bubbleBurstState = bubbleBurstState
    }
    onStart(){
        this.time = 0
    }
    onUpdate(dt: number){
        this.time += dt
        let newPosition = this.mouseComponent.transform.position.add(this.mouseComponent.direction.scale(0.5 * dt))
        newPosition.y = 1 + Math.sin(this.time) * 0.1
        this.mouseComponent.transform.position = newPosition
        if (this.mouseComponent.transform.position.x < 0.3){
            this.mouseComponent.transform.position.x = 0.3
        }
        else if (this.mouseComponent.transform.position.x > 5.7){
            this.mouseComponent.transform.position.x = 5.7
        }
        if (this.mouseComponent.transform.position.z > 5){
            this.mouseComponent.transform.position.z = 5
        }
        return true
    }
    onHandleEvent(event: StateMachine.IStateEvent){
        if (event instanceof StateMachineOnClickEvent){
            event.stateMachine.setState(this.bubbleBurstState)
        }
        else if (event instanceof StateMachineCollisionEvent){
            if (event.triggerType == StateMachineCollisionEvent.FANS){
                let parentForward = Vector3.Forward().rotate(event.trigger.parent.getComponent(Transform).rotation)
                this.mouseComponent.direction = parentForward
            }
            else if (event.triggerType == StateMachineCollisionEvent.PIKES){
                event.stateMachine.setState(this.bubbleBurstState)
            }
        }
    }
}

class MouseBurstBubbleState extends StateMachine.State{
    mouseComponent: MouseComponent
    isStateRunning: boolean

    constructor(mouseComponent: MouseComponent){
        super()
        this.mouseComponent = mouseComponent
    }
    onStart(){
        this.isStateRunning = true
        this.mouseComponent.bubble.addComponent(new ScaleTransformComponent(new Vector3(0.5,0.5,0.5), Vector3.One(), 0.5, ()=>{
            this.isStateRunning = false
            this.mouseComponent.bubble.getComponent(SphereShape).visible = false
        }))
    }
    onUpdate(){
        return this.isStateRunning
    }
}

class MouseFallingState extends StateMachine.State{
    mouseComponent: MouseComponent
    isStateRunning: boolean

    constructor(mouseComponent: MouseComponent){
        super()
        this.mouseComponent = mouseComponent
    }
    onStart(){
        this.isStateRunning = true
        this.mouseComponent.mouseEntity.addComponent(new MoveTransformComponent(this.mouseComponent.transform.position, this.mouseComponent.transform.position.add(new Vector3(0,0.1,0)),0.2,
        ()=>{
            let targetPosition = new Vector3(this.mouseComponent.transform.position.x,0,this.mouseComponent.transform.position.z)
            this.mouseComponent.mouseEntity.addComponent(new MoveTransformComponent(this.mouseComponent.transform.position, targetPosition, 0.5, ()=>{
                this.isStateRunning = false    
            }))
        }))
    }
    onUpdate(){
        return this.isStateRunning
    }
}

class StateMachineCollisionEvent implements StateMachine.IStateEvent{
    static readonly PIKES = 0
    static readonly BOXES = 1
    static readonly FANS = 2

    stateMachine: StateMachine
    trigger: Trigger
    triggerType: number

    constructor(stateMachine: StateMachine, trigger: Trigger, triggerType: number){
        this.stateMachine = stateMachine
        this.trigger = trigger
        this.triggerType = triggerType
    }
}

class StateMachineOnClickEvent implements StateMachine.IStateEvent{
    stateMachine: StateMachine
    bubbleState: StateMachine.State
    burstState: StateMachine.State

    constructor(stateMachine: StateMachine, bubbleState: StateMachine.State, burstState: StateMachine.State){
        this.stateMachine = stateMachine
        this.bubbleState = bubbleState
        this.burstState = burstState
    }
}