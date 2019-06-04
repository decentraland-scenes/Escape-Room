import { TriggerSystem } from "./modules/triggerSystem";
import { ToggleComponent } from "./modules/toggleComponent";
import { StateMachine } from "./modules/stateMachine";
import { ScaleTransformComponent, MoveTransformComponent, TransformSystem, RotateTransformComponent } from "./modules/transfromSystem";
import { ParticleSystem } from "./modules/particleSystem";

export function CreateRoom8(): void{
    //set trigger layers
    const MouseLayer = 8
    const PikesLayer = 16
    const BoxLayer = 32
    const FanLayer = 64
    const CageLayer = 128

    //create room entity
    const roomEntity = new Entity()
    //add gltf shape
    roomEntity.addComponent(new GLTFShape("models/room8/room8.glb"))
    //add and set transform
    roomEntity.addComponent(new Transform({position: new Vector3(32,0,1)}))
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

    //cage entity
    const cageEntity = new Entity()
    //cage gltf shape
    cageEntity.addComponent(new GLTFShape("models/room8/cage.glb"))
    //cage transform
    cageEntity.addComponent(new Transform({position:new Vector3(4.5,0,2.5), rotation: Quaternion.Euler(0,-90,0)}))
    //set as child of room entity
    cageEntity.setParent(roomEntity)

    //button entity
    const buttonEntity = new Entity()
    //button gltf shape
    buttonEntity.addComponent(new GLTFShape("models/generic/redbutton.gltf"))
    //button transform
    buttonEntity.addComponent(new Transform({position:new Vector3(0,-0.1,-0.2), scale: new Vector3(0.3,0.3,0.3)}))
    //set as child of cage entity
    buttonEntity.setParent(cageEntity)

    //create mouse
    const mouseEntity = new Entity()
    //set mouse as child of room
    mouseEntity.setParent(roomEntity)
    //add gltf
    mouseEntity.addComponent(new GLTFShape("models/room7/mouse.glb"))
    //create and add transform
    const mouseTransform = new Transform()
    mouseEntity.addComponent(mouseTransform)
    //create and add mouse component
    const mouseComponent = new MouseComponent(mouseEntity)
    mouseEntity.addComponent(mouseComponent)
    //create trigger for mouse
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(0.2,0.4,0.2), new Vector3(0,0.15,0)), mouseEntity, MouseLayer, PikesLayer | BoxLayer | FanLayer | CageLayer, 
    (trigger: TriggerSystem.Trigger)=>{
        let triggerType = StateMachineCollisionEvent.BOXES
        if (trigger.layer == PikesLayer){
            triggerType = StateMachineCollisionEvent.PIKES
        }
        else if (trigger.layer == FanLayer){
            triggerType = StateMachineCollisionEvent.FANS
        }
        else if (trigger.layer == CageLayer){
            triggerType = StateMachineCollisionEvent.CAGE
        }
        mouseStateMachine.handleEvent(new StateMachineCollisionEvent(mouseStateMachine, trigger, triggerType))
    }))

    //listen for click on mouse
    mouseEntity.addComponent(new OnClick(event=>{
        mouseStateMachine.handleEvent(new StateMachineOnClickEvent(mouseStateMachine, mouseStateBubbleAppear, mouseStateBurstBubble))
    }))

    //create bubble entity
    const bubbleEntity = new Entity()
    //add transform
    bubbleEntity.addComponent(new Transform({position: new Vector3(0,0.2,0.05)}))
    //create shape and add it as component
    const bubbleShape = new SphereShape()
    bubbleEntity.addComponent(bubbleShape)
    //set it as invisible
    bubbleShape.visible = false
    //create bubble material
    const bubbleMaterial = new Material()
    bubbleMaterial.albedoTexture = new Texture("images/room8/bubbleTexture.png",{hasAlpha: false})
    bubbleMaterial.hasAlpha = true
    bubbleMaterial.alpha = 0.5
    //add bubble material
    bubbleEntity.addComponent(bubbleMaterial)
    //set bubble as child of mouse
    bubbleEntity.setParent(mouseEntity)
    //set bubble to mouseComponent
    mouseComponent.bubble = bubbleEntity

    //listen for click on bubble
    bubbleEntity.addComponent(new OnClick(event=>{
        mouseStateMachine.handleEvent(new StateMachineOnClickEvent(mouseStateMachine, mouseStateBubbleAppear, mouseStateBurstBubble))
    }))

    //create material for bubble particle system
    const bubbleParticleMaterial = new Material()
    bubbleParticleMaterial.albedoTexture = new Texture("images/room8/bubbleParticle.png",{hasAlpha:true})
    bubbleParticleMaterial.hasAlpha = true
    bubbleParticleMaterial.alpha = 0.5
    bubbleParticleMaterial.emissiveColor = Color3.White()

    //config emitter for bubble particle system
    const bubbleParticleEmitter: ParticleSystem.IEmitterConfig = {
        loop: false,
        startDelay: 0,
        maxParticles: 6,
        duration: 0,
        particleLifeTime: 0.5,
        particleSpawnInterval: 0,
        sourceSize: Vector3.Zero(),
        particlesBehavior: new BubbleParticlesBehavior(bubbleParticleMaterial)
    }

    //create bubble particle system and add it to engine
    const bubbleParticleSystem = new ParticleSystem(bubbleParticleEmitter)
    bubbleParticleSystem.setParent(bubbleEntity)
    engine.addSystem(bubbleParticleSystem)

    //create state machine
    const mouseStateMachine = new StateMachine()
    engine.addSystem(mouseStateMachine)

    //create mouse states
    //state for mouse appearing when game start
    const mouseStateAppear = new MouseStateAppear(mouseComponent)
    //state for when mouse died
    const mouseStateDie = new MouseDeadState(mouseComponent)
    //state for mouse entering the cage
    const mouseStateEnterCage = new MouseEnterCageState(mouseComponent,()=>{
        //TODO: end puzzle here
    })
    //state for mouse walking
    const mouseStateWalking = new MouseStateWalking(mouseComponent, mouseStateDie, mouseStateEnterCage)
    //state for bursting bubble
    const mouseStateBurstBubble = new MouseBurstBubbleState(mouseComponent, bubbleParticleSystem)
    //state for mouse floating inside bubble
    const mouseStateBubble = new MouseBubbleState(mouseComponent, mouseStateBurstBubble)
    //state for bubble appearing and going up
    const mouseStateBubbleAppear = new MouseBubbleStartState(mouseComponent, mouseStateBubble)
    //state for mouse falling to the ground
    const mouseStateFalling = new MouseFallingState(mouseComponent, mouseStateDie)

    //what states should automatically start when a state ends
    mouseStateAppear.nextState = mouseStateWalking
    mouseStateBurstBubble.nextState = mouseStateFalling
    mouseStateFalling.nextState = mouseStateWalking
    mouseStateDie.nextState = mouseStateAppear

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

        //calc trigger size and position
        let triggerSize = new Vector3(0.5,0.5,2.25).rotate(transform.rotation)
        triggerSize.x = Math.abs(triggerSize.x)
        triggerSize.y = Math.abs(triggerSize.y)
        triggerSize.z = Math.abs(triggerSize.z)
        let triggerPosition = new Vector3(0.2,1.5,1.25).rotate(transform.rotation)
        //create trigger
        let trigger = new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(triggerSize,triggerPosition),fanEntity, FanLayer)
        trigger.enable = false
        //add toggle component
        fanEntity.addComponent(new ToggleComponent(ToggleComponent.State.Off, newValue=>{
            if (newValue == ToggleComponent.State.On){
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
        TriggerSystem.instance.addTrigger(trigger)
        //add entity to array
        fans.push(fanEntity)
    });

    //set some fans to ON state
    fans[0].getComponent(ToggleComponent).set(ToggleComponent.State.On)
    fans[3].getComponent(ToggleComponent).set(ToggleComponent.State.On)
    fans[4].getComponent(ToggleComponent).set(ToggleComponent.State.On)

    //create pikes' triggers
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(0.5,0.25,0.5)), roomEntity, PikesLayer))
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(1,0.7,1),new Vector3(0.5,0.95,0.5)), roomEntity, PikesLayer))
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(3.5,0.25,4.5)), roomEntity, PikesLayer))
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(1,0.7,1),new Vector3(3.5,0.95,4.5)), roomEntity, PikesLayer))

    //create boxes's triggers
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(1.5,0.25,1.5)), roomEntity, BoxLayer))
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(2.5,0.25,2.5)), roomEntity, BoxLayer))
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(1,0.5,1),new Vector3(1.5,0.25,4.5)), roomEntity, BoxLayer))

    //create cage's trigger
    TriggerSystem.instance.addTrigger(new TriggerSystem.Trigger(new TriggerSystem.TriggerBoxShape(new Vector3(0.5,1,1),new Vector3(-0.5,0.5,0)), cageEntity, CageLayer))
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

