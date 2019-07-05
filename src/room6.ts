import { ToggleComponent } from "./modules/toggleComponent";
import { RotateTransformComponent } from "./modules/transfromSystem";

export function CreateRoom6(): void{
    //create base for light bulbs
    let bulbsBase = new Entity()
    
    //add shape to bulbsBase
    bulbsBase.addComponent(new BoxShape())

    //add and set transform
    bulbsBase.addComponent(new Transform({position: new Vector3(18,0,2), scale: new Vector3(4,1,1)}))

    //add bulbsBase to engine
    engine.addEntity(bulbsBase)

    //instance shape for buttons
    let buttonShape = new GLTFShape("models/generic/redbutton.gltf")

    //instance shapes for light bulbs
    const bulbOnShape = new GLTFShape("models/room6/bulb_on.glb")
    const bulbOffShape = new GLTFShape("models/room6/bulb_off.glb")

    //array to store bulbs
    let lightBulbs: Entity[] = []

    //create 4 light bulbs
    for (let i=0; i<4; i++){
        //create button
        let lightBulb = new Entity()

        //add shape
        lightBulb.addComponent(new LightBulbComponent(lightBulb,"models/room6/bulb_on.glb","models/room6/bulb_off.glb"))

        //create and set transform
        lightBulb.addComponent(new Transform({position: new Vector3(18 -1.5 + 1 * i, 1, 2)}))

        //create toggle component
        lightBulb.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
            if (value == ToggleComponent.State.On){
                lightBulb.getComponent(LightBulbComponent).setON()
            }
            else{
                lightBulb.getComponent(LightBulbComponent).setOFF()
            }
        }))

        //add lightbulb to engine
        engine.addEntity(lightBulb)

        //add it to array
        lightBulbs.push(lightBulb)
    }

    //create array of button intereaction
    let buttonInteractions = [
        ()=>{
            lightBulbs[1].getComponent(ToggleComponent).toggle()
            lightBulbs[2].getComponent(ToggleComponent).toggle()
            lightBulbs[3].getComponent(ToggleComponent).toggle()
        },
        ()=>{
            lightBulbs[2].getComponent(ToggleComponent).toggle()
            lightBulbs[3].getComponent(ToggleComponent).toggle()
        },
        ()=>{
            lightBulbs[0].getComponent(ToggleComponent).toggle()
            lightBulbs[3].getComponent(ToggleComponent).toggle()
        },
        ()=>{
            lightBulbs[0].getComponent(ToggleComponent).toggle()
            lightBulbs[2].getComponent(ToggleComponent).toggle()
            lightBulbs[3].getComponent(ToggleComponent).toggle()
        },
    ]

    //can we press the buttons or should we disable them cause the puzzle was solved?
    let areButtonsEnabled = true

    //create audioclip
    let buttonAudioClip = new AudioClip("sounds/button.mp3")
    let chestAudioClip = new AudioClip("sounds/chest.mp3")

    //create 4 buttons
    for (let i=0; i<4; i++){
        //create button
        let button = new Entity()

        //add shape
        button.addComponent(buttonShape)

        //create and set transform
        button.addComponent(new Transform({position: new Vector3(18 -1.5 + 1 * i, 0.2, 1.5), rotation: Quaternion.Euler(-90,90,0), scale: new Vector3(0.3,0.3,0.3)}))

        //create AudioSource and add clip
        button.addComponent(new AudioSource(buttonAudioClip))

        //add on click component
        button.addComponent(new OnClick(event =>{
            if (areButtonsEnabled){
                buttonInteractions[i]()
                button.getComponent(AudioSource).playOnce()
                if (areAllLightBulbsOn()){
                    areButtonsEnabled = false
                    chestTop.addComponent(new RotateTransformComponent(Quaternion.Euler(0,180,0),Quaternion.Euler(90,180,0),0.5))
                    chestTop.addComponent(new AudioSource(chestAudioClip))
                    chestTop.getComponent(AudioSource).playOnce()
                }
            }
        }))

        //add button to engine
        engine.addEntity(button)
    }

    //check if all lightbulbs are ON
    let areAllLightBulbsOn = ()=>{
        for (let bulb of lightBulbs){
            if (!bulb.getComponent(ToggleComponent).isOn()){
                return false
            }
        }
        return true
    }


    //create chest that contain muna's statue question hint
    const chest = new Entity()
    chest.addComponent(new GLTFShape("models/generic/chestBase.glb"))
    chest.addComponent(new Transform({position: new Vector3(21,0,2)}))
    engine.addEntity(chest)

    //create chest top
    const chestTop = new Entity()
    chestTop.addComponent(new GLTFShape("models/generic/chestTop.glb"))
    chestTop.addComponent(new Transform({position: new Vector3(0,0.36,0.32), rotation: Quaternion.Euler(0,180,0)}))
    chestTop.setParent(chest)

    //create hint for muna's question
    const hint = new Entity()
    const hintMaterial = new Material()
    hintMaterial.albedoTexture = new Texture("images/room6/vampire_cover.png",{hasAlpha: true})
    hintMaterial.hasAlpha = true
    hint.addComponent(new PlaneShape())
    hint.addComponent(hintMaterial)
    hint.addComponent(new Transform({position: new Vector3(0,0.4,0), rotation: Quaternion.Euler(90,0,90), scale: new Vector3(0.6,0.6,0.6)}))
    hint.setParent(chest)
}

@Component("lightBulbComponent")
class LightBulbComponent{
    private _lightBublGltfOn: GLTFShape
    private _lightBublGltfOff: GLTFShape

    constructor(lightbulbEntity: IEntity, lightOnGltfPath: string, lightOffGltfPath: string){
        let lightBublEntityOn = new Entity()
        this._lightBublGltfOn = new GLTFShape(lightOnGltfPath)

        lightBublEntityOn.addComponent(this._lightBublGltfOn)
        lightBublEntityOn.setParent(lightbulbEntity)

        let lightBublEntityOff = new Entity()
        this._lightBublGltfOff = new GLTFShape(lightOffGltfPath)

        lightBublEntityOff.addComponent(this._lightBublGltfOff)
        lightBublEntityOff.setParent(lightbulbEntity)

        this.setOFF()
    }

    setON(){
        this._lightBublGltfOff.visible = false
        this._lightBublGltfOn.visible = true
    }

    setOFF(){
        this._lightBublGltfOff.visible = true
        this._lightBublGltfOn.visible = false
    }
}