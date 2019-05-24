import { SimpleDialog } from "./modules/simpleDialog";

export function CreateRoom5() : void{
    const playerPortraitDefault = new Texture("images/dialogs/player_default.png", {hasAlpha: true})
    const npcPortraitDefault = new Texture("images/dialogs/dog_default.png", {hasAlpha: true})

    const canvas = new UICanvas()

    const dialogConfig: SimpleDialog.DialogConfig = {
        canvas: canvas,
        leftPortrait: {
            width: 128,
            height: 192,
            sourceWidth: 128,
            sourceHeight: 192,
            hAlign: "left",
            positionX: "25%"
        },
        rightPortrait: {
            width: 128,
            height: 192,
            sourceWidth: 128,
            sourceHeight: 192,
            hAlign: "right",
            positionX: "-25%"
        },
        dialogText:{
            width: "25%",
            height: "25%",
            textSpeed: 15,
            textConfig: {fontSize: 16}
        },
        optionsContainer:{
            stackOrientation: UIStackOrientation.VERTICAL,
            spacing: 2,
            vAlign: "bottom",
            positionY: "10%"
        }
    }

    const dialog = new SimpleDialog(dialogConfig)

    const dialogTree = new SimpleDialog.DialogTree()
        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
        .say(()=>"Hi! hi! where are you?")
        .showPortrait(SimpleDialog.PortraitIndex.LEFT, npcPortraitDefault)
        .say(()=>"I'm here!!",{color: Color4.Green()})
        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, playerPortraitDefault)
        .say(()=>"Where have you been?",{color: Color4.White()})
        .say(()=>"Not of your business... bye",{color: Color4.Green()})
        .hidePortrait(SimpleDialog.PortraitIndex.LEFT)
        .say(()=>"b-ye... ?",{color: Color4.White()})

    dialog.startDialog(dialogTree)

    /*const dialogContainer = new UIContainerRect(canvas)
    dialogContainer.width = "100%"
    dialogContainer.height = "100%"

    const rigthPortraitContainer = new UIContainerRect(dialogContainer)
    rigthPortraitContainer.width = 128
    rigthPortraitContainer.height = 192
    rigthPortraitContainer.hAlign = "right"
    rigthPortraitContainer.positionX = "-25%"

    const leftPortraitContainer = new UIContainerRect(dialogContainer)
    leftPortraitContainer.width = 128
    leftPortraitContainer.height = 192
    leftPortraitContainer.hAlign = "left"
    leftPortraitContainer.positionX = "25%"

    const leftPortrait = new UIImage(leftPortraitContainer, playerPortraitDefault)
    leftPortrait.sourceWidth = 128
    leftPortrait.sourceHeight = 192
    leftPortrait.width = "100%"
    leftPortrait.height = "100%"

    const rightPortrait = new UIImage(rigthPortraitContainer, npcPortraitDefault)
    rightPortrait.sourceWidth = 128
    rightPortrait.sourceHeight = 192
    rightPortrait.width = "100%"
    rightPortrait.height = "100%"*/

    /*const textContainer = new UIContainerRect(dialogContainer)
    textContainer.width = "25%"
    textContainer.height = "25%"

    const temp = new UIImage(textContainer, new Texture("images/room4/pwdpanel_input.png"))
    temp.sourceHeight = 64
    temp.sourceWidth = 64
    temp.width = "100%"
    temp.height = "100%"

    const dialogText = new UIText(textContainer)
    dialogText.width = "100%"
    dialogText.height = "100%"
    dialogText.hTextAlign = "left"
    dialogText.vTextAlign = "center"
    dialogText.textWrapping = true
    dialogText.value = "Bitcoin (BTC) is a cryptocurrency or a form of digital asset. Bitcoin (BTC) price for today is $7,834.61 with a 24-hour trading volume of $26,387,597,401. Price is down -1.4% in the last 24 hours. It has a circulating supply of 17.7 Million coins and a max supply of 21 Million coins. The most active exchange that is trading Bitcoin is Binance. Explore the address and transactions of Bitcoin on block explorers such as blockchair.com, blockchain.info, live.blockcypher.com, bitcoinblockexplorers.com, and btc.tokenview.com"
    dialogText.color = Color4.Black()

    const fontSize = 16

    const optionsStack = new UIContainerStack(dialogContainer)
    optionsStack.stackOrientation = UIStackOrientation.VERTICAL
    optionsStack.spacing = 2
    optionsStack.color = Color4.White()
    optionsStack.vAlign = "bottom"
    optionsStack.positionY = "10%"

    const containerOption1 = new UIContainerRect(optionsStack)
    containerOption1.adaptWidth = true
    containerOption1.height = fontSize
    containerOption1.color = Color4.Red()

    const containerOption2 = new UIContainerRect(optionsStack)
    containerOption2.height = fontSize
    containerOption2.color = Color4.Red()

    const containerOption3 = new UIContainerRect(optionsStack)
    containerOption3.height = fontSize
    containerOption3.color = Color4.Red()

    const option1 = new UIText(containerOption1)
    option1.value = "OPTION1"
    option1.color = Color4.Black()
    option1.width = "100%"
    option1.height = "100%"
    option1.hTextAlign = "center"
    option1.vTextAlign = "center"
    option1.fontSize = fontSize

    const option2 = new UIText(containerOption2)
    option2.value = "OPTION2"
    option2.color = Color4.Black()
    option2.width = "100%"
    option2.height = "100%"
    option2.hTextAlign = "center"
    option2.vTextAlign = "center"
    option2.fontSize = fontSize

    const option3 = new UIText(containerOption3)
    option3.value = "OPTION3"
    option3.color = Color4.Black()
    option3.width = "100%"
    option3.height = "100%"
    option3.hTextAlign = "center"
    option3.vTextAlign = "center"
    option3.fontSize = fontSize*/

}