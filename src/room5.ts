import { SimpleDialog } from "./modules/simpleDialog";

export function CreateRoom5() : void{
    const playerPortraitDefault = new Texture("images/dialogs/player_default.png", {hasAlpha: true})
    const playerPortraitSurprised = new Texture("images/dialogs/player_surprised.png", {hasAlpha: true})
    const playerPortraitThinking = new Texture("images/dialogs/player_thinking.png", {hasAlpha: true})
    const npcPortraitDefault = new Texture("images/dialogs/dog_default.png", {hasAlpha: true})
    const npcPortraitSurprised = new Texture("images/dialogs/dog_surprised.png", {hasAlpha: true})
    const npcPortraitThinking = new Texture("images/dialogs/dog_thinking.png", {hasAlpha: true})

    const canvas = new UICanvas()

    const dialogConfig: SimpleDialog.DialogConfig = {
        canvas: canvas,
        leftPortrait: {
            width: 128,
            height: 192,
            sourceWidth: 128,
            sourceHeight: 192,
            positionX: "-17%"
        },
        rightPortrait: {
            width: 128,
            height: 192,
            sourceWidth: 128,
            sourceHeight: 192,
            positionX: "15%"
        },
        dialogText:{
            width: "25%",
            height: "25%",
            textSpeed: 30,
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

    const dialog = new SimpleDialog(dialogConfig)

    const dialogTree = new SimpleDialog.DialogTree()
        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
        .say(()=>"Hey Shibuina! where are you?")
        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitDefault)
        .say(()=>"I'm here!!",{color: Color4.Green()})
        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
        .say(()=>"Look! Bitcoin is up again... We are clearly in a bull market now",{color: Color4.White()})
        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
        .say(()=>"What??!",{color: Color4.Green()})
        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitThinking)
        .say(()=>"You know that bitcoin is a bubble, don't you?",{color: Color4.Green()})
        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitSurprised)
        .say(()=>"W-Whatt??",{color: Color4.White()})
        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitDefault)
        .say(()=>"No... it is not...",{color: Color4.White()})
        .beginOptionsGroup()
            .option(()=>"I should spend all my savings in bitcoin")
                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
                .say(()=>"I should spend all my savings in bitcoin",{color: Color4.White()})
                .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                .say(()=>"Oh! Look! bitcoin is now falling down. It lost 50% of it's value in only one minute!",{color: Color4.Green()})
                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitSurprised)
                .say(()=>"Noooooooo!!!",{color: Color4.White()})
            .endOption()
            .option(()=>"I should wait a couple of day to see what happen")
                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
                .say(()=>"I should wait a couple of day to see what happen",{color: Color4.White()})
                .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitThinking)
                .say(()=>"Do you remember where you put your wallet's private key?",{color: Color4.Green()})
                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
                .beginOptionsGroup()
                    .option(()=>"It is on my good old pendrive")
                        .say(()=>"It is on my good old pendrive",{color: Color4.White()})
                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                        .say(()=>"The one we just formatted to install linux?",{color: Color4.Green()})
                        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitSurprised)
                        .say(()=>"Noooooooo!!!",{color: Color4.White()})
                    .endOption()
                    .option(()=>"I wrote it down and put it in my trousers back pocket")
                        .say(()=>"I wrote it down and put it in my trousers back pocket",{color: Color4.White()})
                        .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                        .say(()=>"The trousers that I just put inside the washing machine?",{color: Color4.Green()})
                        .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitSurprised)
                        .say(()=>"Noooooooo!!!",{color: Color4.White()})
                    .endOption()
                .endOptionsGroup()
            .endOption()
            .option(()=>"You are right, I should sell all of my bitcoins")
                .say(()=>"You are right, I should sell all of my bitcoins",{color: Color4.White()})
                .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitThinking)
                .say(()=>"Actually...",{color: Color4.Green()})
                .say(()=>"You can't...",{color: Color4.Green()})
                .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                .say(()=>"The FBI just called. You are being investigated for money laundering",{color: Color4.Green()})
                .say(()=>"Bye!",{color: Color4.Green()})
                .hidePortrait(SimpleDialog.PortraitIndex.RIGHT)
                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitThinking)
                .say(()=>"Wait!",{color: Color4.White()})
                .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitSurprised)
                .say(()=>"WTF?!?!?!!!!",{color: Color4.White()})
            .endOption()
        .endOptionsGroup()

    dialog.startDialog(dialogTree)

    const box = new Entity()
    box.addComponent(new BoxShape())
    box.addComponent(new Transform({position: new Vector3(1,0,1)}))
    box.addComponent(new OnClick(()=>{
        if (!dialog.isRunning()){
            canvas.visible = true
            dialog.startDialog(dialogTree)
        }
    }))
    engine.addEntity(box)
}