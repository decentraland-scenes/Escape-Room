import utils from "../node_modules/decentraland-ecs-utils/index"

export function CreateRoom7(): void{
    //variable to store how many tiles does the player paint
    let tilesPaintedByPlayer = 0

    //create tile's shape
    const tileShape = new PlaneShape()
    tileShape.withCollisions = false

    //create tile's materials
    const miceMaterial = new Material()
    miceMaterial.albedoColor = Color3.Magenta()

    const playerMaterial = new Material()
    playerMaterial.albedoColor = Color3.Green()

    const defaultMaterial = new Material()
    defaultMaterial.albedoColor = Color3.Teal()

    //create mouse shape
    let mouseShape = new GLTFShape("models/room7/Mouse.glb")

    //create maice entities
    let mouse1 = new Entity()
    let mouse2 = new Entity()

    //add transfrom add shape to maice
    mouse1.addComponent(new Transform({position: new Vector3(25.82, 1.46, 4.25), scale: new Vector3(0.8,0.8,0.8)}))
    mouse1.addComponent(mouseShape)
    mouse2.addComponent(new Transform({position: new Vector3(26.54, 0.85, 3.9), scale: new Vector3(0.8,0.8,0.8)}))
    mouse2.addComponent(mouseShape)

    //add animator
    const mouseAnimator = new Animator()
    const mouseAnimationClip = new AnimationState("Mouse_Action")
    mouseAnimator.addClip(mouseAnimationClip)
    mouse1.addComponent(mouseAnimator)
    mouse2.addComponent(mouseAnimator)
    mouseAnimationClip.play()

    //add maice entities to engine
    engine.addEntity(mouse1)
    engine.addEntity(mouse2)

    //create callback for when maice change idle state
    let onMouseIdleChanged = (): boolean=>{
        //check if player has painted all tiles
        if (tilesPaintedByPlayer == (columnCount * rowCount)){
            //remove mouse's behavior component and system cause we just finished the puzzle
            mouse1.removeComponent(MouseFollowPathComponent)
            mouse2.removeComponent(MouseFollowPathComponent)
            engine.removeSystem(mouseBehaviorSystem)
            //show ticket
            ticketAnimator.getClip("Ticket_Action").play()
            //we tell mouse that it can't change it's idle state
            return false
        }
        //tell mouse that it can change it's idle state
        return true
    }

    //set/add component for mouse behavior
    mouse1.addComponent(new MouseFollowPathComponent(7.5, 7, [new Vector3(17.37, 1.69, 10.06),new Vector3(16.7, 1.7, 11.47),new Vector3(16.3, 2.24, 11.28)], 2, onMouseIdleChanged)) 
    mouse2.addComponent(new MouseFollowPathComponent(0, 6, [new Vector3(17.49, 0.6, 11.85),new Vector3(16.7, 1.7, 11.47),new Vector3(16.36, 1.7, 12.17)], 5, onMouseIdleChanged))

    //add mouse behavior system to engine
    let mouseBehaviorSystem = new MouseFollowPathSystem()
    engine.addSystem(mouseBehaviorSystem)

    //add trigger for mouse
    mouse1.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.05,0.05,0.05), Vector3.Zero()), 2, 2))
    mouse2.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.05,0.05,0.05), Vector3.Zero()), 2, 2))

    //set tiles grid
    const tileSize = new Vector3(0.30,0.30,1)
    const columnCount = 5
    const rowCount = 5
    const tileSpacing = new Vector3(0.09,0.05,0)
    const initialPosition = new Vector3(17.7913,0.871266,10.6956)
    const screenRotation = Quaternion.Euler(118,-45,127.3)
    
    //create grid
    for (let column = 0; column < columnCount; column++){
        for (let row = 0; row < rowCount; row++){
            //calc tile position
            let tilePos = new Vector3()
            tilePos.x = column * (tileSize.x + tileSpacing.x)
            tilePos.y = row * (tileSize.y + tileSpacing.y)
            tilePos.z = 0
    
            tilePos = initialPosition.add(tilePos.rotate(screenRotation))

            //create tile entity
            let tileEntity = new Entity()
            //add and set transform
            tileEntity.addComponent(new Transform({position: tilePos, scale: tileSize, rotation: screenRotation}))
            //add shape
            tileEntity.addComponent(tileShape)
            //add material
            tileEntity.addComponent(defaultMaterial)
            //listen for click
            tileEntity.addComponent(new OnClick(event=>{
                //check if the tile wasn't already painted by player
                if (tileEntity.getComponent(Material) != playerMaterial){
                    //increase tiles painted variable
                    tilesPaintedByPlayer ++
                    //change tile material
                    tileEntity.addComponentOrReplace(playerMaterial)
                }
            }))
            //add tile to engine
            engine.addEntity(tileEntity)
            //add tile trigger
            tileEntity.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(0.15,0.15,0.15), Vector3.Zero()), 2, 2, 
                (entityEnter)=>{
                    if (entityEnter.hasComponent(MouseFollowPathComponent)){
                        //check if the tile was painted by player
                        if (tileEntity.getComponent(Material) == playerMaterial){
                            //decrease tiles painted variable
                            tilesPaintedByPlayer --
                        }
                        tileEntity.addComponentOrReplace(miceMaterial)
                    }
                })
            )
        }
    }

    //create hint for muna's question (ticket)
    const ticket = new Entity()
    ticket.addComponent(new GLTFShape("models/room7/Ticket.glb"))
    ticket.addComponent(new Transform({position: new Vector3(18.1903,0.397274,11.771), rotation: Quaternion.Euler(0,63.6,0)}))

    //animator for ticket
    const ticketAnimator = new Animator()
    ticketAnimator.addClip(new AnimationState("Ticket_Action",{looping:false}))
    ticket.addComponent(ticketAnimator)

    //add ticket to engine
    engine.addEntity(ticket)

    //create door entity
    let door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/room7/Puzzle08_Door.glb"))

    //add transform and set position
    door.addComponent(new Transform({position:new Vector3(22.612,0,14.9205), rotation: Quaternion.Euler(0,135,0)}))

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

