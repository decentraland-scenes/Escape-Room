import { ToggleComponent, ToggleState } from "./modules/toggleComponent";
import { TimerSystem, Timer } from "./modules/timerSystem";
import { ITriggerConfig, ProximityTriggerSystem } from "./modules/proximityTriggerSystem";
import { MoveTransformComponent, RotateTransformComponent } from "./modules/transfromSystem";

export function CreateRoom0() : void{
    //create door entity
    let door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/generic/door.glb"))

    //add transform and set it in position
    door.addComponent(new Transform({position: new Vector3(6.58,0,7.85)}))

    //create animator and add animation clips
    let doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationClip("Open"))
    doorAnimator.addClip(new AnimationClip("Close"))
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

export function CreateRoom1() : void{
    //create a timer that will keep the door open for X amount of seconds
    let countdownTimer = new Timer(5)

    //function to convert seconds left in timer to a formatted string
    let formatTimeString = (seconds: number) =>{
        let mins = Math.floor(countdownTimer.getTimeLeft() / 60)
        let secs = Math.floor(countdownTimer.getTimeLeft() % 60)
        return mins.toLocaleString(undefined, {minimumIntegerDigits: 2}) + ":" + secs.toLocaleString(undefined, {minimumIntegerDigits: 2})     
    }

    //create door entity
    let door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/generic/door.glb"))

    //add transform and set positoin
    door.addComponent(new Transform({position:new Vector3(8,0,11.74), rotation: Quaternion.Euler(0,90,0)}))

    //creat animator and add animation clips
    let doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationClip("Open"))
    doorAnimator.addClip(new AnimationClip("Close"))
    door.addComponent(doorAnimator)

    //create audio source component, set audio clip and add it to door entity
    let doorAudioSource = new AudioSource(new AudioClip("sounds/door_squeak.mp3"))
    door.addComponent(doorAudioSource)

    //create the button that we'll use to open the door
    let button = new Entity()

    //add shape component to button
    button.addComponent(new GLTFShape("models/generic/redbutton.gltf"))

    //add transform and set position
    button.addComponent(new Transform({position: new Vector3(1.91,1.1,12.12), scale: new Vector3(0.3,0.3,0.3)}))

    //add audio source to button
    button.addComponent(new AudioSource(new AudioClip("sounds/button.mp3")))

    //create countdown displayer
    let countdown = new Entity()

    //add transform and set position
    countdown.addComponent(new Transform({position: new Vector3(7.7,3.5,12.5), rotation: Quaternion.Euler(0,90,0) }))

    //create text shape for countdown
    let countdownTextShape = new TextShape(formatTimeString(countdownTimer.getTimeLeft()))
    countdownTextShape.color = Color3.Red()
    countdown.addComponent(countdownTextShape)

    //set to listen for countdown timer's update
    countdownTimer.setOnTimerUpdate(dt=>{
        countdownTextShape.value = formatTimeString(countdownTimer.getTimeLeft())
    })

    //listen for when we reach to the end of the countdown
    countdownTimer.setOnTimerEnds(()=>{
        //reset countdown
        countdownTimer.reset()
        //play Close animation
        doorAnimator.getClip("Close").play()
        //play door sound
        doorAudioSource.playOnce()   
        //reset countdown text value
        countdownTextShape.value = formatTimeString(countdownTimer.getTimeLeft())
    })

    //listen for click event to toggle door state
    button.addComponent(new OnClick(event =>{
        //check if timer is running
        if (!countdownTimer.isRunning()){
            //play Open animation
            doorAnimator.getClip("Open").play()
            //play door sound
            doorAudioSource.playOnce()
            //play button sound
            button.getComponent(AudioSource).playOnce()
            //reset countdown from previous state
            countdownTimer.reset()
            //make the timer run
            TimerSystem.instance.runTimer(countdownTimer)
        }
    }))

    //add entities to the engine
    engine.addEntity(door)
    engine.addEntity(button)
    engine.addEntity(countdown)
}

