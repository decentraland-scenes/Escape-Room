import { Trigger, TriggerBoxShape, ProximityTriggerSystem } from "./modules/proximityTriggerSystem";
import { FollowPathComponent } from "./modules/transfromSystem";

export function CreateRoom7(): void{

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

    //set tiles grid
    const tileSize = new Vector3(1,1,1)
    const columnCount = 5
    const rowCount = 5
    const tileSpacing = 0.03
    const initialPosition = new Vector3(18,0,1)

    //create grid
    for (let column = 0; column < columnCount; column++){
        for (let row = 0; row < rowCount; row++){
            //calc tile position
            let tilePos = new Vector3(initialPosition.x + column * (tileSize.x + tileSpacing), 0, initialPosition.z + row * (tileSize.z + tileSpacing))
            //create tile entity
            let tileEntity = new Entity()
            //add and set transform
            tileEntity.addComponent(new Transform({position: tilePos, scale: tileSize, rotation: Quaternion.Euler(90,0,0)}))
            //add shape
            tileEntity.addComponent(tileShape)
            //add material
            tileEntity.addComponent(defaultMaterial)
            //add tile to engine
            engine.addEntity(tileEntity)
            //create tile trigger
            let tileTrigger = new Trigger(new TriggerBoxShape(new Vector3(0.5,0.5,0.5), new Vector3(0,0.25,0)), tileEntity, 2, 2)
            //set callbacks
            tileTrigger.onCameraEnter = ()=>{
                tileEntity.addComponentOrReplace(playerMaterial)
            }
            tileTrigger.onTriggerEnter = (trigger)=>{
                if (trigger.parent != null && trigger.parent.hasComponent(MouseFollowPathComponent)){
                    tileEntity.addComponentOrReplace(miceMaterial)
                }
            }
            //add trigger to system
            ProximityTriggerSystem.instance.addTrigger(tileTrigger)
        }
    }

    let mouse = new Entity()
    mouse.addComponent(new Transform({scale: new Vector3(0.5,1,0.5), position: new Vector3(18,0,1)}))
    mouse.addComponent(new GLTFShape("models/room7/mouse.glb"))
    mouse.addComponent(new MouseFollowPathComponent(3, [new Vector3(18,0,1),new Vector3(19,0,2),new Vector3(19,0,3),new Vector3(18,0,1)], 5))
    engine.addEntity(mouse)

    let mouseTrigger = new Trigger(new TriggerBoxShape(new Vector3(0.5,0.5,0.5), Vector3.Zero()), mouse, 2, 2)
    ProximityTriggerSystem.instance.addTrigger(mouseTrigger)

    let mouseSystem = new MouseFollowPathSystem()
    engine.addSystem(mouseSystem)
}

@Component("mouseFollowPathComponent")
class MouseFollowPathComponent {
    private idleTime: number
    private path: Vector3[]
    private movingTime: number

    private reversePath: boolean
    private currentTime: number
    private isIdle: boolean

    constructor(idleTime: number, path: Vector3[], movingTime: number){
        this.idleTime = idleTime
        this.path = path
        this.reversePath = false
        this.currentTime = 0
        this.isIdle = true
        this.movingTime = movingTime
    }

    update(dt: number, mouseEntiy: Entity){
        //when mouse is idle
        if (this.isIdle){
            //increase time in idle state
            this.currentTime += dt
            //when idle time is reached
            if (this.currentTime >= this.idleTime){
                //we are not in idle state any more
                this.isIdle = false

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
                mouseEntiy.addComponent(new FollowPathComponent(path, this.movingTime, 
                    ()=>{
                        //when path is finished we reset mouse variables
                        this.isIdle = true
                        this.currentTime = 0
                        //we set the mouse to go the other way arround next time
                        this.reversePath = !this.reversePath
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