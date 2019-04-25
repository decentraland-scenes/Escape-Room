import { CreateRoom0, CreateRoom1, CreateRoom2, CreateRoom3 } from "./rooms";
import { TransformSystem } from "./modules/transfromSystem";

const scene = new Entity()
scene.addComponent(new GLTFShape("models/scene.glb"))
scene.addComponent(new Transform({rotation: Quaternion.Euler(0,180,0)}))
engine.addEntity(scene)

const transformSystem = new TransformSystem()
engine.addSystem(transformSystem)

CreateRoom0()
CreateRoom1()
CreateRoom2()
CreateRoom3()