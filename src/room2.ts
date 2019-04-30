import { ToggleComponent, ToggleState } from "./modules/toggleComponent";
import { ProximityTriggerSystem, Trigger, TriggerSphereShape } from "./modules/proximityTriggerSystem";
import { MoveTransformComponent } from "./modules/transfromSystem";

export function CreateRoom2() : void{
    //create spikes
    let spikes = new Entity()

    //create gltf shape component and add it to entity
    let spikesShape = new GLTFShape("models/room2/spikes.glb")
    spikes.addComponent(spikesShape)

    //add transform and set position
    spikes.addComponent(new Transform({position: new Vector3(10.1,1.4,8.07), rotation: Quaternion.Euler(0,90,0)}))

    //create animator and add animation clips
    let spikesAnimator = new Animator()
    spikesAnimator.addClip(new AnimationState("Appear", {looping:false}))
    spikesAnimator.addClip(new AnimationState("Disappear", {looping:false}))

    //add AudioSource and clip
    spikes.addComponent(new AudioSource(new AudioClip("sounds/room2/whip.mp3")))

    //add animator component
    spikes.addComponent(spikesAnimator)

    //add toggle for spikes up (on) or down (off)
    spikes.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            //stop previous animation as a workaround to a bug with animations
            spikes.getComponent(Animator).getClip("Disappear").stop()
            //on On play appear animation
            spikes.getComponent(Animator).getClip("Appear").play()
            //play sound
            spikes.getComponent(AudioSource).playOnce()
        }
        else{
            //stop previous animation as a workaround to a bug with animations
            spikes.getComponent(Animator).getClip("Appear").stop()
            //on Off play disappear animation
            spikes.getComponent(Animator).getClip("Disappear").play()
        }
    }))

    //create proximity trigger for spikes
    let spikeTrigger = new Trigger(new TriggerSphereShape(2.5,new Vector3(9,1,9)), null, 1, 1)
    spikeTrigger.onCameraEnter = ()=> {
        spikes.getComponent(ToggleComponent).set(ToggleState.On)
    }
    spikeTrigger.onCameraExit = ()=> {
        spikes.getComponent(ToggleComponent).set(ToggleState.Off)
    }

    //add trigger to trigger system
    ProximityTriggerSystem.instance.addTrigger(spikeTrigger)

    //create the button that we'll use to open the door
    let button = new Entity()

    //add shape component to button
    button.addComponent(new GLTFShape("models/generic/redbutton.gltf"))

    //add transform and set position
    button.addComponent(new Transform({position: new Vector3(7.9,0.2,14.65), rotation: Quaternion.Euler(0,0,-90), scale: new Vector3(0.3,0.3,0.3)}))

    //add audio source to button
    button.addComponent(new AudioSource(new AudioClip("sounds/button.mp3")))

    //listen for click event to toggle spikes state
    button.addComponent(new OnClick(event =>{
        if (spikeTrigger.enable){
            spikeTrigger.enable = false
            spikes.getComponent(ToggleComponent).set(ToggleState.Off)
        }
        button.getComponent(AudioSource).playOnce()
    }))

    //create decorative object to hide button behind it
    let fern = new Entity()

    //add gltf shape component
    fern.addComponent(new GLTFShape("models/room2/fern.glb"))

    //add and set transform
    fern.addComponent(new Transform({position: new Vector3(8.3,0,14.6)}))

    //add audio source to fern
    fern.addComponent(new AudioSource(new AudioClip("sounds/move_object1.mp3")))

    //add toggle component to set two states to the entity: normal or moved
    fern.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            fern.addComponentOrReplace(new MoveTransformComponent(fern.getComponent(Transform).position, 
                fern.getComponent(Transform).position.add(new Vector3(0,0,0.5)), 0.5))

            fern.getComponent(AudioSource).playOnce()
        }
        else{
            fern.addComponentOrReplace(new MoveTransformComponent(fern.getComponent(Transform).position, 
                new Vector3(8.5,0,14.6), 0.5))

            fern.getComponent(AudioSource).playOnce()
        }
    }))

    //add onclick component to listen for click and change geckobush toggle state
    fern.addComponent(new OnClick(event=>{
        fern.getComponent(ToggleComponent).toggle()
    }))

    //create fern picture as a hint for the player
    let fernPicture = new Entity()

    //add shape
    fernPicture.addComponent(new PlaneShape())

    //add transform
    fernPicture.addComponent(new Transform({position: new Vector3(11, 1.5, 8.3), scale: new Vector3(0.7,1,1), rotation: Quaternion.Euler(0,180,0)}))

    //create material, set it up and add it to fern picture
    let fernPictureMat = new Material()
    fernPictureMat.albedoTexture = new Texture("images/room2/fernpicture.png")
    fernPictureMat.hasAlpha = true
    fernPictureMat.transparencyMode = 3
    fernPicture.addComponent(fernPictureMat)

    //add entities to engine
    engine.addEntity(spikes)
    engine.addEntity(button)
    engine.addEntity(fern)
    engine.addEntity(fernPicture)
}