import { ToggleComponent } from "./modules/toggleComponent";
import { RotateTransformComponent } from "./modules/transfromSystem";

export function CreateRoom4() : void{
    const panelCanvas = new UICanvas()
    panelCanvas.visible = false
    const panelPosition = new Vector2(0, 0)

    const buttonTexture = new Texture("images/room4/pwdpanel_buttons.png")
    const inputTexture = new Texture("images/room4/pwdpanel_input.png")
    const closeTexture = new Texture("images/room4/button_close.png")

    let currentInputIdx = 0
    let password = "155"

    const buttonSize = new Vector2(64, 64)
    const buttonSpace = new Vector2(5, 5)

    let panelCloseButton = new UIImage(panelCanvas, closeTexture)
    panelCloseButton.sourceWidth = 32
    panelCloseButton.sourceHeight = 32
    panelCloseButton.positionX = panelPosition.x + 3 * (buttonSpace.x + buttonSize.x)
    panelCloseButton.positionY = panelPosition.y + 2 * (buttonSpace.y + buttonSize.y)
    panelCloseButton.width = 32
    panelCloseButton.height = 32
    panelCloseButton.onClick = new OnClick(event=>{
        panelCanvas.visible = false
    })

    let panelText = new UIText(panelCanvas)
    panelText.positionY = panelPosition.y + 2 * (buttonSpace.y + buttonSize.y)
    panelText.positionX = panelPosition.x + 16
    panelText.hTextAlign = "left"
    panelText.vTextAlign = "center"
    panelText.fontSize = 30
    panelText.value = "Enter Code"

    for (let col=0;col<3;col++){
        for (let row=0; row<4; row++){
            let buttonImage: UIImage = null
            let numberText: UIText = null
            let value = (row*3 + col) + 1

            if (col == 1 && row == 3){
                value = 0
            }
            
            if (col == 0 && row == 3){
                buttonImage = new UIImage(panelCanvas, new Texture("images/room4/pwdpanel_clear.png"))
                buttonImage.onClick = new OnClick(event =>{
                    panelInputs.forEach(inputSlot => {
                        inputSlot.text.value = ""
                    });
                    currentInputIdx = 0
                })
            }
            else if (col == 2 && row == 3){
                buttonImage = new UIImage(panelCanvas, new Texture("images/room4/pwdpanel_enter.png"))
                buttonImage.onClick = new OnClick(event =>{
                    let inputPwd = ""
                    for (let i=0; i<3; i++){
                        inputPwd = inputPwd + panelInputs[i].text.value
                    }
                    if (inputPwd == password){
                        panelInputs[0].text.value = "O"
                        panelInputs[0].text.color = Color4.Green()
                        panelInputs[1].text.value = "K"
                        panelInputs[1].text.color = Color4.Green()
                        panelInputs[2].text.value = "!"
                        panelInputs[2].text.color = Color4.Green()
                    }
                    else{
                        panelInputs[0].text.value = "E"
                        panelInputs[0].text.color = Color4.Red()
                        panelInputs[1].text.value = "r"
                        panelInputs[1].text.color = Color4.Red()
                        panelInputs[2].text.value = "r"
                        panelInputs[2].text.color = Color4.Red()
                        currentInputIdx = 0
                    }
                })
            }
            else{
                buttonImage = new UIImage(panelCanvas, buttonTexture)
                numberText = new UIText(panelCanvas)
                numberText.isPointerBlocker = false
                buttonImage.onClick = new OnClick(event =>{
                    if (currentInputIdx == 0 && panelInputs[0].text.value != ""){
                        panelInputs.forEach(inputSlot => {
                            inputSlot.text.value = ""
                            inputSlot.text.color = Color4.Black()
                        });
                    }
                    if (currentInputIdx < 3){
                        panelInputs[currentInputIdx].text.value = value.toString()
                        currentInputIdx++
                    }
                })
            }
            buttonImage.sourceWidth = 32
            buttonImage.sourceHeight = 32
            buttonImage.width = buttonSize.x
            buttonImage.height = buttonSize.y
            buttonImage.positionX = panelPosition.x + col * (buttonSpace.x + buttonSize.x)
            buttonImage.positionY = panelPosition.y - row * (buttonSpace.y + buttonSize.y)

            if (numberText != null){
                numberText.width = buttonImage.width
                numberText.height = buttonImage.height
                numberText.positionX = buttonImage.positionX
                numberText.positionY = buttonImage.positionY
                numberText.fontAutoSize = true
                numberText.hTextAlign = "center"
                numberText.value = value.toString()
            }
        }
    }

    let panelInputs: {image: UIImage, text: UIText}[] = []
    for (let i=0; i<3; i++){
        let inputSlot = {image: new UIImage(panelCanvas, inputTexture), text: new UIText(panelCanvas)}
        inputSlot.image.sourceWidth = 32
        inputSlot.image.sourceHeight = 32
        inputSlot.image.width = inputSlot.text.width = buttonSize.x
        inputSlot.image.height = inputSlot.text.height = buttonSize.y
        inputSlot.image.positionX = inputSlot.text.positionX = panelPosition.x + i * (buttonSpace.x + buttonSize.x)
        inputSlot.image.positionY = inputSlot.text.positionY = panelPosition.y + (buttonSpace.y + buttonSize.y)
        inputSlot.text.fontAutoSize = true
        inputSlot.text.hTextAlign = "center"
        inputSlot.text.value = ""
        inputSlot.text.color = Color4.Black()
        panelInputs.push(inputSlot)
    }

    const carpet = new Entity()
    carpet.addComponent(new GLTFShape("models/room4/carpet.glb"))
    carpet.addComponent(new Transform({position: new Vector3(3,0,3)}))
    carpet.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value=>{
        if (value == ToggleComponent.ToggleState.On){
            carpet.addComponent(new RotateTransformComponent(carpet.getComponent(Transform).rotation, Quaternion.Euler(0,45,0), 0.7))
        }
        else{
            carpet.addComponent(new RotateTransformComponent(carpet.getComponent(Transform).rotation, Quaternion.Euler(0,0,0), 0.7))
        }
    }))
    carpet.addComponent(new OnClick(event=>{
        carpet.getComponent(ToggleComponent).toggle()
    }))
    engine.addEntity(carpet)

    const coin = new Entity()
    coin.addComponent(new GLTFShape("models/room4/coin.glb"))
    coin.addComponent(new Transform({position: new Vector3(2,0,2.5)}))
    engine.addEntity(coin)

    const coinHintCanvas = new UICanvas()
    coinHintCanvas.visible = false
    const coinHintImage = new UIImage(coinHintCanvas, new Texture("images/room4/coinHint.png"))
    coinHintImage.sourceWidth = 64
    coinHintImage.sourceHeight = 64
    coinHintImage.width = 128
    coinHintImage.height = 128

    const coinHintClose = new UIImage(coinHintCanvas, closeTexture)
    coinHintClose.sourceWidth = 32
    coinHintClose.sourceHeight = 32
    coinHintClose.width = 32
    coinHintClose.height = 32
    coinHintClose.positionX = 100
    coinHintClose.positionY = 100
    coinHintClose.onClick = new OnClick(event =>{
        coinHintCanvas.visible = false
    })

    const painting = new Entity()
    painting.addComponent(new PlaneShape())
    painting.addComponent(new Transform({position: new Vector3(2, 1.5, 4), scale: new Vector3(0.7,1,1), rotation: Quaternion.Euler(0,180,0)}))
    let paintingMat = new Material()
    paintingMat.albedoTexture = new Texture("images/room4/fernpicture.png", {hasAlpha: true})
    paintingMat.hasAlpha = true
    paintingMat.transparencyMode = 3
    painting.addComponent(paintingMat)
    painting.addComponent(new OnClick(event =>{
        paintingHintCanvas.visible = true
    }))
    engine.addEntity(painting)

    const paintingHintCanvas = new UICanvas()
    paintingHintCanvas.visible = false
    const paintingHintImage = new UIImage(paintingHintCanvas, new Texture("images/room4/fernpictureHint.png"))
    paintingHintImage.sourceWidth = 392
    paintingHintImage.sourceHeight = 512
    paintingHintImage.width = 98
    paintingHintImage.height = 128

    const paintingHintClose = new UIImage(paintingHintCanvas, closeTexture)
    paintingHintClose.sourceWidth = 32
    paintingHintClose.sourceHeight = 32
    paintingHintClose.width = 32
    paintingHintClose.height = 32
    paintingHintClose.positionX = 100
    paintingHintClose.positionY = 100
    paintingHintClose.onClick = new OnClick(event =>{
        paintingHintCanvas.visible = false
    })

    const button = new Entity()
    button.addComponent(new GLTFShape("models/generic/redbutton.gltf"))
    button.addComponent(new Transform({position: new Vector3(3.5,0.2,4.5), scale: new Vector3(0.3,0.3,0.3)}))
    button.addComponent(new OnClick(event =>{
        panelCanvas.visible = true
    }))
    engine.addEntity(button)

}