import { TransformSystem } from "./modules/transfromSystem";
import { CreateRoom0 } from "./room0";
import { CreateRoom1 } from "./room1";
import { CreateRoom2 } from "./room2";
import { CreateRoom3 } from "./room3";
import { CreateRoom6 } from "./room6";
import { CreateRoom7 } from "./room7";

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


//CreateRoom6()
//CreateRoom7()