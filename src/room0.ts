export function CreateRoom0() : void{
    //create door entity
    let door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/generic/door.glb"))

    //add transform and set it in position
    door.addComponent(new Transform({position: new Vector3(6.58,0,7.85)}))

    //create animator and add animation clips
    let doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationState("Open", {looping:false}))
    door.addComponent(doorAnimator)

    //create audio source component, set audio clip and add it to door entity
    door.addComponent(new AudioSource(new AudioClip("sounds/door_squeak.mp3")))

    //liste ton onclick event to toggle door state
    door.addComponent(new OnClick(event =>{
        doorAnimator.getClip("Open").play()
        door.getComponent(AudioSource).playOnce()
    }))

    //add door entity to engine
    engine.addEntity(door)
}