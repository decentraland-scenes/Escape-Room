export function CreateRoom0() : void{
    //variable to store if door is open
    let isDoorOpen = false

    //create door entity
    let door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/room0/door.glb"))

    //add transform and set it in position
    door.addComponent(new Transform({position: new Vector3(23.01,10.8,24.6), rotation: Quaternion.Euler(0,180,0)}))

    //create animator and add animation clips
    let doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationState("Door_Open", {looping:false}))
    door.addComponent(doorAnimator)

    //create audio source component, set audio clip and add it to door entity
    door.addComponent(new AudioSource(new AudioClip("sounds/door_squeak.mp3")))

    //liste ton onclick event to toggle door state
    door.addComponent(new OnClick(event =>{
        if (!isDoorOpen){
            isDoorOpen = true
            doorAnimator.getClip("Door_Open").play()
            door.getComponent(AudioSource).playOnce()
        }
    }))

    //add door entity to engine
    engine.addEntity(door)
}