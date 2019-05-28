import { SimpleDialog } from "./modules/simpleDialog";
import { ToggleComponent } from "./modules/toggleComponent";

export function CreateRoom5() : void{
    const spotLightShape = new GLTFShape("models/room5/spotlight.glb")
    const spotLightLightShape = new GLTFShape("models/room5/spotlightlight.glb")

    const spotLight1 = CreateSpotlight(new Vector3(5,0,5),spotLightShape, spotLightLightShape, "1")
    const spotLight2 = CreateSpotlight(new Vector3(6,0,5),spotLightShape, spotLightLightShape, "0")
    const spotLight3 = CreateSpotlight(new Vector3(7,0,5),spotLightShape, spotLightLightShape, "4")

    const munaStatue = new Entity()
    munaStatue.addComponent(new GLTFShape("models/room5/muna.glb"))
    munaStatue.addComponent(new Transform({position: new Vector3(6, 0, 6)}))
    munaStatue.addComponent(new OnClick(event=>{
        dialog.startDialog(dialogTree)
    }))
    engine.addEntity(munaStatue)

    spotLight1.getComponent(ToggleComponent).toggle()
    spotLight2.getComponent(ToggleComponent).toggle()
    spotLight3.getComponent(ToggleComponent).toggle()


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

    const dialog = new SimpleDialog(dialogConfig)

    const randomStartingOptions = ["I see...","...","...OK..."]
    const randomWrongAnswers = ["You are just guessing...","No it is not...","What? Not even close!"]

    let firstTimeDialog: boolean = true
    let firstOptionCorrect:boolean = false
    let secondOptionCorrect:boolean = false
    let thirdOptionCorrect:boolean = false

    const dialogTree = new SimpleDialog.DialogTree()
        .if(()=>firstTimeDialog)
            .call(()=>firstTimeDialog = false)
            .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
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
            .say(()=>"O-kay?",{color: Color4.White()})
            .wait(3)
        .else()
            .showPortrait(SimpleDialog.PortraitIndex.LEFT, playerPortraitDefault)
            .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitThinking)
            .if(()=>firstOptionCorrect && secondOptionCorrect && thirdOptionCorrect)
                .say(()=>"We don't have anything else to talk about.\nYou can leave now.",{color: Color4.Yellow()})
                .wait(3)
            .else()
                .say(()=>"Did you find any of my treasures?",{color: Color4.Yellow()})
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
                                .option(()=>"Green")
                                    .say(()=>"Green?",{color: Color4.White()})
                                    .call(()=>firstOptionCorrect = true)
                                    .showPortrait(SimpleDialog.PortraitIndex.RIGHT, npcPortraitSurprised)
                                    .say(()=>"Yes it is...",{color: Color4.Yellow()})
                                    .call(()=>spotLight1.getComponent(ToggleComponent).set(ToggleComponent.ToggleState.On))
                                .endOption()
                                .option(()=>"Blue")
                                    .say(()=>"Blue",{color: Color4.White()})
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
                                        .say(()=>"Yes it is...",{color: Color4.Yellow()})
                                        .call(()=>spotLight2.getComponent(ToggleComponent).set(ToggleComponent.ToggleState.On))
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
                                            .call(()=>spotLight3.getComponent(ToggleComponent).set(ToggleComponent.ToggleState.On))
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
        

    dialog.startDialog(dialogTree)
    dialog.setFinishCallback(()=>canvas.visible = false)
}

function CreateSpotlight(position: Vector3, spotlightShape: GLTFShape, spotlightLightShape: GLTFShape, hiddenNumberValue: string): Entity{
    const rootEntity = new Entity()
    rootEntity.addComponent(new Transform({position: position}))
    rootEntity.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            if (!spotLightLight.isAddedToEngine()){
                engine.addEntity(spotLightLight)
            }
            if (!hiddenNumber.isAddedToEngine()){
                engine.addEntity(hiddenNumber)
            }
        }
        else{
            if (spotLightLight.isAddedToEngine()){
                engine.removeEntity(spotLightLight)
            }
            if (hiddenNumber.isAddedToEngine()){
                engine.removeEntity(hiddenNumber)
            }
        }
    }))

    const spotLight = new Entity()
    spotLight.addComponent(spotlightShape)
    spotLight.addComponent(new Transform())
    spotLight.setParent(rootEntity)

    const spotLightLight = new Entity()
    spotLightLight.addComponent(spotlightLightShape)
    spotLightLight.addComponent(new Transform({position: new Vector3(0,0.3,0), rotation: Quaternion.Euler(30,0,0)}))
    spotLightLight.setParent(rootEntity)

    const hiddenNumber = new Entity()
    const hiddenNumberShape = new TextShape()
    hiddenNumber.addComponent(hiddenNumberShape)
    hiddenNumber.addComponent(new Transform({position: new Vector3(0,1,-2), rotation: Quaternion.Euler(0,180,0)}))
    hiddenNumber.setParent(rootEntity)

    hiddenNumberShape.value = hiddenNumberValue
    hiddenNumberShape.fontSize = 20

    engine.addEntity(rootEntity)
    engine.removeEntity(spotLightLight)
    engine.removeEntity(hiddenNumber)

    return rootEntity
}