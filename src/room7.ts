import { Trigger, TriggerBoxShape, ProximityTriggerSystem } from "./modules/proximityTriggerSystem";
import { FollowPathComponent } from "./modules/transfromSystem";

export function CreateRoom7(): void{
    //variable to store how many tiles does the player paint
    let tilesPaintedByPlayer = 0

    //create tile's shape
    const tileShape = new PlaneShape()
    tileShape.withCollisions = false

    //create tile's materials
    const miceMaterial = new Material()
    miceMaterial.albedoColor = Color3.Red()

    const playerMaterial = new Material()
    playerMaterial.albedoColor = Color3.Teal()

    const defaultMaterial = new Material()
    defaultMaterial.albedoColor = Color3.Blue()

    //create mouse shape
    let mouseShape = new GLTFShape("models/room7/mouse.glb")

    //create maice entities
    let mouse1 = new Entity()
    let mouse2 = new Entity()

    //add transfrom add shape to maice
    mouse1.addComponent(new Transform({position: new Vector3(25.82, 1.46, 4.25), scale: new Vector3(0.3,0.3,0.3)}))
    mouse1.addComponent(mouseShape)
    mouse2.addComponent(new Transform({position: new Vector3(26.54, 0.85, 3.9), scale: new Vector3(0.3,0.3,0.3)}))
    mouse2.addComponent(mouseShape)

    //add maice entities to engine
    engine.addEntity(mouse1)
    engine.addEntity(mouse2)

    //create callback for when maice change idle state
    let onMouseIdleChanged = (): boolean=>{
        //check if player has painted all tiles
        if (tilesPaintedByPlayer == (columnCount * rowCount)){
            //remove maice's behavior component and system cause we just finished the puzzle
            mouse1.removeComponent(MouseFollowPathComponent)
            mouse2.removeComponent(MouseFollowPathComponent)
            engine.removeSystem(maiceBehaviorSystem)
            //we tell mouse that it can't change it's idle state
            return false
        }
        //tell mouse that it can change it's idle state
        return true
    }

    //set/add component for maice behavior
    mouse1.addComponent(new MouseFollowPathComponent(7.5, 7, [new Vector3(25.82, 1.46, 4.25),new Vector3(26.54, 1.46, 4.25),new Vector3(26.54, 1.77, 4.43)], 2, onMouseIdleChanged)) 
    mouse2.addComponent(new MouseFollowPathComponent(0, 6, [new Vector3(26.54, 0.85, 3.9),new Vector3(26.54, 1.46, 4.25),new Vector3(26.9, 1.46, 4.25)], 5, onMouseIdleChanged))

    //add maice behavior system to engine
    let maiceBehaviorSystem = new MouseFollowPathSystem()
    engine.addSystem(maiceBehaviorSystem)

    //create trigger for maince
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(new Vector3(0.05,0.05,0.05), Vector3.Zero()), mouse1, 2, 2))
    ProximityTriggerSystem.instance.addTrigger(new Trigger(new TriggerBoxShape(new Vector3(0.05,0.05,0.05), Vector3.Zero()), mouse2, 2, 2))

    //set tiles grid
    const tileSize = new Vector3(0.15,0.15,1)
    const columnCount = 5
    const rowCount = 5
    const tileSpacing = 0.03
    const initialPosition = new Vector3(26,1,4)
    const tileDirection = new Vector3(1,0.86,0.49)
    
    //create grid
    for (let column = 0; column < columnCount; column++){
        for (let row = 0; row < rowCount; row++){
            //calc tile position
            let tilePos = new Vector3()
            tilePos.x = initialPosition.x + column * tileDirection.x * (tileSize.x + tileSpacing)
            tilePos.y = initialPosition.y + row * tileDirection.y * (tileSize.y + tileSpacing)
            tilePos.z = initialPosition.z + row * tileDirection.z * (tileSize.y + tileSpacing)
            //create tile entity
            let tileEntity = new Entity()
            //add and set transform
            tileEntity.addComponent(new Transform({position: tilePos, scale: tileSize, rotation: Quaternion.Euler(30,0,0)}))
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
            //create tile trigger
            let tileTrigger = new Trigger(new TriggerBoxShape(new Vector3(0.15,0.15,0.15), new Vector3(0,0,0)), tileEntity, 2, 2)
            //set trigger callbacks
            tileTrigger.onTriggerEnter = (trigger)=>{
                if (trigger.parent != null && trigger.parent.hasComponent(MouseFollowPathComponent)){
                    //check if the tile was painted by player
                    if (tileEntity.getComponent(Material) == playerMaterial){
                        //decrease tiles painted variable
                        tilesPaintedByPlayer --
                    }
                    tileEntity.addComponentOrReplace(miceMaterial)
                }
            }
            //add trigger to system
            ProximityTriggerSystem.instance.addTrigger(tileTrigger)
        }
    }
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

    update(dt: number, mouseEntiy: Entity){
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
                mouseEntiy.addComponentOrReplace(new FollowPathComponent(path, this.movingTime, 
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