@Component("mouseFollowPathComponent")
class MouseFollowPathComponent {
    private idleTime: number
    private path: Vector3[]
    private movingTime: number

    private reversePath: boolean
    private currentTime: number
    private isInIdleTime: boolean
    private startDelay: number

    private onIdleChanged: ()=>boolean

    constructor(startDelay: number, idleTime: number, path: Vector3[], movingTime: number, onIdleChanged: ()=>boolean){
        this.idleTime = idleTime
        this.path = path
        this.reversePath = false
        this.currentTime = idleTime
        this.isInIdleTime = true
        this.movingTime = movingTime
        this.onIdleChanged = onIdleChanged
        this.startDelay = startDelay
    }

    update(dt: number, mouseEntiy: IEntity){
        //check if waiting for start
        if (this.startDelay > 0){
            this.startDelay -= dt
        }
        //when mouse is idle
        else if (this.isInIdleTime){
            //increase time in idle state
            this.currentTime += dt
            //when idle time is reached and can change idle state
            if (this.currentTime >= this.idleTime && this.onIdleChanged()){
                //we are not in idle state any more
                this.isInIdleTime = false

                let path: Vector3[]
                //check if we shoul reverse the path
                if (this.reversePath){
                    path = this.path.reverse()
                }
                else{
                    path = this.path
                }
                //rotate mouse to look at it's next point in path
                mouseEntiy.getComponent(Transform).lookAt(path[1])
                //add component to follow the path
                mouseEntiy.addComponentOrReplace(new utils.FollowPathComponent(path, this.movingTime, 
                    ()=>{
                        //when path is finished we reset mouse variables
                        this.isInIdleTime = true
                        this.currentTime = 0
                        //we set the mouse to go the other way arround next time
                        this.reversePath = true
                        //callback that idle state is going to change
                        this.onIdleChanged()
                    }, 
                    (currentPoint, nextPoint)=>{
                        //when we reach a new point in path we rotate the mouse to look at the next point
                        mouseEntiy.getComponent(Transform).lookAt(nextPoint)
                    }
                ))
            }
        }
    }
}

class MouseFollowPathSystem implements ISystem{
    update(dt: number){
        let mouseGroup = engine.getComponentGroup(MouseFollowPathComponent)
        for (let mouseEntity of mouseGroup.entities){
            mouseEntity.getComponent(MouseFollowPathComponent).update(dt, mouseEntity)
        }
    }
}