/**
 * mouse appearing state
 */
class MouseStateAppear extends StateMachine.State{
    mouseComponent: MouseComponent

    constructor(mouseComponent: MouseComponent){
        super()
        this.mouseComponent = mouseComponent
    }

    /**
     * called when state starts
     */
    onStart(){
        //set mouse to it initial position
        this.mouseComponent.transform.position = new Vector3(0.5,0,1.5)
        //set mouse to it initial scale
        this.mouseComponent.transform.scale = Vector3.Zero()
        //set direction to zero
        this.mouseComponent.direction = Vector3.Zero()
        //start scaling mouse and set it direction when finish scaling
        this.mouseComponent.mouseEntity.addComponent(new ScaleTransformComponent(Vector3.Zero(), Vector3.One(), 1, ()=>{
            this.mouseComponent.direction = Vector3.Right()
            this.mouseComponent.transform.lookAt(this.mouseComponent.transform.position.add(this.mouseComponent.direction))
        }, TransformSystem.Interpolation.EASEQUAD))
    }
}

/**
 * mouse walking state
 */
class MouseStateWalking extends StateMachine.State{
    mouseComponent: MouseComponent
    deadState: StateMachine.State
    cageState: StateMachine.State

    /**
     * create an instance of the state
     * @param mouseComponent mouse component
     * @param deadState state for mouse dying
     * @param cageState state for going inside the cage
     */
    constructor(mouseComponent: MouseComponent, deadState: StateMachine.State, cageState: StateMachine.State){
        super()
        this.mouseComponent = mouseComponent
        this.deadState = deadState
        this.cageState = cageState
    }
    /**
     * called when state starts
     */    
    onStart(){
        //rotate mouse to look to direction
        this.mouseComponent.transform.lookAt(this.mouseComponent.transform.position.add(this.mouseComponent.direction))
    }
    /**
     * called when state is updated
     * @param dt delta
     * return TRUE to keep state running, FALSE to finish state
     */
    onUpdateState(dt: number){
        //move mouse
        this.mouseComponent.transform.position = this.mouseComponent.transform.position.add(this.mouseComponent.direction.scale(dt))
        //check room boundries to make the mouse bounce and go the other direction
        if (this.mouseComponent.transform.position.x < 0.3){
            this.mouseComponent.transform.position.x = 0.3
            this.changeDirection()              
        }
        else if (this.mouseComponent.transform.position.x > 3.7){
            this.mouseComponent.transform.position.x = 3.7
            this.changeDirection()              
        }
        if (this.mouseComponent.transform.position.z > 5){
            this.mouseComponent.transform.position.z = 5
            this.changeDirection()              
        }
        else if (this.mouseComponent.transform.position.z < 0.3){
            this.mouseComponent.transform.position.z = 0.3
            this.changeDirection()              
        }
        return true
    }
    /**
     * handle events received by the state machine
     * @param event event to handle
     */
    onHandleEvent(event: StateMachine.IStateEvent){
        //if a collision is received
        if (event instanceof StateMachineCollisionEvent){
            //if it's PIKES then mouse should die
            if (event.triggerType == StateMachineCollisionEvent.PIKES){
                event.stateMachine.setState(this.deadState)
            }
            //it it's a BOX then mouse should change it moving direction
            else if (event.triggerType == StateMachineCollisionEvent.BOXES){
                this.changeDirection()
            }
            //if it's the CAGE then we call the state to finish the puzzle
            else if (event.triggerType == StateMachineCollisionEvent.CAGE){
                let mouseForward = Vector3.Forward().rotate(this.mouseComponent.transform.rotation)
                if (mouseForward.x >= 0.9){
                    event.stateMachine.setState(this.cageState)
                }
            }
        }
        //if mouse is clicked then bubble should appear
        else if (event instanceof StateMachineOnClickEvent){
            event.stateMachine.setState(event.bubbleState)
        }
    }

