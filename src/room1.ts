import { Timer, TimerSystem } from "./modules/timerSystem";

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
    door.addComponent(new GLTFShape("models/room1/Puzzle02_Door.glb"))

    //add transform and set position
    door.addComponent(new Transform({position:new Vector3(24.1,5.51634,24.9)}))

    //creat animator and add animation clips
    let doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationState("Door_Open", {looping:false}))
    doorAnimator.addClip(new AnimationState("Door_Close", {looping:false}))
    door.addComponent(doorAnimator)

    //create audio source component, set audio clip and add it to door entity
    let doorAudioSource = new AudioSource(new AudioClip("sounds/door_squeak.mp3"))
    door.addComponent(doorAudioSource)

    //create the button that we'll use to open the door
    let button = new Entity()

    //add shape component to button
    button.addComponent(new GLTFShape("models/room1/Square_Button.glb"))

    //add transform and set position
    button.addComponent(new Transform({position: new Vector3(26.3714,6.89,26.8936)}))

    //add audio source to button
    button.addComponent(new AudioSource(new AudioClip("sounds/button.mp3")))

    //create animator for button
    let buttonAnimator = new Animator()
    
    //add clip to animator
    buttonAnimator.addClip(new AnimationState("Button_Action", {looping:false}))

    //add animator to button
    button.addComponent(buttonAnimator)

    //create entity that will contain the countdown
    let countDownDisplayer = new Entity()

    //add mesh to the displayer
    countDownDisplayer.addComponent(new GLTFShape("models/room1/Puzzle02_ButtomScreen.glb"))

    //set position to the displayer
    countDownDisplayer.addComponent(new Transform({position: new Vector3(25.1272,9.51119,25.1116)}))

    //create countdown displayer
    let countdown = new Entity()

    //set countdown text as child of displayer
    countdown.setParent(countDownDisplayer)

    //add transform and set position
    countdown.addComponent(new Transform({position: new Vector3(0,0,0.1), rotation: Quaternion.Euler(20,180,0) }))

    //create text shape for countdown
    let countdownTextShape = new TextShape(formatTimeString(countdownTimer.getTimeLeft()))
    countdownTextShape.color = Color3.Red()
    countdownTextShape.fontSize = 5
    countdown.addComponent(countdownTextShape)

    //set to listen for countdown timer's update
    countdownTimer.setOnTimerUpdate(dt=>{
        countdownTextShape.value = formatTimeString(countdownTimer.getTimeLeft())
    })

    //listen for when we reach to the end of the countdown
    countdownTimer.setOnTimerEnds(()=>{
        //reset countdown
        countdownTimer.reset()
        //stop previous animation as a workaround to a bug with animations
        doorAnimator.getClip("Door_Open").stop()
        //play Close animation
        doorAnimator.getClip("Door_Close").play()
        //play door sound
        doorAudioSource.playOnce()   
        //reset countdown text value
        countdownTextShape.value = formatTimeString(countdownTimer.getTimeLeft())
    })

    //listen for click event to toggle door state
    button.addComponent(new OnClick(event =>{
        //check if timer is running
        if (!countdownTimer.isRunning()){
            //stop previous animation as a workaround to a bug with animations
            doorAnimator.getClip("Door_Close").stop()
            //play Open animation
            doorAnimator.getClip("Door_Open").play()
            //play door sound
            doorAudioSource.playOnce()
            //play button sound
            button.getComponent(AudioSource).playOnce()
            //play button animation
            buttonAnimator.getClip("Button_Action").stop()
            buttonAnimator.getClip("Button_Action").play()
            //reset countdown from previous state
            countdownTimer.reset()
            //make the timer run
            TimerSystem.instance.runTimer(countdownTimer)
        }
    }))

    //add entities to the engine
    engine.addEntity(door)
    engine.addEntity(button)
    engine.addEntity(countDownDisplayer)
}
