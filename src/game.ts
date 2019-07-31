import { CreateRoom0 } from "./room0";
import { CreateRoom1 } from "./room1";
import { CreateRoom2 } from "./room2";
import { CreateRoom3 } from "./room3";
import { CreateRoom4 } from "./room4";
import { CreateRoom5 } from "./room5";
import { CreateRoom6 } from "./room6";
import { CreateRoom7 } from "./room7";
import { CreateRoom8 } from "./room8";

const gameCanvas = new UICanvas()

const scene = new Entity()
scene.addComponent(new GLTFShape("models/scene.glb"))
engine.addEntity(scene)

CreateRoom0()
CreateRoom1()
CreateRoom2()
CreateRoom3()
CreateRoom4(gameCanvas)
CreateRoom5(gameCanvas)
CreateRoom6()
CreateRoom7()
CreateRoom8()
