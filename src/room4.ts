import utils from "../node_modules/decentraland-ecs-utils/index"

export function CreateRoom4(gameCanvas: UICanvas) : void{
    //audio clips
    let audioAccessGranted = new AudioClip("sounds/access_granted.mp3")
    let audioAccessDenied = new AudioClip("sounds/access_denied.mp3")

    //create rect to contain numerical pad
    const panelRect = new UIContainerRect(gameCanvas)
    panelRect.positionX = -50
    panelRect.positionY = 50
    panelRect.width = "100%"
    panelRect.height = "100%"
    panelRect.visible = false

    //create texture for buttons
    const buttonTexture = new Texture("images/codepad/pwdpanel_buttons.png")
    const inputTexture = new Texture("images/codepad/pwdpanel_input.png")
    const closeTexture = new Texture("images/codepad/button_close.png")
    const closeHintTexture = new Texture("images/room4/button_close.png")

    //background for numerical pad
    const panelBg = new UIImage(panelRect, new Texture("images/codepad/pwdpanel_bg.png"))
    panelBg.sourceWidth = 918
    panelBg.sourceHeight = 1300
    panelBg.width = 310
    panelBg.height = 420
    panelBg.positionX = 70
    panelBg.positionY = -55

    //close button for numerical pad
    let panelCloseButton = new UIImage(panelRect, closeTexture)
    panelCloseButton.sourceWidth = 92
    panelCloseButton.sourceHeight = 92
    panelCloseButton.positionX = 194
    panelCloseButton.positionY = 108
    panelCloseButton.width = 32
    panelCloseButton.height = 32
    panelCloseButton.onClick = new OnClick(event=>{
        panelRect.visible = false
    })

    //set position offset for buttons
    const panelPosition = new Vector2(12, -24)
    //set buttons size
    const buttonSize = new Vector2(55, 55)
    //set space between buttons
    const buttonSpace = new Vector2(5, 5)

    //set current digit index and password value
    let currentInputIdx = 0
    let password = "155"

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
                buttonImage = new UIImage(panelRect, new Texture("images/codepad/pwdpanel_clear.png"))
                //when clicked we reset text values and set digit index to 0
                buttonImage.onClick = new OnClick(event =>{
                    panelInputs.forEach(inputSlot => {
                        inputSlot.text.value = ""
                        inputSlot.text.color = Color4.White()
                    });
                    currentInputIdx = 0
                })
            }
            //bottom right is "enter" button
            else if (col == 2 && row == 3){
                //create image for button
                buttonImage = new UIImage(panelRect, new Texture("images/codepad/pwdpanel_enter.png"))
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
                        numPadLock.removeComponent(OnClick)
                        numPadLock.addComponentOrReplace(new AudioSource(audioAccessGranted))
                        numPadLock.getComponent(AudioSource).playOnce()
                        const openDoorTimer = new Entity()
                        openDoorTimer.addComponent(new utils.ExpireIn(2000,()=>{
                            panelRect.visible = false
                            door.getComponent(Animator).getClip("Door_Open").play()
                        }))
                        engine.addEntity(openDoorTimer)

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
                buttonImage = new UIImage(panelRect, buttonTexture)
                //create text for button
                numberText = new UIText(panelRect)
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
            buttonImage.sourceWidth = 171
            buttonImage.sourceHeight = 171
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
        let inputSlot = {image: new UIImage(panelRect, inputTexture), text: new UIText(panelRect)}
        inputSlot.image.sourceWidth = 173
        inputSlot.image.sourceHeight = 173
        inputSlot.image.width = inputSlot.text.width = buttonSize.x
        inputSlot.image.height = inputSlot.text.height = buttonSize.y
        inputSlot.image.positionX = inputSlot.text.positionX = (i * (buttonSpace.x + buttonSize.x)) + 5
        inputSlot.image.positionY = inputSlot.text.positionY = 45
        inputSlot.image.isPointerBlocker = inputSlot.text.isPointerBlocker = false
        inputSlot.text.fontAutoSize = true
        inputSlot.text.hTextAlign = "center"
        inputSlot.text.value = ""
        inputSlot.text.color = Color4.White()
        panelInputs.push(inputSlot)
    }

    //create a carpet on the ground
    const carpet = new Entity()
    carpet.addComponent(new GLTFShape("models/room4/Puzzle05_Carpet.glb"))
    carpet.addComponent(new Transform({position: new Vector3(20.7079,5.50579,24.6273)}))
    carpet.addComponent(new utils.ToggleComponent(utils.ToggleState.Off, value=>{
        if (value == utils.ToggleState.On){
            carpet.addComponent(new utils.RotateTransformComponent(carpet.getComponent(Transform).rotation, Quaternion.Euler(0,-10,0), 0.7))
        }
        else{
            carpet.addComponent(new utils.RotateTransformComponent(carpet.getComponent(Transform).rotation, Quaternion.Euler(0,0,0), 0.7))
        }
    }))
    carpet.addComponent(new OnClick(event=>{
        carpet.getComponent(utils.ToggleComponent).toggle()
    }))
    engine.addEntity(carpet)

    //create a coin under the carpet
    const postit = new Entity()
    postit.addComponent(new GLTFShape("models/room4/Puzzle05_Postit.glb"))
    postit.addComponent(new Transform({position: new Vector3(21.571,5.50857,25.9534)}))
    postit.addComponent(new OnClick(event =>{
        postitHintRect.visible = true
    }))
    engine.addEntity(postit)

    //create hint ui image to show when coin is clicked
    const postitHintRect = new UIContainerRect(gameCanvas)
    postitHintRect.width = "100%"
    postitHintRect.height = "100%"
    postitHintRect.visible = false
    const coinHintImage = new UIImage(postitHintRect, new Texture("images/room4/Postit_001.png"))
    coinHintImage.sourceWidth = 512
    coinHintImage.sourceHeight = 520
    coinHintImage.width = 512
    coinHintImage.height = 520

    //create "close" button for the coin's hint ui
    const coinHintClose = new UIImage(postitHintRect, closeHintTexture)
    coinHintClose.sourceWidth = 92
    coinHintClose.sourceHeight = 92
    coinHintClose.width = 46
    coinHintClose.height = 46
    coinHintClose.positionX = 512 * 0.5
    coinHintClose.positionY = 512 * 0.5
    coinHintClose.onClick = new OnClick(event =>{
        postitHintRect.visible = false
    })

    //create a painting on the wall
    const painting = new Entity()
    painting.addComponent(new GLTFShape("models/room4/Puzzle05_PictureMain.glb"))
    painting.addComponent(new Transform({position: new Vector3(22.2283, 7.60325, 20.9326)}))
    painting.addComponent(new OnClick(event =>{
        paintingHintRect.visible = true
    }))
    engine.addEntity(painting)

    //create hint ui image to show when painting is clicked
    const paintingHintRect = new UIContainerRect(gameCanvas)
    paintingHintRect.width = "100%"
    paintingHintRect.height = "100%"
    paintingHintRect.visible = false
    const paintingHintImage = new UIImage(paintingHintRect, new Texture("images/room4/fernpictureHint.png"))
    paintingHintImage.sourceWidth = 512
    paintingHintImage.sourceHeight = 512
    paintingHintImage.width = 512
    paintingHintImage.height = 512

    //create "close" button for the painting's hint ui
    const paintingHintClose = new UIImage(paintingHintRect, closeHintTexture)
    paintingHintClose.sourceWidth = 92
    paintingHintClose.sourceHeight = 92
    paintingHintClose.width = 46
    paintingHintClose.height = 46
    paintingHintClose.positionX = 512 * 0.5
    paintingHintClose.positionY = 512 * 0.5
    paintingHintClose.onClick = new OnClick(event =>{
        paintingHintRect.visible = false
    })

    //create the numpad lock
    const numPadLock = new Entity()
    numPadLock.addComponent(new GLTFShape("models/room4/Numpad1.glb"))
    numPadLock.addComponent(new OnClick(event =>{
        panelRect.visible = true
    }))
    engine.addEntity(numPadLock)

    //create door
    const door = new Entity()
    door.addComponent(new GLTFShape("models/room4/Puzzle05_Door.glb"))
    const doorAnimator = new Animator()
    doorAnimator.addClip(new AnimationState("Door_Open",{looping:false}))
    door.addComponent(doorAnimator)
    door.addComponent(new Transform({position: new Vector3(19.5141,5.54709,25.676)}))
    engine.addEntity(door)
}