    /**
     * change mouse moving direction and mouse rotation
     */
    private changeDirection(){
        this.mouseComponent.direction = this.mouseComponent.direction.scale(-1)
        this.mouseComponent.transform.lookAt(this.mouseComponent.transform.position.add(this.mouseComponent.direction))
    }
}

/**
 * state for bubble appearing and then going up in the air
 */
class MouseBubbleStartState extends StateMachine.State{
    mouseComponent: MouseComponent
    bubbleState: StateMachine.State
    isUp: boolean

    /**
     * create instance of the state
     * @param mouseComponent mouse component
     * @param bubbleState state for mouse inside bubble floating in place
     */
    constructor(mouseComponent: MouseComponent, bubbleState: StateMachine.State){
        super()
        this.mouseComponent = mouseComponent
        this.bubbleState = bubbleState
    }
    /**
     * called when state starts
     */
    onStart(){
        //mouse is not fully up in the air yet
        this.isUp = false
        //let's make the bubble appear
        this.mouseComponent.bubble.getComponent(SphereShape).visible = true
        //scale the bubble to it's default scale
        this.mouseComponent.bubble.addComponent(new ScaleTransformComponent(Vector3.Zero(), new Vector3(0.5,0.5,0.5), 1.5,()=>{
            //when bubble finish scaling up, whe move the mouse up in the air
            let currentPosition = this.mouseComponent.transform.position
            let targetPosition = new Vector3(currentPosition.x, 1, currentPosition.z)
            this.mouseComponent.mouseEntity.addComponent(new MoveTransformComponent(currentPosition, targetPosition, 1, ()=>{
                //now mouse is fully up in the air
                this.isUp = true
            }))
        }))
    }
    /**
     * called when state is updated
     * @param dt delta
     * return TRUE to keep state running, FALSE to finish state
     */
    onUpdateState(dt: number){
        return true
    }
    /**
     * handle events received by the state machine
     * @param event event to handle
     */
    onHandleEvent(event: StateMachine.IStateEvent){
        //if bubble is clicked
        if (event instanceof StateMachineOnClickEvent){
            //and we are fully up in the air
            if (this.isUp){
                //we burst the bubblw
                event.stateMachine.setState(event.burstState)
            }
        }
        //if we receive a collision event
        else if (event instanceof StateMachineCollisionEvent){
            //and the collision is with a trigger of a fan
            if (event.triggerType == StateMachineCollisionEvent.FANS){
                //get the forward vector of the fan and set it as mouse's direction
                let parentForward = Vector3.Forward().rotate(event.trigger.parent.getComponent(Transform).rotation)
                this.mouseComponent.direction = parentForward
                //and change the state to the bubble floating around state
                event.stateMachine.setState(this.bubbleState)
            }
        }
    }
}

