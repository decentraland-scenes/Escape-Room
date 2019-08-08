import utils from "../node_modules/decentraland-ecs-utils/index"
import { StateMachine } from "./modules/stateMachine";

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
    roomEntity.addComponent(new GLTFShape("models/room8/Puzzle09_Game.glb"))
    //add and set transform
    roomEntity.addComponent(new Transform({position: new Vector3(19.0928,0,28.6582)}))
    //create animator
    const roomAnimator = new Animator()
    //create animation state for room
    const roomAnimation = new AnimationState("Spikes_Action", {looping: true}) 
    //add clip to animator
    roomAnimator.addClip(roomAnimation)
    //add animator to entity
    roomEntity.addComponent(roomAnimator)
    //play animation
    roomAnimation.play()
    //add room to engine
    engine.addEntity(roomEntity)

    //create mouse
    const mouseEntity = new Entity("mouse")
    //set mouse as child of room
    mouseEntity.setParent(roomEntity)
    //add gltf
    mouseEntity.addComponent(new GLTFShape("models/room8/Puzzle09_MouseWill.glb"))
    //create and add transform
    const mouseTransform = new Transform()
    mouseEntity.addComponent(mouseTransform)
    //create and add mouse component
    const mouseComponent = new MouseComponent(mouseEntity)
    mouseEntity.addComponent(mouseComponent)
    //add trigger for mouse
    mouseEntity.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.2,0.1,0.2), new Vector3(0,0,0)),
        MouseLayer, PikesLayer | BoxLayer | FanLayer | CageLayer,
        (entityEnter) =>{
            let triggerType = StateMachineCollisionEvent.BOXES
            let triggerLayer = entityEnter.getComponent(utils.TriggerComponent).layer
            if (triggerLayer == PikesLayer){
                triggerType = StateMachineCollisionEvent.PIKES
            }
            else if (triggerLayer == FanLayer){
                triggerType = StateMachineCollisionEvent.FANS
            }
            else if (triggerLayer == CageLayer){
                triggerType = StateMachineCollisionEvent.CAGE
            }
            mouseStateMachine.handleEvent(new StateMachineCollisionEvent(mouseStateMachine, entityEnter, triggerType))
        }
    ))

    //listen for click on mouse
    mouseEntity.addComponent(new OnClick(event=>{
        mouseStateMachine.handleEvent(new StateMachineOnClickEvent(mouseStateMachine, mouseStateBubbleAppear, mouseStateBurstBubble))
    }))

    //create bubble entity
    const bubbleEntity = new Entity()
    //add transform
    bubbleEntity.addComponent(new Transform({position: new Vector3(0,0.1,0.05)}))
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
        drawerClip.play()
    })
    //state for mouse walking
    const mouseStateWalking = new MouseStateWalking(mouseComponent, mouseStateDie, mouseStateEnterCage)
    //state for bursting bubble
    const mouseStateBurstBubble = new MouseBurstBubbleState(mouseComponent)
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

    //load fan audio clio
    let audioClipFan = new AudioClip("sounds/fan.mp3")

    //create fan shape
    const fanShape = new GLTFShape("models/room8/Fan.glb")

    //create fan entities array
    const fans: Entity[] = []

    //create fans transfrom
    const fansTransform: Transform[] = [
        new Transform({position: new Vector3(-3.18875,1.01502,-0.57951), rotation: Quaternion.Euler(0,90,0), scale: new Vector3(0.6,0.6,0.6)}),
        new Transform({position: new Vector3(-3.18875,1.01502,0.02), rotation: Quaternion.Euler(0,90,0), scale: new Vector3(0.6,0.6,0.6)}), 
        new Transform({position: new Vector3(0.169518,1.01502,-2.94794), scale: new Vector3(0.6,0.6,0.6)}), 
        new Transform({position: new Vector3(0.75203,1.01502,-2.94794), scale: new Vector3(0.6,0.6,0.6)}), 
        new Transform({position: new Vector3(-0.873027,1.01502,3.0735), rotation: Quaternion.Euler(0,180,0), scale: new Vector3(0.6,0.6,0.6)}), 
        new Transform({position: new Vector3(1.9556,1.01502,1.08835), rotation: Quaternion.Euler(0,-90,0), scale: new Vector3(0.6,0.6,0.6)}),
    ]

    fansTransform.forEach(transform => {
        //instantiate animation
        let fanAnimation = new AnimationState("Fan_Action",{looping:true})
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
        //add audio source
        fanEntity.addComponent(new AudioSource(audioClipFan))
        //set room as parent
        fanEntity.setParent(roomEntity)

        //calc trigger size and position
        let triggerSize = new Vector3(0.5,0.5,2.25).rotate(transform.rotation)
        triggerSize.x = Math.abs(triggerSize.x)
        triggerSize.y = Math.abs(triggerSize.y)
        triggerSize.z = Math.abs(triggerSize.z)
        let triggerPosition = new Vector3(0.2,0.65,1.35).rotate(transform.rotation)
        
        //create trigger component
        let triggerComponent = new utils.TriggerComponent(new utils.TriggerBoxShape(triggerSize,triggerPosition), FanLayer)
        triggerComponent.enabled = false
        fanEntity.addComponent(triggerComponent)

        //add toggle component
        fanEntity.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, newValue=>{
            if (newValue == utils.ToggleState.On){
                fanAnimation.play()
                fanEntity.getComponent(AudioSource).playing = true
                fanEntity.getComponent(AudioSource).loop = true
                fanEntity.getComponent(AudioSource).volume = 0.3
                triggerComponent.enabled = true
            }
            else{
                fanEntity.getComponent(AudioSource).playing = false
                fanAnimation.stop()
                triggerComponent.enabled = false
            }
        }))
        //listen for click
        fanEntity.addComponent(new OnClick(event=>{
            fanEntity.getComponent(utils.ToggleComponent).toggle()
        }))

        //add entity to array
        fans.push(fanEntity)
    });

    //set some fans to ON state
    fans[0].getComponent(utils.ToggleComponent).set(utils.ToggleState.On)
    fans[3].getComponent(utils.ToggleComponent).set(utils.ToggleState.On)
    fans[4].getComponent(utils.ToggleComponent).set(utils.ToggleState.On)

    //room triggers
    let roomTriggerEntities: Entity[] = [new Entity(),new Entity(),new Entity(),new Entity(),new Entity(),new Entity(),new Entity(),new Entity()]

    //create pikes' triggers
    roomTriggerEntities[0].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.06,0.52),new Vector3(0.212483,1.15162,-0.04)), PikesLayer))
    roomTriggerEntities[1].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.4,0.52),new Vector3(-0.885757,1.17605,-1.14666)), PikesLayer))
    roomTriggerEntities[2].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.06,0.52),new Vector3(-0.347696,1.15162,-0.575279)), PikesLayer))
    roomTriggerEntities[3].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.4,0.52),new Vector3(0.729466,1.17605,1.08766)), PikesLayer))
    roomTriggerEntities[4].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.06,0.52),new Vector3(-0.347696,1.15162,1.08902)), PikesLayer))

    //create boxes's triggers
    roomTriggerEntities[5].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.16,0.52),new Vector3(0.212483,1.04742,-0.04)), BoxLayer))
    roomTriggerEntities[6].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.16,0.52),new Vector3(-0.347696,1.04742,-0.575279)), BoxLayer))
    roomTriggerEntities[7].addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.16,0.52),new Vector3(-0.347696,1.04742,1.08902)), BoxLayer))

    //create cage's trigger
    const cageTrigger = new Entity()
    cageTrigger.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.52,0.16,0.52),new Vector3(1.0331,1.04742,-0.04)), CageLayer))
    cageTrigger.setParent(roomEntity)

    //set triggers as child of room entity
    roomTriggerEntities.forEach(triggerEntity => {
        triggerEntity.setParent(roomEntity)
    });

    //create drawer for hint
    const drawer = new Entity()
    const drawerClip = new AnimationState("Drawer_Action",{looping: false})
    const drawerAnimator = new Animator()
    drawerAnimator.addClip(drawerClip)
    drawer.addComponent(new GLTFShape("models/room8/Drawer.glb"))
    drawer.addComponent(new Transform({position: new Vector3(20.5487,0.563795,28.6556)}))
    drawer.addComponent(drawerAnimator)
    engine.addEntity(drawer)

    //create door entity
    const door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/room8/Puzzle09_Door.glb"))

    //add transform and set position
    door.addComponent(new Transform({position:new Vector3(23.2215,0,25.0522)}))

    //creat animator and add animation clips
    let doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationState("Door_Open", {looping:false}))
    doorAnimator.addClip(new AnimationState("Door_Close", {looping:false}))
    door.addComponent(doorAnimator)

    //create audio source component, set audio clip and add it to door entity
    let doorAudioSource = new AudioSource(new AudioClip("sounds/door_squeak.mp3"))
    door.addComponent(doorAudioSource)

    //listen to onclick event to toggle door state
    door.addComponent(new OnClick(event =>{
        doorAnimator.getClip("Door_Open").play()
        door.getComponent(AudioSource).playOnce()
    }))

    //add door to engine
    engine.addEntity(door)
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
        this.mouseComponent.transform.position = new Vector3(-0.872083,1,-0.579439)
        //set mouse to it initial scale
        this.mouseComponent.transform.scale = Vector3.Zero()
        //set direction to zero
        this.mouseComponent.direction = Vector3.Zero()
        //start scaling mouse and set it direction when finish scaling
        this.mouseComponent.mouseEntity.addComponent(new utils.ScaleTransformComponent(Vector3.Zero(), Vector3.One(), 1, ()=>{
            this.mouseComponent.direction = Vector3.Right()
            this.mouseComponent.transform.lookAt(this.mouseComponent.transform.position.add(this.mouseComponent.direction))
        }, utils.InterpolationType.EASEQUAD))
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
        this.mouseComponent.transform.position = this.mouseComponent.transform.position.add(this.mouseComponent.direction.scale(0.5 * dt))
        //check room boundries to make the mouse bounce and go the other direction
        if (this.mouseComponent.transform.position.x < -1.12){
            this.mouseComponent.transform.position.x = -1.12
            this.changeDirection()              
        }
        else if (this.mouseComponent.transform.position.x > 0.98){
            this.mouseComponent.transform.position.x = 0.98
            this.changeDirection()              
        }
        if (this.mouseComponent.transform.position.z > 1.33){
            this.mouseComponent.transform.position.z = 1.33
            this.changeDirection()              
        }
        else if (this.mouseComponent.transform.position.z < -1.37){
            this.mouseComponent.transform.position.z = -1.37
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
    audioClipInflate: AudioClip 

    /**
     * create instance of the state
     * @param mouseComponent mouse component
     * @param bubbleState state for mouse inside bubble floating in place
     */
    constructor(mouseComponent: MouseComponent, bubbleState: StateMachine.State){
        super()
        this.mouseComponent = mouseComponent
        this.bubbleState = bubbleState
        this.audioClipInflate = new AudioClip("sounds/inflator.mp3")
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
        this.mouseComponent.bubble.addComponent(new utils.ScaleTransformComponent(Vector3.Zero(), new Vector3(0.3,0.3,0.3), 1.5,()=>{
            //when bubble finish scaling up, whe move the mouse up in the air
            let currentPosition = this.mouseComponent.transform.position
            let targetPosition = new Vector3(currentPosition.x, 1.4, currentPosition.z)
            this.mouseComponent.mouseEntity.addComponent(new utils.MoveTransformComponent(currentPosition, targetPosition, 1, ()=>{
                //now mouse is fully up in the air
                this.isUp = true
            }))
        }))
        //play sound
        let audioSource = new AudioSource(this.audioClipInflate)
        this.mouseComponent.mouseEntity.addComponentOrReplace(audioSource)
        audioSource.playOnce()
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
                let parentForward = Vector3.Forward().rotate(event.entity.getComponent(Transform).rotation)
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
        this.time = 0.5
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
        let newPosition = this.mouseComponent.transform.position.add(this.mouseComponent.direction.scale(0.2 * dt))
        //let's use the SIN function to move the mouse a little up and down
        newPosition.y = 1.5 + Math.sin(this.time) * 0.1
        //set new position to mouse
        this.mouseComponent.transform.position = newPosition
        //check room boundries
        if (this.mouseComponent.transform.position.x < -1.12){
            this.mouseComponent.transform.position.x = -1.12
        }
        else if (this.mouseComponent.transform.position.x > 0.98){
            this.mouseComponent.transform.position.x = 0.98
        }
        if (this.mouseComponent.transform.position.z > 1.33){
            this.mouseComponent.transform.position.z = 1.33
        }
        else if (this.mouseComponent.transform.position.z < -1.37){
            this.mouseComponent.transform.position.z = -1.37
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
                let parentForward = Vector3.Forward().rotate(event.entity.getComponent(Transform).rotation)
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
    audioClipPop: AudioClip 
    burstParticle: Entity

    /**
     * create an instance of the state
     * @param mouseComponent mouse component
     * @param burstParticleSystem particle system to use when bubble burst
     */
    constructor(mouseComponent: MouseComponent){
        super()
        this.mouseComponent = mouseComponent
        this.audioClipPop = new AudioClip("sounds/pop.mp3")
        
        const bubbleParticleMaterial = new Material()
        bubbleParticleMaterial.albedoTexture = new Texture("images/room8/bubbleParticle.png",{hasAlpha:true})
        bubbleParticleMaterial.hasAlpha = true
        bubbleParticleMaterial.alpha = 0.5
        bubbleParticleMaterial.emissiveColor = Color3.White()

        this.burstParticle = new Entity()
        this.burstParticle.addComponent(new PlaneShape())
        this.burstParticle.addComponent(new Billboard())
        this.burstParticle.addComponent(bubbleParticleMaterial)
        this.burstParticle.addComponent(new Transform({scale: Vector3.Zero()}))
        this.burstParticle.setParent(mouseComponent.mouseEntity.getParent())
    }
    /**
     * called when state starts
     */    
    onStart(){
        //set the state as running
        this.isStateRunning = true
        //scale down the bubble
        this.mouseComponent.bubble.addComponent(new utils.ScaleTransformComponent(new Vector3(0.5,0.5,0.5), Vector3.One(), 0.5, ()=>{
            //the state shuld end now
            this.isStateRunning = false
            //set bubble as invisible
            this.mouseComponent.bubble.getComponent(SphereShape).visible = false
            //set particle position
            const particleTransform = this.burstParticle.getComponent(Transform)            
            particleTransform.position = this.mouseComponent.transform.position
            //play particle effect
            this.burstParticle.addComponent(new utils.ScaleTransformComponent(Vector3.Zero(), new Vector3(0.4,0.4,0.4),0.3,()=>{
                particleTransform.scale = Vector3.Zero()
            }))
            //play audioclip
            let audioSource = new AudioSource(this.audioClipPop)
            this.mouseComponent.mouseEntity.addComponentOrReplace(audioSource)
            audioSource.playOnce()
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
        this.mouseComponent.mouseEntity.addComponent(new utils.MoveTransformComponent(this.mouseComponent.transform.position, this.mouseComponent.transform.position.add(new Vector3(0,0.1,0)),0.2,
        ()=>{
            //calc position to the floor
            let targetPosition = new Vector3(this.mouseComponent.transform.position.x,1,this.mouseComponent.transform.position.z)
            //move the mouse to the floor
            this.mouseComponent.mouseEntity.addComponent(new utils.MoveTransformComponent(this.mouseComponent.transform.position, targetPosition, 0.5, ()=>{
                //state should end now
                this.isStateRunning = false    
            }, utils.InterpolationType.EASEINQUAD))
        }, utils.InterpolationType.EASEOUTQUAD))
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
                if (this.mouseComponent.mouseEntity.hasComponent(utils.MoveTransformComponent)){
                    this.mouseComponent.mouseEntity.removeComponent(utils.MoveTransformComponent)
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
        this.mouseComponent.mouseEntity.addComponent(new utils.RotateTransformComponent(this.mouseComponent.transform.rotation, 
            this.mouseComponent.transform.rotation.multiply(Quaternion.Euler(0,270,0)), time))
        //and scale it down
        this.mouseComponent.mouseEntity.addComponent(new utils.ScaleTransformComponent(this.mouseComponent.transform.scale, Vector3.Zero(), time, ()=>{
            //now the state should end
            this.isStateRunning = false
        }, utils.InterpolationType.EASEINQUAD))
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
        this.mouseComponent.mouseEntity.addComponent(new utils.MoveTransformComponent(this.mouseComponent.transform.position, new Vector3(1.85275,1.06965,-0.04), 1.5, ()=>{
            //state should end now
            this.isStateRunning = false
        }, utils.InterpolationType.EASEQUAD))
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
    entity: Entity
    triggerType: number

    /**
     * 
     * @param stateMachine state machine reference
     * @param entity reference of the entity we collide with
     * @param triggerType type of the trigger we collide with
     */
    constructor(stateMachine: StateMachine, entity: Entity, triggerType: number){
        this.stateMachine = stateMachine
        this.entity = entity
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