export function CreateRoom2() : void{
    //create spikes
    let spikes = new Entity()

    //create gltf shape component and add it to entity
    let spikesShape = new GLTFShape("models/room2/spikes.glb")
    spikes.addComponent(spikesShape)

    //add transform and set position
    spikes.addComponent(new Transform({position: new Vector3(9.9,1.4,8.07), rotation: Quaternion.Euler(0,90,0)}))

    //create animator and add animation clips
    let spikesAnimator = new Animator()
    spikesAnimator.addClip(new AnimationClip("Appear"))
    spikesAnimator.addClip(new AnimationClip("Disappear"))

    //add AudioSource and clip
    spikes.addComponent(new AudioSource(new AudioClip("sounds/room2/whip.mp3")))

    //add animator component
    spikes.addComponent(spikesAnimator)

    //add toggle for spikes up (on) or down (off)
    spikes.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            //on On play appear animation
            spikes.getComponent(Animator).getClip("Appear").play()
            //play sound
            spikes.getComponent(AudioSource).playOnce()
        }
        else{
            //on Off play disappear animation
            spikes.getComponent(Animator).getClip("Disappear").play()
        }
    }))

    //create proximity trigger for spikes
    let spikeTrigger : ITriggerConfig = {
        distance : 3,
        enable: true,
        positionOffset: Vector3.Zero(),
        parent: spikes.getComponent(Transform),
        onTriggerEnter: ()=> spikes.getComponent(ToggleComponent).set(ToggleState.On),
        onTriggerExit: ()=> spikes.getComponent(ToggleComponent).set(ToggleState.Off)
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

export function CreateRoom3() : void{
    //constants
    const bookshelfDefaultPos = new Vector3(15.525, 0, 6.53)
    const chandelierDefaultRot = Quaternion.Identity
    const bookDefaultRot = Quaternion.Euler(0,-90,0)
    const couchDefaultPos = new Vector3(15, 0, 2.5)
    const wineBottleDefaultPos = new Vector3(8.53,1.011,3.72)
    const wineGlassDefaultPos = new Vector3(8.72,1.041,3.42)
    const chairDefaultRot = Quaternion.Identity
    const wallPaintingDefaultRot =  Quaternion.Euler(90,0,0)

    //create AudioClips that we are going to use in several entities
    let audioClipMoveObject1 = new AudioClip("sounds/move_object1.mp3")
    let audioClipMoveObject2 = new AudioClip("sounds/move_object2.mp3")

    //create bookshel entity
    let bookshelf = new Entity()

    //add gltf shape component
    bookshelf.addComponent(new GLTFShape("models/room3/bookshelf.glb"))

    //create transform component, set it and add it to entity
    bookshelf.addComponent(new Transform({position: bookshelfDefaultPos, rotation: Quaternion.Euler(0,90,0)}))

    //add audio source and set audio clip
    bookshelf.addComponent(new AudioSource(audioClipMoveObject1))

    //create chandelier entity
    let chandelier = new Entity()

    //add gltf shape component
    chandelier.addComponent(new GLTFShape("models/room3/chandelier.glb"))

    //add transform component
    chandelier.addComponent(new Transform({position: new Vector3(0.4,1.5,-0.05), rotation: chandelierDefaultRot}))

    //add audio source and set audio clip
    chandelier.addComponent(new AudioSource(audioClipMoveObject1))

    //set chandelier as child of bookshelf
    chandelier.setParent(bookshelf)

    //create book entity
    let book = new Entity()

    //add gltf shape component
    book.addComponent(new GLTFShape("models/room3/book.glb"))

    //add transform component
    book.addComponent(new Transform({position: new Vector3(-0.8,0.59,-0.19), rotation: bookDefaultRot}))

    //add audio source and set audio clip
    book.addComponent(new AudioSource(audioClipMoveObject1))

    //set book as child of bookshelf
    book.setParent(bookshelf)

    //create couch entity
    let couch = new Entity()

    //add gltf shape component
    couch.addComponent(new GLTFShape("models/room3/couch.glb"))

    //add transform component
    couch.addComponent(new Transform({position: couchDefaultPos}))

    //add audio source and set audio clip
    couch.addComponent(new AudioSource(audioClipMoveObject1))

    //create table entity
    let table = new Entity()

    //add gltf shape component
    table.addComponent(new GLTFShape("models/room3/table.glb"))

    //add transform component
    table.addComponent(new Transform({position: new Vector3(8.63,0,3.63)}))

    //add audio source and set audio clip
    table.addComponent(new AudioSource(audioClipMoveObject1))

    //create wine bottle entity
    let wineBottle = new Entity()

    //add gltf shape component
    wineBottle.addComponent(new GLTFShape("models/room3/winebottle.glb"))

    //add transform component
    wineBottle.addComponent(new Transform({position: wineBottleDefaultPos}))

    //add audio source and set audio clip
    wineBottle.addComponent(new AudioSource(audioClipMoveObject2))

    //create wine glass entity
    let wineGlass = new Entity()

    //add gltf shape component
    wineGlass.addComponent(new GLTFShape("models/room3/wineglass.glb"))

    //add transform component
    wineGlass.addComponent(new Transform({position: wineGlassDefaultPos}))

    //add audio source and set audio clip
    wineGlass.addComponent(new AudioSource(audioClipMoveObject2))

    //create chair entity
    let chair = new Entity()

    //add gltf shape component
    chair.addComponent(new GLTFShape("models/room3/chair.glb"))

    //add transform component
    chair.addComponent(new Transform({position: new Vector3(9.22,0,3.86), rotation: chairDefaultRot}))

    //add audio source and set audio clip
    chair.addComponent(new AudioSource(audioClipMoveObject1))

    //create chair entity
    let wallPainting = new Entity()

    //add gltf shape component
    wallPainting.addComponent(new GLTFShape("models/room3/manacoin.glb"))

    //add transform component
    wallPainting.addComponent(new Transform({position: new Vector3(12.33,2.65,0.31), rotation: wallPaintingDefaultRot}))

    //add audio source and set audio clip
    wallPainting.addComponent(new AudioSource(audioClipMoveObject1))

    //create fake door (spoiler alert: it will never open)
    let fakeDoor = new Entity()

    //add gltf shape to fake door
    fakeDoor.addComponent(new GLTFShape("models/generic/door.glb"))

    //add and set transform component
    fakeDoor.addComponent(new Transform({position: new Vector3(10.5,0,0.4)}))

    //toggle for bookshelf
    bookshelf.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            //move bookshelf when it's toggled on
            bookshelf.addComponentOrReplace(new MoveTransformComponent(bookshelf.getComponent(Transform).position,bookshelfDefaultPos.add(new Vector3(0,0,-1.5)), 3))
            //play sound when moved
            bookshelf.getComponent(AudioSource).playOnce()
        }
        else{
            //move back to default position when bookshelf's toggled off
            bookshelf.addComponentOrReplace(new MoveTransformComponent(bookshelf.getComponent(Transform).position,bookshelfDefaultPos, 3))
            //play sound when moved
            bookshelf.getComponent(AudioSource).playOnce()
        }
    }))

    //toggle for chandelier
    chandelier.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            //rotate chandelier when toggled on
            chandelier.addComponentOrReplace(new RotateTransformComponent(chandelier.getComponent(Transform).rotation,Quaternion.Euler(0,0,-30), 0.5))
            //play sound when rotated
            chandelier.getComponent(AudioSource).playOnce()
        }
        else{
            //rotate back to default position when off
            chandelier.addComponentOrReplace(new RotateTransformComponent(chandelier.getComponent(Transform).rotation,chandelierDefaultRot, 0.5))
            //play sound when rotated
            chandelier.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on chandelier and toggle it's state
    chandelier.addComponent(new OnClick(event=>{
        chandelier.getComponent(ToggleComponent).toggle()
    }))

    //toggle for book
    book.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            book.addComponentOrReplace(new RotateTransformComponent(book.getComponent(Transform).rotation,Quaternion.Euler(0,-90,25), 0.5))
            book.getComponent(AudioSource).playOnce()
        }
        else{
            book.addComponentOrReplace(new RotateTransformComponent(book.getComponent(Transform).rotation,bookDefaultRot, 0.5))
            book.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on book
    book.addComponent(new OnClick(event=>{
        book.getComponent(ToggleComponent).toggle()
    }))

    //toggle for wine bottle
    wineBottle.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            wineBottle.addComponentOrReplace(new MoveTransformComponent(wineBottle.getComponent(Transform).position,wineBottleDefaultPos.add(new Vector3(-0.2,0,0)), 0.5))
            wineBottle.getComponent(AudioSource).playOnce()
        }
        else{
            wineBottle.addComponentOrReplace(new MoveTransformComponent(wineBottle.getComponent(Transform).position,wineBottleDefaultPos, 0.5))
            wineBottle.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on wine bottle
    wineBottle.addComponent(new OnClick(event=>{
        wineBottle.getComponent(ToggleComponent).toggle()
    }))

    //toggle for wine glass
    wineGlass.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            wineGlass.addComponentOrReplace(new MoveTransformComponent(wineGlass.getComponent(Transform).position,wineGlassDefaultPos.add(new Vector3(0,0,-0.2)), 0.5))
            wineGlass.getComponent(AudioSource).playOnce()
        }
        else{
            wineGlass.addComponentOrReplace(new MoveTransformComponent(wineGlass.getComponent(Transform).position,wineGlassDefaultPos, 0.5))
            wineGlass.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on wine glass
    wineGlass.addComponent(new OnClick(event=>{
        wineGlass.getComponent(ToggleComponent).toggle()
    }))

    //toggle for chair
    chair.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            chair.addComponentOrReplace(new RotateTransformComponent(chair.getComponent(Transform).rotation,Quaternion.Euler(0,15,0), 0.5))
            chair.getComponent(AudioSource).playOnce()
        }
        else{
            chair.addComponentOrReplace(new RotateTransformComponent(chair.getComponent(Transform).rotation,chairDefaultRot, 0.5))
            chair.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on chair
    chair.addComponent(new OnClick(event=>{
        chair.getComponent(ToggleComponent).toggle()
    }))

    //toggle for wall painting
    wallPainting.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            //rotate wall painting and toggle ON bookshelf's state when rotation ends
            wallPainting.addComponentOrReplace(new RotateTransformComponent(wallPainting.getComponent(Transform).rotation, Quaternion.Euler(90,10,0), 0.5, ()=>{
                bookshelf.getComponent(ToggleComponent).set(ToggleState.On)
            }))
            wallPainting.getComponent(AudioSource).playOnce()
        }
        else{
            //rotate wall painting back to default and toggle OFF bookshelf's state when rotation ends
            wallPainting.addComponentOrReplace(new RotateTransformComponent(wallPainting.getComponent(Transform).rotation,wallPaintingDefaultRot, 0.5, ()=>{
                bookshelf.getComponent(ToggleComponent).set(ToggleState.Off)
            }))
            wallPainting.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on wall paiting
    wallPainting.addComponent(new OnClick(event=>{
        wallPainting.getComponent(ToggleComponent).toggle()
    }))

    //toggle for couch
    couch.addComponent(new ToggleComponent(ToggleState.Off, value =>{
        if (value == ToggleState.On){
            couch.addComponentOrReplace(new MoveTransformComponent(couch.getComponent(Transform).position,couchDefaultPos.add(new Vector3(0,0,0.4)), 0.5))
            couch.getComponent(AudioSource).playOnce()
        }
        else{
            couch.addComponentOrReplace(new MoveTransformComponent(couch.getComponent(Transform).position,couchDefaultPos, 0.5))
            couch.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on couch
    couch.addComponent(new OnClick(event=>{
        couch.getComponent(ToggleComponent).toggle()
    }))

    //add entities to engine
    engine.addEntity(bookshelf)
    engine.addEntity(chandelier)
    engine.addEntity(book)
    engine.addEntity(couch)
    engine.addEntity(table)
    engine.addEntity(wineBottle)
    engine.addEntity(wineGlass)
    engine.addEntity(chair)
    engine.addEntity(wallPainting)
    engine.addEntity(fakeDoor)
}