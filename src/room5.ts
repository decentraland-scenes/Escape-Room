import { SimpleDialog } from "./modules/simpleDialog";
import { ToggleComponent } from "./modules/toggleComponent";
import { RotateTransformComponent } from "./modules/transfromSystem";

export function CreateRoom5(gameCanvas: UICanvas) : void{
    //audio clips
    let audioAccessGranted = new AudioClip("sounds/access_granted.mp3")
    let audioAccessDenied = new AudioClip("sounds/access_denied.mp3")
    let audioSpotlight = new AudioClip("sounds/spotlight_on.mp3")

    //create spotlights
    const spotLight1 = CreateSpotlight(new Vector3(26.7078,0.1,20.7646), Quaternion.Identity, new GLTFShape("models/room5/spotlightlight.glb"), "1", audioSpotlight)
    const spotLight2 = CreateSpotlight(new Vector3(26.725,0.1,20.7646), Quaternion.Euler(0,90,0), new GLTFShape("models/room5/spotlightlight.glb"), "0", audioSpotlight)
    const spotLight3 = CreateSpotlight(new Vector3(26.7188,0.1,20.7646), Quaternion.Euler(0,180,0), new GLTFShape("models/room5/spotlightlight.glb"), "4", audioSpotlight)

    //create muna's statue
    const munaStatue = new Entity()
    munaStatue.addComponent(new GLTFShape("models/room5/Puzzle06_Muna.glb"))
    munaStatue.addComponent(new Transform({position: new Vector3(26.748, 0.1054, 20.765)}))
    munaStatue.addComponent(new OnClick(event=>{
        if (!dialog.isDialogTreeRunning()){
            dialog.runDialogTree(dialogTree)
        }
    }))
    engine.addEntity(munaStatue)

    //load textures for dialog
    const playerPortraitDefault = new Texture("images/dialogs/player_default.png", {hasAlpha: true})
    const playerPortraitSurprised = new Texture("images/dialogs/player_surprised.png", {hasAlpha: true})
    const playerPortraitThinking = new Texture("images/dialogs/player_thinking.png", {hasAlpha: true})
    const npcPortraitDefault = new Texture("images/dialogs/dog_default.png", {hasAlpha: true})
    const npcPortraitSurprised = new Texture("images/dialogs/dog_surprised.png", {hasAlpha: true})
    const npcPortraitThinking = new Texture("images/dialogs/dog_thinking.png", {hasAlpha: true})

    //config dialog
    const dialogConfig: SimpleDialog.DialogConfig = {
        canvas: gameCanvas,
        leftPortrait: {
            width: 256,
            height: 256,
            sourceWidth: 256,
            sourceHeight: 256,
            positionX: "-17%"
        },
        rightPortrait: {
            width: 256,
            height: 256,
            sourceWidth: 256,
            sourceHeight: 256,
            positionX: "15%"
        },
        dialogText:{
            width: "25%",
            height: "25%",
            textSpeed: 5,
            textIdleTime: 5,
            textConfig: {fontSize: 16, paddingLeft:10, paddingRight:10},
            background: new Texture("images/dialogs/textContainer.png"),
            backgroundConfig: {sourceWidth: 284, sourceHeight:192}
        },
        optionsContainer:{
            stackOrientation: UIStackOrientation.VERTICAL,
            spacing: 0,
            width: "40%",
            height: "12%",
            vAlign: "top",
            hAlign: "center",
            positionY: "-65%",
            background: new Texture("images/dialogs/optionsContainer.png"),
            backgroundConfig: {sourceWidth: 568, sourceHeight: 96},
            optionsTextConfig: {fontSize: 20, paddingLeft: 10, positionY: "-10%"}
        }
    }

    //instantiate dialog
    const dialog = new SimpleDialog(dialogConfig)

    //some random replies for muna
    const randomStartingOptions = ["I see...","...","...OK..."]
    const randomWrongAnswers = ["You are just guessing...","No it is not...","What? Not even close!"]

    //some variables used for dialog
    let firstTimeDialog: boolean = true
    let firstOptionCorrect:boolean = false
    let secondOptionCorrect:boolean = false
    let thirdOptionCorrect:boolean = false

    //create dialog tree
    const dialogTree = new SimpleDialog.DialogTree()
        .if(()=>firstTimeDialog)
            .call(()=>firstTimeDialog = false)
            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitDefault)
            .say(()=>"Hello!",{color: Color4.Yellow()})
            .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitSurprised)
            .say(()=>"A talking statue?!",{color: Color4.White()})
            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
            .say(()=>"I'm much more than a simple statue!",{color: Color4.Yellow()})
            .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitDefault)
            .say(()=>"Anyway... if you want to leave this place...",{color: Color4.Yellow()})
            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitThinking)
            .say(()=>"You will have to answer three questions about my hidden treasures in the other rooms.",{color: Color4.Yellow()})
            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
            .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitSurprised)
            .say(()=>"So GO and find my treasures! then come back and answer my questions!",{color: Color4.Yellow()})
            .say(()=>"O-kay(?)",{color: Color4.White()})
            .wait(3)
        .else()
            .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitThinking)
            .if(()=>firstOptionCorrect && secondOptionCorrect && thirdOptionCorrect)
                .say(()=>"We don't have anything else to talk about.\nEnter the code and leave now.",{color: Color4.Yellow()})
                .wait(3)
            .else()
                .say(()=>"Did you find my treasures?",{color: Color4.Yellow()})
                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
                .beginOptionsGroup()
                    .option(()=>"Why do you think I came all the way down here?")
                        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
                        .say(()=>"Why do you think I came all the way down here?",{color: Color4.White()})
                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                        .say(()=>randomStartingOptions[Math.floor(Math.random()*(randomStartingOptions.length-1))],{color: Color4.Yellow()})
                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitThinking)
                        .say(()=>"So... answer me this...",{color: Color4.Yellow()})
                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitDefault)
                        .if(()=>!firstOptionCorrect)
                            .say(()=>"What is my favorite color?",{color: Color4.Yellow()})
                            .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
                            .beginOptionsGroup()
                                .option(()=>"Red")
                                    .say(()=>"It's red",{color: Color4.White()})
                                    .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                    .say(()=>randomWrongAnswers[Math.floor(Math.random()*(randomWrongAnswers.length-1))],{color: Color4.Yellow()})
                                .endOption()
                                .option(()=>"Blue")
                                    .say(()=>"Blue?",{color: Color4.White()})
                                    .call(()=>firstOptionCorrect = true)
                                    .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                    .say(()=>"Yes it is...",{color: Color4.Yellow()})
                                    .say(()=>"\"In the midst of darkness, light persists.\"",{color: Color4.Yellow()})
                                    .call(()=>spotLight1.getComponent(ToggleComponent).set(ToggleComponent.State.On))
                                .endOption()
                                .option(()=>"Green")
                                    .say(()=>"Green",{color: Color4.White()})
                                    .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                    .say(()=>randomWrongAnswers[Math.floor(Math.random()*(randomWrongAnswers.length-1))],{color: Color4.Yellow()})
                                .endOption()
                            .endOptionsGroup()
                        .else()
                            .if(()=>!secondOptionCorrect)
                                .say(()=>"What is my favorite book?",{color: Color4.Yellow()})
                                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
                                .beginOptionsGroup()
                                    .option(()=>"The one about the young wizzard")
                                        .say(()=>"The one about the young wizzard!",{color: Color4.White()})
                                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                        .say(()=>randomWrongAnswers[Math.floor(Math.random()*(randomWrongAnswers.length-1))],{color: Color4.Yellow()})
                                    .endOption()
                                    .option(()=>"Romeo and Juliet")
                                        .say(()=>"That tragic romatic comedy about the two lovers than couldn't be together? Romeo and Juliet?",{color: Color4.White()})
                                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                        .say(()=>randomWrongAnswers[Math.floor(Math.random()*(randomWrongAnswers.length-1))],{color: Color4.Yellow()})
                                    .endOption()
                                    .option(()=>"Girl falling in love with vampire")
                                        .say(()=>"The book about a gril falling in love with a vampire...",{color: Color4.White()})
                                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                        .call(()=>secondOptionCorrect = true)
                                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                        .say(()=>"The books are better than the movies...",{color: Color4.Yellow()})
                                        .say(()=>"...",{color: Color4.White()})
                                        .say(()=>"\"Give light, and the darkness will disappear of itself.\"",{color: Color4.Yellow()})
                                        .call(()=>spotLight2.getComponent(ToggleComponent).set(ToggleComponent.State.On))
                                    .endOption()
                                .endOptionsGroup()
                            .else()
                                .if(()=>!thirdOptionCorrect)
                                    .say(()=>"What was my first pet's name?",{color: Color4.Yellow()})
                                    .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
                                    .beginOptionsGroup()
                                        .option(()=>"Bucephalus")
                                            .say(()=>"Bucephalus! Of course Muna the Great...",{color: Color4.White()})
                                            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                            .say(()=>randomWrongAnswers[Math.floor(Math.random()*(randomWrongAnswers.length-1))],{color: Color4.Yellow()})
                                        .endOption()
                                        .option(()=>"Babieca")
                                            .say(()=>"Babieca?",{color: Color4.White()})
                                            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                            .say(()=>randomWrongAnswers[Math.floor(Math.random()*(randomWrongAnswers.length-1))],{color: Color4.Yellow()})
                                        .endOption()
                                        .option(()=>"Marengo")
                                            .say(()=>"What's the french for Marengo?",{color: Color4.White()})
                                            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                            .call(()=>thirdOptionCorrect = true)
                                            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                            .say(()=>"Marengo...",{color: Color4.Yellow()})
                                            .say(()=>"That answer is correct!",{color: Color4.Yellow()})
                                            .say(()=>"\"Give light and people will find the way.\"")
                                            .call(()=>spotLight3.getComponent(ToggleComponent).set(ToggleComponent.State.On))
                                        .endOption()
                                    .endOptionsGroup()
                                .endif()
                            .endif()
                        .endif()
                    .endOption()
                    .option(()=>"No, not yet")
                        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
                        .say(()=>"No, not yet",{color: Color4.White()})
                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                        .say(()=>"You are wasting my time",{color: Color4.Yellow()})
                    .endOption()
                .endOptionsGroup()
        .endif()
        
    //set callback for whend dialog finish
    //dialog.setFinishCallback(()=>gameCanvas.visible = false)

    //create the numpad lock
    const numPadLock = new Entity()
    numPadLock.addComponent(new GLTFShape("models/generic/codePad.glb"))
    numPadLock.addComponent(new Transform({position: new Vector3(-0.6, 1, 0), rotation: Quaternion.Euler(0,90,0)}))
    numPadLock.addComponent(new OnClick(event =>{
        numLockpanelRect.visible = true
        gameCanvas.visible = true
    }))
    numPadLock.setParent(munaStatue)
    

    //create rect to contain numerical pad
    const numLockpanelRect = new UIContainerRect(gameCanvas)
    numLockpanelRect.positionX = -50
    numLockpanelRect.positionY = 50
    numLockpanelRect.width = "100%"
    numLockpanelRect.height = "100%"
    numLockpanelRect.visible = false

    //create texture for buttons
    const buttonTexture = new Texture("images/codepad/pwdpanel_buttons.png")
    const inputTexture = new Texture("images/codepad/pwdpanel_input.png")
    const closeTexture = new Texture("images/codepad/button_close.png")

    //background for numerical pad
    const panelBg = new UIImage(numLockpanelRect, new Texture("images/codepad/pwdpanel_bg.png"))
    panelBg.sourceWidth = 222
    panelBg.sourceHeight = 297
    panelBg.width = 310
    panelBg.height = 420
    panelBg.positionX = 70
    panelBg.positionY = -55

    //close button for numerical pad
    let panelCloseButton = new UIImage(numLockpanelRect, closeTexture)
    panelCloseButton.sourceWidth = 32
    panelCloseButton.sourceHeight = 32
    panelCloseButton.positionX = 204
    panelCloseButton.positionY = 133
    panelCloseButton.width = 32
    panelCloseButton.height = 32
    panelCloseButton.onClick = new OnClick(event=>{
        numLockpanelRect.visible = false
        gameCanvas.visible = false
    })

    //text for numerical pad
    let panelText = new UIText(numLockpanelRect)
    panelText.positionY = 133
    panelText.positionX = 16
    panelText.hTextAlign = "left"
    panelText.vTextAlign = "center"
    panelText.fontSize = 30
    panelText.value = "Enter Code"
    panelText.isPointerBlocker = false

    //set position offset for buttons
    const panelPosition = new Vector2(0, -12)
    //set buttons size
    const buttonSize = new Vector2(64, 64)
    //set space between buttons
    const buttonSpace = new Vector2(5, 5)

    //set current digit index and password value
    let currentInputIdx = 0
    let password = "104"

    //create buttons for numerical path
    for (let col=0;col<3;col++){
        for (let row=0; row<4; row++){
            //references for button image and number text
            let buttonImage: UIImage = null
            let numberText: UIText = null
            //value of the number
            let value = (row*3 + col) + 1

            //if it is in the last row in the middle we hardcode value to 0
            if (col == 1 && row == 3){
                value = 0
            }
            
            //at the bottom left we have the "clear" button
            if (col == 0 && row == 3){
                //create image for button
                buttonImage = new UIImage(numLockpanelRect, new Texture("images/codepad/pwdpanel_clear.png"))
                //when clicked we reset text values and set digit index to 0
                buttonImage.onClick = new OnClick(event =>{
                    panelInputs.forEach(inputSlot => {
                        inputSlot.text.value = ""
                        inputSlot.text.color = Color4.Black()
                    });
                    currentInputIdx = 0
                })
            }
            //bottom right is "enter" button
            else if (col == 2 && row == 3){
                //create image for button
                buttonImage = new UIImage(numLockpanelRect, new Texture("images/codepad/pwdpanel_enter.png"))
                //when clicked we check if entered password is correct
                buttonImage.onClick = new OnClick(event =>{
                    let inputPwd = ""
                    for (let i=0; i<3; i++){
                        inputPwd = inputPwd + panelInputs[i].text.value
                    }
                    //if password is correct
                    if (inputPwd == password){
                        panelInputs[0].text.value = "O"
                        panelInputs[0].text.color = Color4.Green()
                        panelInputs[1].text.value = "K"
                        panelInputs[1].text.color = Color4.Green()
                        panelInputs[2].text.value = "!"
                        panelInputs[2].text.color = Color4.Green()
                        numPadLock.addComponentOrReplace(new AudioSource(audioAccessGranted))
                        numPadLock.getComponent(AudioSource).playOnce() 
                        //TODO: make something happen
                    }
                    //if password is incorrect
                    else{
                        panelInputs[0].text.value = "E"
                        panelInputs[0].text.color = Color4.Red()
                        panelInputs[1].text.value = "r"
                        panelInputs[1].text.color = Color4.Red()
                        panelInputs[2].text.value = "r"
                        panelInputs[2].text.color = Color4.Red()
                        currentInputIdx = 0
                        numPadLock.addComponentOrReplace(new AudioSource(audioAccessDenied))
                        numPadLock.getComponent(AudioSource).playOnce()
                    }
                })
            }
            //if it is a numerical button
            else{
                //create image for button
                buttonImage = new UIImage(numLockpanelRect, buttonTexture)
                //create text for button
                numberText = new UIText(numLockpanelRect)
                numberText.isPointerBlocker = false
                //if clicked we set it value to the input boxes
                buttonImage.onClick = new OnClick(event =>{
                    //clear inputs if we are entering a new digit and we had and error or other message displayed
                    if (currentInputIdx == 0 && panelInputs[0].text.value != ""){
                        panelInputs.forEach(inputSlot => {
                            inputSlot.text.value = ""
                            inputSlot.text.color = Color4.Black()
                        });
                    }
                    //if we can add an input we add it
                    if (currentInputIdx < 3){
                        panelInputs[currentInputIdx].text.value = value.toString()
                        currentInputIdx++
                    }
                })
            }
            //set image
            buttonImage.sourceWidth = 64
            buttonImage.sourceHeight = 64
            buttonImage.width = buttonSize.x
            buttonImage.height = buttonSize.y
            buttonImage.positionX = panelPosition.x + col * (buttonSpace.x + buttonSize.x)
            buttonImage.positionY = panelPosition.y - row * (buttonSpace.y + buttonSize.y)

            //if its a numerical button we set up it's text
            if (numberText != null){
                numberText.width = buttonImage.width
                numberText.height = buttonImage.height
                numberText.positionX = buttonImage.positionX
                numberText.positionY = buttonImage.positionY
                numberText.fontAutoSize = true
                numberText.hTextAlign = "center"
                numberText.isPointerBlocker = false
                numberText.value = value.toString()
            }
        }
    }

    //create the input boxes to show the digits entered by the user
    let panelInputs: {image: UIImage, text: UIText}[] = []
    for (let i=0; i<3; i++){
        let inputSlot = {image: new UIImage(numLockpanelRect, inputTexture), text: new UIText(numLockpanelRect)}
        inputSlot.image.sourceWidth = 64
        inputSlot.image.sourceHeight = 64
        inputSlot.image.width = inputSlot.text.width = buttonSize.x
        inputSlot.image.height = inputSlot.text.height = buttonSize.y
        inputSlot.image.positionX = inputSlot.text.positionX = i * (buttonSpace.x + buttonSize.x)
        inputSlot.image.positionY = inputSlot.text.positionY = 65
        inputSlot.image.isPointerBlocker = inputSlot.text.isPointerBlocker = false
        inputSlot.text.fontAutoSize = true
        inputSlot.text.hTextAlign = "center"
        inputSlot.text.value = ""
        inputSlot.text.color = Color4.Black()
        panelInputs.push(inputSlot)
    }

    //create door entity
    let door = new Entity()

    //add gltf shape
    door.addComponent(new GLTFShape("models/room5/Puzzle06_Door.glb"))

    //add transform and set position
    door.addComponent(new Transform({position:new Vector3(28.3,0.25,19.75), rotation: Quaternion.Euler(0,180,0)}))

    //creat animator and add animation clips
    let doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationState("Door_Open", {looping:false}))
    doorAnimator.addClip(new AnimationState("Door_Close", {looping:false}))
    door.addComponent(doorAnimator)

    //create audio source component, set audio clip and add it to door entity
    let doorAudioSource = new AudioSource(new AudioClip("sounds/door_squeak.mp3"))
    door.addComponent(doorAudioSource)

    //listen to onclick event to toggle door state
    door.addComponent(new OnClick(event =>{ //TODO: remove later
        doorAnimator.getClip("Door_Open").play()
        door.getComponent(AudioSource).playOnce()
    }))

    //add door to engine
    engine.addEntity(door)
}

function CreateSpotlight(position: Vector3, rotation: Quaternion, spotlightLightShape: GLTFShape, hiddenNumberValue: string, audioClip: AudioClip): Entity{
    const rootEntity = new Entity()
    rootEntity.addComponent(new Transform({position: position, rotation:rotation}))
    rootEntity.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            const spotLightLight = new Entity()
            spotLightLight.addComponent(spotlightLightShape)
            spotLightLight.setParent(rootEntity)

            const hiddenNumber = new Entity()
            const hiddenNumberShape = new TextShape()
            hiddenNumber.addComponent(hiddenNumberShape)
            hiddenNumber.addComponent(new Transform({position: new Vector3(0,0.9,-0.4)}))
            hiddenNumber.setParent(rootEntity)
        
            hiddenNumberShape.value = hiddenNumberValue
            hiddenNumberShape.fontSize = 5

            spotLightLight.addComponentOrReplace(new AudioSource(audioClip))
            spotLightLight.getComponent(AudioSource).playOnce()
        }
    }))

    engine.addEntity(rootEntity)

    return rootEntity
}