/**
 * bubble floating around pushed by some wind from the fans
 */
class MouseBubbleState extends StateMachine.State{
    mouseComponent: MouseComponent
    bubbleBurstState: StateMachine.State
    time: number

    /**
     * create an instance of the state
     * @param mouseComponent mouse component
     * @param bubbleBurstState burst bubble state
     */
    constructor(mouseComponent: MouseComponent, bubbleBurstState: StateMachine.State){
        super()
        this.mouseComponent = mouseComponent
        this.bubbleBurstState = bubbleBurstState
    }
    /**
     * called when state starts
     */    
    onStart(){
        this.time = 0
    }
    /**
     * called when state is updated
     * @param dt delta
     * return TRUE to keep state running, FALSE to finish state
     */    
    onUpdateState(dt: number){
        //increment time
        this.time += dt
        //calc new position according to mouse direction, speed and time
        let newPosition = this.mouseComponent.transform.position.add(this.mouseComponent.direction.scale(0.5 * dt))
        //let's use the SIN function to move the mouse a little up and down
        newPosition.y = 1 + Math.sin(this.time) * 0.1
        //set new position to mouse
        this.mouseComponent.transform.position = newPosition
        //check room boundries
        if (this.mouseComponent.transform.position.x < 0.3){
            this.mouseComponent.transform.position.x = 0.3
        }
        else if (this.mouseComponent.transform.position.x > 3.7){
            this.mouseComponent.transform.position.x = 3.7
        }
        if (this.mouseComponent.transform.position.z > 5){
            this.mouseComponent.transform.position.z = 5
        }
        else if (this.mouseComponent.transform.position.z < 0.3){
            this.mouseComponent.transform.position.z = 0.3
        }
        return true
    }
    /**
     * handle events received by the state machine
     * @param event event to handle
     */    
    onHandleEvent(event: StateMachine.IStateEvent){
        //if bubble is clicked we burst it
        if (event instanceof StateMachineOnClickEvent){
            event.stateMachine.setState(this.bubbleBurstState)
        }
        //if we trigger a collision
        else if (event instanceof StateMachineCollisionEvent){
            //if it's a FAN, then we move in it's forward direction
            if (event.triggerType == StateMachineCollisionEvent.FANS){
                let parentForward = Vector3.Forward().rotate(event.trigger.parent.getComponent(Transform).rotation)
                this.mouseComponent.direction = parentForward
            }
            //if it's a PIKE then the bubble should burst
            else if (event.triggerType == StateMachineCollisionEvent.PIKES){
                event.stateMachine.setState(this.bubbleBurstState)
            }
        }
    }
}

