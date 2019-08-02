import utils from "../node_modules/decentraland-ecs-utils/index"

export function CreateRoom6(): void{
    //instance shape for buttons
    let buttonShape = new GLTFShape("models/generic/Round_Button.glb")

    //array to store bulbs
    let lightBulbs: Entity[] = []

    //define lightbulb position
    let lightbulbPositions = [new Vector3(23.408,2.26006,10.3273),new Vector3(23.408,2.22122,11.1682),new Vector3(23.408,2.10693,12.1568),new Vector3(23.408,2.24542,13.1888)]

    //create 4 light bulbs
    for (let i=0; i<lightbulbPositions.length; i++){
        //create button
        let lightBulb = new Entity()

        //add shape
        lightBulb.addComponent(new LightBulbComponent(lightBulb,"models/room6/Puzzle07_LightOn.glb","models/room6/Puzzle07_LightOff.glb"))

        //create and set transform
        lightBulb.addComponent(new Transform({position: lightbulbPositions[i]}))

        //create toggle component
        lightBulb.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
            if (value == utils.ToggleState.On){
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
            lightBulbs[1].getComponent(utils.ToggleComponent).toggle()
            lightBulbs[2].getComponent(utils.ToggleComponent).toggle()
            lightBulbs[3].getComponent(utils.ToggleComponent).toggle()
        },
        ()=>{
            lightBulbs[2].getComponent(utils.ToggleComponent).toggle()
            lightBulbs[3].getComponent(utils.ToggleComponent).toggle()
        },
        ()=>{
            lightBulbs[0].getComponent(utils.ToggleComponent).toggle()
            lightBulbs[3].getComponent(utils.ToggleComponent).toggle()
        },
        ()=>{
            lightBulbs[0].getComponent(utils.ToggleComponent).toggle()
            lightBulbs[2].getComponent(utils.ToggleComponent).toggle()
            lightBulbs[3].getComponent(utils.ToggleComponent).toggle()
        },
    ]

    //can we press the buttons or should we disable them cause the puzzle was solved?
    let areButtonsEnabled = true

    //create audioclip
    let buttonAudioClip = new AudioClip("sounds/button.mp3")
    let chestAudioClip = new AudioClip("sounds/chest.mp3")

    //define buttons' position
    let buttonsPosition = [new Vector3(23.0891,1.58507,10.2526),new Vector3(23.0891,1.48205,11.2557),new Vector3(23.0891,1.38123,12.2855),new Vector3(23.0891,1.52253,13.2941)]

    //create 4 buttons
    for (let i=0; i<buttonsPosition.length; i++){
        //create button
        let button = new Entity()

        //add shape
        button.addComponent(buttonShape)

        //create and set transform
        button.addComponent(new Transform({position: buttonsPosition[i]}))

        //create AudioSource and add clip
        button.addComponent(new AudioSource(buttonAudioClip))

        //add animation to button
        let buttonAnimator = new Animator()
        buttonAnimator.addClip(new AnimationState("Button_Action", {looping:false}))
        button.addComponent(buttonAnimator)

        //add on click component
        button.addComponent(new OnClick(event =>{
            if (areButtonsEnabled){
                buttonInteractions[i]()
                button.getComponent(AudioSource).playOnce()
                buttonAnimator.getClip("Button_Action").stop()
                buttonAnimator.getClip("Button_Action").play()
                if (areAllLightBulbsOn()){
                    areButtonsEnabled = false
                    tvScreen.addComponentOrReplace(tvHintOn)
                }
            }
        }))

        //add button to engine
        engine.addEntity(button)
    }

    //check if all lightbulbs are ON
    let areAllLightBulbsOn = ()=>{
        for (let bulb of lightBulbs){
            if (!bulb.getComponent(utils.ToggleComponent).isOn()){
                return false
            }
        }
        return true
    }


    //load gltf for tv screen
    const tvHintOff = new GLTFShape("models/room6/TVColor.glb")
    const tvHintOn = new GLTFShape("models/room6/TVOrange.glb")

    //create tv screen that contain muna's statue question hint
    const tvScreen = new Entity()
    tvScreen.addComponent(tvHintOff)
    tvScreen.addComponent(new Transform({position: new Vector3(26.91,0,10.44)}))
    engine.addEntity(tvScreen)


    //create door entity
    let door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/room6/Puzzle07_Door.glb"))

    //add transform and set position
    door.addComponent(new Transform({position:new Vector3(26.3087,0,14.9449), rotation: Quaternion.Euler(0,-10.2,0)}))

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