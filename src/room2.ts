import utils from "../node_modules/decentraland-ecs-utils/index"

export function CreateRoom2() : void{
    //create spikes
    let spikes = new Entity()

    //create gltf shape component and add it to entity
    let spikesShape = new GLTFShape("models/room2/Puzzle03_Door.glb")
    spikes.addComponent(spikesShape)

    //add transform and set position
    spikes.addComponent(new Transform({position: new Vector3(24.1166,7.17,15.78)}))

    //create animator and add animation clips
    let spikesAnimator = new Animator()
    spikesAnimator.addClip(new AnimationState("Door_Close", {looping:false}))
    spikesAnimator.addClip(new AnimationState("Door_Open", {looping:false}))

    //add AudioSource and clip
    spikes.addComponent(new AudioSource(new AudioClip("sounds/room2/whip.mp3")))

    //add animator component
    spikes.addComponent(spikesAnimator)

    //add toggle for spikes up (on) or down (off)
    spikes.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
        if (value == utils.ToggleState.On){
            //stop previous animation as a workaround to a bug with animations
            spikes.getComponent(Animator).getClip("Door_Open").stop()
            //on On play appear animation
            spikes.getComponent(Animator).getClip("Door_Close").play()
            //play sound
            spikes.getComponent(AudioSource).playOnce()
        }
        else{
            //stop previous animation as a workaround to a bug with animations
            spikes.getComponent(Animator).getClip("Door_Close").stop()
            //on Off play disappear animation
            spikes.getComponent(Animator).getClip("Door_Open").play()
        }
    }))

    //create proximity trigger for spikes
    let spikeTriggerEntity = new Entity()
    spikeTriggerEntity.addComponent(new Transform({position: new Vector3(25.5,7.17,19.5)}))
    spikeTriggerEntity.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(4.2,3,8),Vector3.Zero()), 0, 0, null, null, 
    ()=>{
        spikes.getComponent(utils.ToggleComponent).set(utils.ToggleState.On)
    },
    ()=>{
        spikes.getComponent(utils.ToggleComponent).set(utils.ToggleState.Off)
    }))

    //create the button that we'll use to open the door
    let button = new Entity()

    //add shape component to button
    button.addComponent(new GLTFShape("models/generic/Round_Button.glb"))

    //add transform and set position
    button.addComponent(new Transform({position: new Vector3(22.4456,5.92706,24.18)}))

    //add audio source to button
    button.addComponent(new AudioSource(new AudioClip("sounds/button.mp3")))

    //add animation to button
    let buttonAnimator = new Animator()
    buttonAnimator.addClip(new AnimationState("Button_Action", {looping:false}))
    button.addComponent(buttonAnimator)

    //listen for click event to toggle spikes state
    button.addComponent(new OnClick(event =>{
        if (spikeTriggerEntity.getComponent(utils.TriggerComponent).enabled){
            spikeTriggerEntity.getComponent(utils.TriggerComponent).enabled = false
            spikes.getComponent(utils.ToggleComponent).set(utils.ToggleState.Off)
        }
        button.getComponent(AudioSource).playOnce()
        buttonAnimator.getClip("Button_Action").play()
    }))

    //ferns move sound
    let fernMoveAudioClip = new AudioClip("sounds/move_object1.mp3") 

    //create decorative objects to hide button behind it
    let fern = new Entity()
    let fern2 = new Entity()
    let fern3 = new Entity()
    let fern4 = new Entity()

    //add gltf shape component
    fern.addComponent(new GLTFShape("models/room2/Puzzle03_Plant1.glb"))
    fern2.addComponent(new GLTFShape("models/room2/Puzzle03_Plant2.glb"))
    fern3.addComponent(new GLTFShape("models/room2/Puzzle03_Plant3.glb"))
    fern4.addComponent(new GLTFShape("models/room2/Puzzle03_Plant4.glb"))

    //add and set transform
    fern.addComponent(new Transform({position: new Vector3(23.2489,5.5071,23.813)}))
    fern2.addComponent(new Transform({position: new Vector3(26.9356,5.52006,23.4817)}))
    fern3.addComponent(new Transform({position: new Vector3(23.4513,5.50571,16.8218)}))
    fern4.addComponent(new Transform({position: new Vector3(26.9878,5.51511,16.8279)}))

    //add audio source to fern
    fern.addComponent(new AudioSource(fernMoveAudioClip))
    fern2.addComponent(new AudioSource(fernMoveAudioClip))
    fern3.addComponent(new AudioSource(fernMoveAudioClip))
    fern4.addComponent(new AudioSource(fernMoveAudioClip))

    //add toggle component to set two states to the entity: normal or moved
    fern.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
        if (value == utils.ToggleState.On){
            fern.addComponentOrReplace(new utils.MoveTransformComponent(fern.getComponent(Transform).position, 
                fern.getComponent(Transform).position.add(new Vector3(0,0,-0.5)), 0.5))

            fern.getComponent(AudioSource).playOnce()
        }
        else{
            fern.addComponentOrReplace(new utils.MoveTransformComponent(fern.getComponent(Transform).position, 
                new Vector3(23.2489,5.5071,23.813), 0.5))

            fern.getComponent(AudioSource).playOnce()
        }
    }))
    fern2.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
        if (value == utils.ToggleState.On){
            fern2.addComponentOrReplace(new utils.MoveTransformComponent(fern2.getComponent(Transform).position, 
                fern2.getComponent(Transform).position.add(new Vector3(0,0,-0.5)), 0.5))

            fern2.getComponent(AudioSource).playOnce()
        }
        else{
            fern2.addComponentOrReplace(new utils.MoveTransformComponent(fern2.getComponent(Transform).position, 
                new Vector3(26.9356,5.52006,23.4817), 0.5))

            fern2.getComponent(AudioSource).playOnce()
        }
    }))
    fern3.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
        if (value == utils.ToggleState.On){
            fern3.addComponentOrReplace(new utils.MoveTransformComponent(fern3.getComponent(Transform).position, 
                fern3.getComponent(Transform).position.add(new Vector3(0,0,0.5)), 0.5))

            fern3.getComponent(AudioSource).playOnce()
        }
        else{
            fern3.addComponentOrReplace(new utils.MoveTransformComponent(fern3.getComponent(Transform).position, 
                new Vector3(23.4513,5.50571,16.8218), 0.5))

            fern3.getComponent(AudioSource).playOnce()
        }
    }))
    fern4.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value =>{
        if (value == utils.ToggleState.On){
            fern4.addComponentOrReplace(new utils.MoveTransformComponent(fern4.getComponent(Transform).position, 
                fern4.getComponent(Transform).position.add(new Vector3(0,0,0.5)), 0.5))

            fern4.getComponent(AudioSource).playOnce()
        }
        else{
            fern4.addComponentOrReplace(new utils.MoveTransformComponent(fern4.getComponent(Transform).position, 
                new Vector3(26.9878,5.51511,16.8279), 0.5))

            fern4.getComponent(AudioSource).playOnce()
        }
    }))

    //add onclick component to listen for click and change geckobush toggle state
    fern.addComponent(new OnClick(event=>{
        fern.getComponent(utils.ToggleComponent).toggle()
    }))
    fern2.addComponent(new OnClick(event=>{
        fern2.getComponent(utils.ToggleComponent).toggle()
    }))
    fern3.addComponent(new OnClick(event=>{
        fern3.getComponent(utils.ToggleComponent).toggle()
    }))
    fern4.addComponent(new OnClick(event=>{
        fern4.getComponent(utils.ToggleComponent).toggle()
    }))

    //add entities to engine
    engine.addEntity(spikes)
    engine.addEntity(button)
    engine.addEntity(fern)
    engine.addEntity(fern2)
    engine.addEntity(fern3)
    engine.addEntity(fern4)
    engine.addEntity(spikeTriggerEntity)
}