/**
 * state for bubble bursting
 */
class MouseBurstBubbleState extends StateMachine.State{
    mouseComponent: MouseComponent
    isStateRunning: boolean
    burstParticleSystem: ParticleSystem

    /**
     * create an instance of the state
     * @param mouseComponent mouse component
     * @param burstParticleSystem particle system to use when bubble burst
     */
    constructor(mouseComponent: MouseComponent, burstParticleSystem: ParticleSystem){
        super()
        this.mouseComponent = mouseComponent
        this.burstParticleSystem = burstParticleSystem
    }
    /**
     * called when state starts
     */    
    onStart(){
        //set the state as running
        this.isStateRunning = true
        //scale down the bubble
        this.mouseComponent.bubble.addComponent(new ScaleTransformComponent(new Vector3(0.5,0.5,0.5), Vector3.One(), 0.5, ()=>{
            //the state shuld end now
            this.isStateRunning = false
            //set bubble as invisible
            this.mouseComponent.bubble.getComponent(SphereShape).visible = false
            //play particle system
            this.burstParticleSystem.start()
        }))
    }
    /**
     * called when state is updated
     * @param dt delta
     * return TRUE to keep state running, FALSE to finish state
     */    
    onUpdateState(){
        //is state still running?
        return this.isStateRunning
    }
}

/**
 * state for mouse falling after bubble burst
 */
