import { ToggleComponent } from "./modules/toggleComponent";

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
        lightBulb.addComponent(bulbOffShape)

        //create and set transform
        lightBulb.addComponent(new Transform({position: new Vector3(18 -1.5 + 1 * i, 1, 2)}))

        //create toggle component
        lightBulb.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
            if (value == ToggleComponent.ToggleState.On){
                lightBulb.addComponentOrReplace(bulbOnShape)
            }
            else{
                lightBulb.addComponentOrReplace(bulbOffShape)
            }
        }))

        //add button to engine
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
    let areButtonsEnable = true

    //create audioclip
    let buttonAudioClip = new AudioClip("sounds/button.mp3")

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
            if (areButtonsEnable){
                buttonInteractions[i]()
                button.getComponent(AudioSource).playOnce()
                if (areAllLightBulbsOn()){
                    areButtonsEnable = false
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
}