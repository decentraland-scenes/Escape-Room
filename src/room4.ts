export function CreateRoom4() : void{
    const panelCanvas = new UICanvas()

    const buttonTexture = new Texture("images/room4/pwdpanel_buttons.png")
    const inputTexture = new Texture("images/room4/pwdpanel_input.png")

    const buttonSize = new Vector2(64, 64)
    const buttonSpace = new Vector2(5, 5)
    const buttonRootPosition = new Vector2(0, 0)

    let currentInputIdx = 0
    let password = "155"

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
                        panelInputs[1].text.value = "R"
                        panelInputs[1].text.color = Color4.Red()
                        panelInputs[2].text.value = "R"
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
            buttonImage.positionX = buttonRootPosition.x + col * (buttonSpace.x + buttonSize.x)
            buttonImage.positionY = buttonRootPosition.y - row * (buttonSpace.y + buttonSize.y)

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
        inputSlot.image.positionX = inputSlot.text.positionX = buttonRootPosition.x + i * (buttonSpace.x + buttonSize.x)
        inputSlot.image.positionY = inputSlot.text.positionY = buttonRootPosition.y + (buttonSpace.y + buttonSize.y)
        inputSlot.text.fontAutoSize = true
        inputSlot.text.hTextAlign = "center"
        inputSlot.text.value = ""
        inputSlot.text.color = Color4.Black()
        panelInputs.push(inputSlot)
    }
}