class MouseFallingState extends StateMachine.State{
    mouseComponent: MouseComponent
    isStateRunning: boolean
    deadState: StateMachine.State

    /**
     * create instance of the state
     * @param mouseComponent mouse component
     * @param deadState state to start if mouse die
     */
    constructor(mouseComponent: MouseComponent, deadState: StateMachine.State){
        super()
        this.mouseComponent = mouseComponent
        this.deadState = deadState
    }
    /**
     * called when state starts
     */    
    onStart(){
        //set state as running
        this.isStateRunning = true
        //move the mouse a little bit up with an ease out
        this.mouseComponent.mouseEntity.addComponent(new MoveTransformComponent(this.mouseComponent.transform.position, this.mouseComponent.transform.position.add(new Vector3(0,0.1,0)),0.2,
        ()=>{
            //calc position to the floor
            let targetPosition = new Vector3(this.mouseComponent.transform.position.x,0,this.mouseComponent.transform.position.z)
            //move the mouse to the floor
            this.mouseComponent.mouseEntity.addComponent(new MoveTransformComponent(this.mouseComponent.transform.position, targetPosition, 0.5, ()=>{
                //state should end now
                this.isStateRunning = false    
            }, TransformSystem.Interpolation.EASEINQUAD))
        }, TransformSystem.Interpolation.EASEOUTQUAD))
    }
    /**
     * called when state is updated
     * @param dt delta
     * return TRUE to keep state running, FALSE to finish state
     */    
    onUpdateState(){
        //is state still running?
        return this.isStateRunning
    }
    /**
     * handle events received by the state machine
     * @param event event to handle
     */    
    onHandleEvent(event: StateMachine.IStateEvent){
        //if we trigger a collision while falling down
        if (event instanceof StateMachineCollisionEvent){
            //if we collide with a PIKE or with a BOX
            if (event.triggerType == StateMachineCollisionEvent.PIKES || event.triggerType == StateMachineCollisionEvent.BOXES){
                //stop moving down
                if (this.mouseComponent.mouseEntity.hasComponent(MoveTransformComponent)){
                    this.mouseComponent.mouseEntity.removeComponent(MoveTransformComponent)
                }
                //mouse should die
                event.stateMachine.setState(this.deadState)
            }
        }
    }
}

/**
 * state for when mouse dies
 */
class MouseDeadState extends StateMachine.State{
    mouseComponent: MouseComponent
    isStateRunning: boolean

    constructor(mouseComponent: MouseComponent){
        super()
        this.mouseComponent = mouseComponent
    }
    /**
     * called when state starts
     */    
    onStart(){
        //state is running
        this.isStateRunning = true
        //set time for the transfom system's components
        const time = 1.5
        //rotate the mouse
        this.mouseComponent.mouseEntity.addComponent(new RotateTransformComponent(this.mouseComponent.transform.rotation, 
            this.mouseComponent.transform.rotation.multiply(Quaternion.Euler(0,270,0)), time))
        //and scale it down
        this.mouseComponent.mouseEntity.addComponent(new ScaleTransformComponent(this.mouseComponent.transform.scale, Vector3.Zero(), time, ()=>{
            //now the state should end
            this.isStateRunning = false
        }, TransformSystem.Interpolation.EASEINQUAD))
    }
    /**
     * called when state is updated
     * @param dt delta
     * return TRUE to keep state running, FALSE to finish state
     */    
    onUpdateState(){
        //is state running?
        return this.isStateRunning
    }
}

/**
 * state to make mouse enter the cage
 */
class MouseEnterCageState extends StateMachine.State{
    mouseComponent: MouseComponent
    isStateRunning: boolean
    onStateFinish: ()=> void

