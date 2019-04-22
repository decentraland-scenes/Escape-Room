import { CreateRoom0, CreateRoom1, CreateRoom2, CreateRoom3 } from "./rooms";

const scene = new Entity()
scene.addComponent(new GLTFShape("models/scene.glb"))
scene.addComponent(new Transform({rotation: Quaternion.Euler(0,180,0)}))
engine.addEntity(scene)

CreateRoom0()
CreateRoom1()
CreateRoom2()
CreateRoom3()