    /**
     * create instance of the state
     * @param mouseComponent mouse component
     * @param onStateFinish callback when state ends
     */
    constructor(mouseComponent: MouseComponent, onStateFinish: ()=> void){
        super()
        this.mouseComponent = mouseComponent
        this.onStateFinish = onStateFinish
    }
    /**
     * called when state starts
     */    
    onStart(){
        //the state is running
        this.isStateRunning = true
        //let's move the mouse inside the cage
        this.mouseComponent.mouseEntity.addComponent(new MoveTransformComponent(this.mouseComponent.transform.position, new Vector3(4.5,0,2.7), 1.5, ()=>{
            //state should end now
            this.isStateRunning = false
        }, TransformSystem.Interpolation.EASEQUAD))
    }
    /**
     * called when state is updated
     * @param dt delta
     * return TRUE to keep state running, FALSE to finish state
     */    
    onUpdateState(){
        return this.isStateRunning
    }
    onEnd(){
        //callback call
        if (this.onStateFinish)this.onStateFinish()
    }
}

/**
 * event for state machine when a collision is triggered
 */
class StateMachineCollisionEvent implements StateMachine.IStateEvent{
    static readonly PIKES = 0
    static readonly BOXES = 1
    static readonly FANS = 2
    static readonly CAGE = 3

    stateMachine: StateMachine
    trigger: TriggerSystem.Trigger
    triggerType: number

    /**
     * 
     * @param stateMachine state machine reference
     * @param trigger reference of the trigger we collide with
     * @param triggerType type of the trigger we collide with
     */
    constructor(stateMachine: StateMachine, trigger: TriggerSystem.Trigger, triggerType: number){
        this.stateMachine = stateMachine
        this.trigger = trigger
        this.triggerType = triggerType
    }
}

/**
 * event for state machine when we click mouse or bubble
 */
class StateMachineOnClickEvent implements StateMachine.IStateEvent{
    stateMachine: StateMachine
    bubbleState: StateMachine.State
    burstState: StateMachine.State

    /**
     * 
     * @param stateMachine state machine reference
     * @param bubbleState reference of the state for creating bubble
     * @param burstState reference of the state for bursting the bubble
     */
    constructor(stateMachine: StateMachine, bubbleState: StateMachine.State, burstState: StateMachine.State,){
        this.stateMachine = stateMachine
        this.bubbleState = bubbleState
        this.burstState = burstState
    }
}

/**
 * behavior for bubble's particles
 */
class BubbleParticlesBehavior implements ParticleSystem.IParticlesBehavior{
    private particleIndex: number = 0
    private particleMaterial: Material

    /**
     * 
     * @param particleMaterial material that we are going to use for the particles
     */
    constructor(particleMaterial: Material){
        this.particleMaterial = particleMaterial
    }
    /**
     * called when a particle is created
     * @param particleEntity particle's entity
     * @param properties properties of the particle
     */
    onCreate(particleEntity: Readonly<Entity>, properties: Readonly<ParticleSystem.ParticleProperties>) { 
        //calc an angle for this particle
        let angle = 60 * this.particleIndex
        //set it's direction according to the calculated angle
        let direction = Vector3.Right().rotate(Quaternion.Euler(0,0,angle))
        //offset from the source to appear
        let startOffset = direction.scale(0.05)
        //create a bundle for this particle
        properties.setBundle({
            particleStartOffset: startOffset
        })
        //increase particle index for calculating angle for next particle
        this.particleIndex++
        //add material to the particle
        particleEntity.addComponent(this.particleMaterial)
        //set particle scale
        properties.setScale(new Vector3(0.1,0.1,0.1))
        //set particle velocity
        properties.setVelocity(direction.scale(1.5))
        //set particle material
        properties.setMaterial(this.particleMaterial)
    }   
    /**
     * called when a particle is spawned
     * @param properties properties of the particle
     */ 
    onSpawn(properties: Readonly<ParticleSystem.ParticleProperties>) {
        //set particle initial position according to it's offset
        let position = properties.getPosition().add(properties.getBundle().particleStartOffset)
        properties.setPosition(position)
    }
    onUpdate(properties: Readonly<ParticleSystem.ParticleProperties>, lifeTimeRatio: number) {
    }

}