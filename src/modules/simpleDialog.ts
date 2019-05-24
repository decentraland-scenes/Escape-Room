import { ActionsSequenceSystem } from "./actionsSequenceSystem";

export class SimpleDialog{
    actionsSequenceSystem: ActionsSequenceSystem

    private dialogContainer: UIContainerRect
    private portraitContainers: PortraitContainer[] = []
    private textContainer: DialogTextContainer
    private optionsContainer: OptionContainer

    constructor(dialogConfig: SimpleDialog.DialogConfig){
        this.actionsSequenceSystem = new ActionsSequenceSystem()
        engine.addSystem(this.actionsSequenceSystem)

        this.dialogContainer = new UIContainerRect(dialogConfig.canvas)
        this.dialogContainer.width = "100%"
        this.dialogContainer.height = "100%"

        this.portraitContainers.push(new PortraitContainer(dialogConfig.leftPortrait, this.dialogContainer))
        this.portraitContainers.push(new PortraitContainer(dialogConfig.rightPortrait, this.dialogContainer))

        this.textContainer = new DialogTextContainer(dialogConfig.dialogText, this.dialogContainer)
        this.optionsContainer = new OptionContainer(dialogConfig.optionsContainer, this.dialogContainer)

        this.hide()
    }

    startDialog(dialogTree: SimpleDialog.DialogTree){
        this.portraitContainers.forEach(portrait => {
            portrait.hide()
        });
        this.optionsContainer.hideAndClearOptions()
        this.show()
        dialogTree.simpleDialogInstance = this
        this.actionsSequenceSystem.startSequence(dialogTree.actionsSequenceBuilder)
    }

    isRunning(): boolean{
        return this.actionsSequenceSystem.isRunning()
    }

    setPortrait(portraitIndex: SimpleDialog.PortraitIndex, texture: Texture, imageConfig?: SimpleDialog.ImageConfig){
        this.portraitContainers[portraitIndex].setImage(texture, imageConfig)
    }

    setPortraitImageConfig(portraitIndex: SimpleDialog.PortraitIndex, imageConfig: SimpleDialog.ImageConfig){
        this.portraitContainers[portraitIndex].configPortraitImage(imageConfig)
    }

    setText(text: string, textConfig?: SimpleDialog.TextConfig){
        this.textContainer.text.value = text
        if (textConfig){
            configText(this.textContainer.text, textConfig)
            this.textContainer.config.textConfig = textConfig
        }
    }

    setTextConfig(textConfig: SimpleDialog.TextConfig){
        if (textConfig){
            configText(this.textContainer.text, textConfig)
            this.textContainer.config.textConfig = textConfig
        }
    }

    show(){
        this.dialogContainer.visible = true
    }

    hide(){
        this.dialogContainer.visible = false
    }

    showPortrait(portraitIndex: SimpleDialog.PortraitIndex){
        this.portraitContainers[portraitIndex].show()
    }

    hidePortrait(portraitIndex: SimpleDialog.PortraitIndex){
        this.portraitContainers[portraitIndex].hide()
    }

    getTextSpeed(): number{
        if (this.textContainer.config.textSpeed)
            return this.textContainer.config.textSpeed
        return 15
    }
}

export namespace SimpleDialog{
    export class DialogTree{
        actionsSequenceBuilder: ActionsSequenceSystem.SequenceBuilder
        simpleDialogInstance: SimpleDialog

        private optionsGroupStack: OptionsGroupData[] = []

        constructor(){
            this.actionsSequenceBuilder = new ActionsSequenceSystem.SequenceBuilder()
        }

        say(stringFunction: ()=>string, textConfig?: TextConfig): DialogTree{
            this.actionsSequenceBuilder.then(new SayWithCallbackAction(stringFunction, textConfig, ()=>this.simpleDialogInstance))
            return this
        }

        showPortrait(index: SimpleDialog.PortraitIndex, changeTexture?: Texture, changeConfig?: ImageConfig): DialogTree{
            this.actionsSequenceBuilder.then(new ShowPortraitAction(index, changeTexture, changeConfig, ()=>this.simpleDialogInstance))
            return this
        }

        hidePortrait(index: SimpleDialog.PortraitIndex): DialogTree{
            this.actionsSequenceBuilder.then(new HidePortraitAction(index, ()=>this.simpleDialogInstance))
            return this
        }
    
        if(condition: ()=>boolean): DialogTree{
            this.actionsSequenceBuilder.if(condition)
            return this
        }
    
        else(): DialogTree{
            this.actionsSequenceBuilder.else()
            return this
        }

        endif(): DialogTree{
            this.actionsSequenceBuilder.endIf()
            return this
        }
    
        beginOptionsGroup(): DialogTree{
            let groupData = new OptionsGroupData()
            this.optionsGroupStack.push(groupData)

            this.actionsSequenceBuilder.while(()=>true)
            this.actionsSequenceBuilder.if(()=>groupData.optionSelected != -1)
            this.actionsSequenceBuilder.endIf()
            return this
        }

        endOptionsGroup(): DialogTree{
            this.actionsSequenceBuilder.then(new WaitForInputAction(this.optionsGroupStack[this.optionsGroupStack.length-1]))
            this.actionsSequenceBuilder.endWhile()
            this.optionsGroupStack.splice(this.optionsGroupStack.length-1,1)
            return this
        }

        option(text: string): DialogTree{
            let group = this.optionsGroupStack[this.optionsGroupStack.length-1]
            let optionAction = new OptionAction(text, group)
            group.options.push(optionAction)
            this.actionsSequenceBuilder.if(()=>group.optionSelected == -1)
            this.actionsSequenceBuilder.then(optionAction)
            this.actionsSequenceBuilder.endIf()
            this.actionsSequenceBuilder.if(()=>optionAction.selected)
            this.actionsSequenceBuilder.then(new CallbackAction(()=>{optionAction.selected = false; group.optionSelected = -1}))
            return this
        }

        endOption(): DialogTree{
            this.actionsSequenceBuilder.breakWhile()
            this.actionsSequenceBuilder.endIf()
            return this
        }

        callback(callback:()=>void): DialogTree{
            this.actionsSequenceBuilder.then(new CallbackAction(callback))
            return this
        }
    }

    export class DialogConfig{
        canvas: UICanvas
        leftPortrait: PortraitConfig
        rightPortrait: PortraitConfig
        dialogText: DialogTextConfig
        optionsContainer: OptionsContainerConfig
    }

    export class PortraitConfig{
        hAlign?: string
        vAlign?: string
        width: string | number
        height: string | number
        positionX?: string | number
        positionY?: string | number
        sourceWidth?: number
        sourceHeight?: number
    }

    export class DialogTextConfig{
        textConfig?: TextConfig
        hAlign?: string
        vAlign?: string
        width: string | number
        height: string | number
        positionX?: string | number
        positionY?: string | number
        textSpeed?: number
    }

    export class OptionsContainerConfig{
        optionsTextConfig?: TextConfig
        adaptWidth?: boolean
        adaptHeight?: boolean
        color?: Color4
        stackOrientation?: UIStackOrientation
        spacing?: Number
        hAlign?: string
        vAlign?: string
        width?: string | number
        height?: string | number
        positionX?: string | number
        positionY?: string | number
    }

    export class ShapeConfig{
        hAlign?: string
        vAlign?: string
        width?: string | number
        height?: string | number
        positionX?: string | number
        positionY?: string | number
    }

    export class ImageConfig extends ShapeConfig{
        sourceLeft?: number
        sourceTop?: number
        sourceWidth?: number
        sourceHeight?: number
        paddingTop?: number
        paddingRight?: number
        paddingBottom?: number
        paddingLeft?: number
        sizeInPixels?: boolean
    }

    export class RectContainerConfig extends ShapeConfig{
        adaptWidth?: boolean
        adaptHeight?: boolean
        thickness?: number
        color?: Color4
        alignmentUsesSize?: boolean
    }

    export class TextConfig extends ShapeConfig{
        outlineWidth?: number;
        outlineColor?: Color4;
        color?: Color4;
        fontSize?: number;
        fontAutoSize?: boolean;
        fontWeight?: string;
        lineSpacing?: number;
        lineCount?: number;
        adaptWidth?: boolean;
        adaptHeight?: boolean;
        textWrapping?: boolean;
        shadowBlur?: number;
        shadowOffsetX?: number;
        shadowOffsetY?: number;
        shadowColor?: Color4;
        hTextAlign?: string;
        vTextAlign?: string;
        paddingTop?: number;
        paddingRight?: number;
        paddingBottom?: number;
        paddingLeft?: number;
    }

    export enum PortraitIndex {LEFT, RIGHT}
}

function configShape(shape: UIShape, shapeConfig: SimpleDialog.ShapeConfig) {
    if (shapeConfig.hAlign) shape.hAlign = shapeConfig.hAlign
    if (shapeConfig.vAlign) shape.vAlign = shapeConfig.vAlign
    if (shapeConfig.width) shape.width = shapeConfig.width
    if (shapeConfig.height) shape.height = shapeConfig.height
    if (shapeConfig.positionX) shape.positionX = shapeConfig.positionX
    if (shapeConfig.positionY) shape.positionY = shapeConfig.positionY
}

function configImage(image: UIImage, imageConfig: SimpleDialog.ImageConfig){
    configShape(image, imageConfig)
    if (imageConfig.sourceLeft) image.sourceLeft= imageConfig.sourceLeft
    if (imageConfig.sourceTop) image.sourceTop= imageConfig.sourceTop
    if (imageConfig.sourceWidth) image.sourceWidth= imageConfig.sourceWidth
    if (imageConfig.sourceHeight) image.sourceHeight= imageConfig.sourceHeight
    if (imageConfig.paddingTop ) image.paddingTop = imageConfig.paddingTop 
    if (imageConfig.paddingRight) image.paddingRight= imageConfig.paddingRight
    if (imageConfig.paddingBottom) image.paddingBottom= imageConfig.paddingBottom
    if (imageConfig.paddingLeft) image.paddingLeft= imageConfig.paddingLeft
    if (imageConfig.sizeInPixels) image.sizeInPixels= imageConfig.sizeInPixels        
}

function configRectContainer(container: UIContainerRect, containerConfig: SimpleDialog.RectContainerConfig){
    configShape(container, containerConfig)
    if(containerConfig.adaptWidth) container.adaptWidth = containerConfig.adaptWidth
    if(containerConfig.adaptHeight) container.adaptHeight = containerConfig.adaptHeight
    if(containerConfig.thickness) container.thickness = containerConfig.thickness
    if(containerConfig.color) container.color = containerConfig.color
    if(containerConfig.alignmentUsesSize) container.alignmentUsesSize = containerConfig.alignmentUsesSize
}

function configText(text: UIText, textConfig: SimpleDialog.TextConfig){
    configShape(text, textConfig)
    if(textConfig.outlineWidth) text.outlineWidth = textConfig.outlineWidth
    if(textConfig.outlineColor) text.outlineColor = textConfig.outlineColor
    if(textConfig.color) text.color = textConfig.color
    if(textConfig.fontSize) text.fontSize = textConfig.fontSize
    if(textConfig.fontAutoSize) text.fontAutoSize = textConfig.fontAutoSize
    if(textConfig.fontWeight) text.fontWeight = textConfig.fontWeight
    if(textConfig.lineSpacing) text.lineSpacing = textConfig.lineSpacing
    if(textConfig.lineCount) text.lineCount = textConfig.lineCount
    if(textConfig.adaptWidth) text.adaptWidth = textConfig.adaptWidth
    if(textConfig.adaptHeight) text.adaptHeight = textConfig.adaptHeight
    if(textConfig.textWrapping) text.textWrapping = textConfig.textWrapping
    if(textConfig.shadowBlur) text.shadowBlur = textConfig.shadowBlur
    if(textConfig.shadowOffsetX) text.shadowOffsetX = textConfig.shadowOffsetX
    if(textConfig.shadowOffsetY) text.shadowOffsetY = textConfig.shadowOffsetY
    if(textConfig.shadowColor) text.shadowColor = textConfig.shadowColor
    if(textConfig.hTextAlign) text.hTextAlign = textConfig.hTextAlign
    if(textConfig.vTextAlign) text.vTextAlign = textConfig.vTextAlign
    if(textConfig.paddingTop) text.paddingTop = textConfig.paddingTop
    if(textConfig.paddingRight) text.paddingRight = textConfig.paddingRight
    if(textConfig.paddingBottom) text.paddingBottom = textConfig.paddingBottom
    if(textConfig.paddingLeft) text.paddingLeft = textConfig.paddingLeft
}


class PortraitContainer{
    container: UIContainerRect
    image: UIImage
    config: SimpleDialog.PortraitConfig

    constructor(config: SimpleDialog.PortraitConfig, parent: UIContainerRect){
        this.config = config
        this.container = new UIContainerRect(parent)
        this.configPortrait(config)
    }

    configPortrait(config: SimpleDialog.PortraitConfig){
        if (config.hAlign) this.container.hAlign = config.hAlign
        if (config.vAlign) this.container.vAlign = config.vAlign
        if (config.positionX) this.container.positionX = config.positionX
        if (config.positionY) this.container.positionY = config.positionY
        if (config.height) this.container.height = config.height
        if (config.width) this.container.width = config.width
    }

    configPortraitImage(imageConfig: SimpleDialog.ImageConfig){
        configImage(this.image, imageConfig)
        if (imageConfig.sourceWidth == null && this.config.sourceWidth) this.image.sourceWidth = this.config.sourceWidth
        if (imageConfig.sourceHeight == null && this.config.sourceHeight) this.image.sourceHeight = this.config.sourceHeight
    }

    setImage(texture: Texture, imageConfig?: SimpleDialog.ImageConfig){
        if (this.image){
            this.image.source = texture
        }
        else{
            this.image = new UIImage(this.container, texture)
            if (this.config.sourceWidth) this.image.sourceWidth = this.config.sourceWidth
            if (this.config.sourceHeight) this.image.sourceHeight = this.config.sourceHeight
            this.image.width = "100%"
            this.image.height = "100%"
        }

        if (imageConfig){
            this.configPortraitImage(imageConfig)
        }
    }

    show(){
        this.container.visible = true
    }

    hide(){
        this.container.visible = false
    }

}

class DialogTextContainer{
    container: UIContainerRect
    text: UIText
    config: SimpleDialog.DialogTextConfig

    constructor(config: SimpleDialog.DialogTextConfig, parent: UIContainerRect){
        this.container = new UIContainerRect(parent)
        this.text = new UIText(this.container)
        this.text.width = "100%"
        this.text.height = "100%"
        this.text.hTextAlign = "left"
        this.text.vTextAlign = "center"
        this.text.textWrapping = true
        this.setConfig(config)
    }

    setConfig(config: SimpleDialog.DialogTextConfig){
        this.config = config
        if (config.hAlign) this.container.hAlign = config.hAlign
        if (config.vAlign) this.container.vAlign = config.vAlign
        if (config.positionX) this.container.positionX = config.positionX
        if (config.positionY) this.container.positionY = config.positionY
        if (config.height) this.container.height = config.height
        if (config.width) this.container.width = config.width

        if (config.textConfig) configText(this.text, config.textConfig)
    }
}

class OptionContainer{
    container : UIContainerStack
    options: {container: UIContainerRect, text: UIText, active: boolean}[] = []
    config: SimpleDialog.OptionsContainerConfig

    constructor(config: SimpleDialog.OptionsContainerConfig, parent: UIContainerRect){
        this.container = new UIContainerStack(parent)
        this.setConfig(config)
    }

    setConfig(config: SimpleDialog.OptionsContainerConfig){
        this.config = config
        if(config.adaptWidth) this.container.adaptWidth = config.adaptWidth
        if(config.adaptHeight) this.container.adaptHeight = config.adaptHeight
        if(config.color) this.container.color = config.color
        if(config.stackOrientation) this.container.stackOrientation = config.stackOrientation
        if(config.spacing) this.container.spacing = config.spacing
        if(config.hAlign) this.container.hAlign = config.hAlign
        if(config.vAlign) this.container.vAlign = config.vAlign
        if(config.width) this.container.width = config.width
        if(config.height) this.container.height = config.height
        if(config.positionX) this.container.positionX = config.positionX
        if(config.positionY) this.container.positionY = config.positionY

        this.options.forEach(option => {
            if (config.optionsTextConfig){
                configText(option.text, config.optionsTextConfig)
            }
            if(config.optionsTextConfig == null || config.optionsTextConfig.fontAutoSize == null){
                option.text.fontSize = 10
            }
        });
    }

    addOption(text: string){
        let optionData = null

        for (let i=0; i<this.options.length; i++){
            if (!this.options[i].active){
                optionData = this.options[i]
                break
            }
        }

        let container: UIContainerRect
        let uitext: UIText

        if (optionData != null){
            container = optionData.container
            uitext = optionData.text
            optionData.active = true
        }
        else{
            container = new UIContainerRect(this.container)
            uitext = new UIText(container)
        }

        uitext.value = text

        if (this.config.optionsTextConfig){
            configText(uitext, this.config.optionsTextConfig)
        }
        if(this.config.optionsTextConfig == null || this.config.optionsTextConfig.fontAutoSize == null){
            uitext.fontSize = 10
        }

        container.height = uitext.fontSize

        if (optionData == null){
            this.options.push({container: container, text: uitext, active: true})
        }
    }

    hideAndClearOptions(){
        for (let i=0; i<this.options.length; i++){
            this.options[i].active = false
        }
        this.container.visible = false
    }
}

class OptionsGroupData{
    optionSelected: number = -1
    options: OptionAction[] = []
}

class SayWithCallbackAction implements ActionsSequenceSystem.IAction{
    private callback: ()=>string
    private getDialogInstance: ()=>SimpleDialog
    private textConfig: SimpleDialog.TextConfig
    private charIndex: number
    private time: number
    private text: string
    private writting: boolean

    constructor(text: ()=>string, textConfig: SimpleDialog.TextConfig, getDialogInstance: ()=>SimpleDialog){
        this.callback = text
        this.textConfig = textConfig
        this.getDialogInstance = getDialogInstance
    }
    onStart(): void {
        if (this.textConfig) this.getDialogInstance().setTextConfig(this.textConfig)
        this.hasFinished = false
        this.charIndex = -1
        this.time = 0
        this.text = this.callback()
        this.writting = true
        this.getDialogInstance().setText("")
    }    
    update(dt: number): void {
        if (this.writting){
            this.time += dt * this.getDialogInstance().getTextSpeed()
            let floorTime = Math.ceil(this.time)
            if (floorTime > this.charIndex){
                this.charIndex = Scalar.Clamp(floorTime,0,this.text.length)
                if (this.charIndex >= this.text.length){
                    this.writting = false
                    this.time = 0
                }
                this.getDialogInstance().setText(this.text.substr(0,this.charIndex))
            }
        }
        else{
            this.time += dt
            if (this.time > 3){
                this.hasFinished = true
            }
        }

    }
    onFinish(): void {
    }
    hasFinished: boolean = false;
}

class OptionAction implements ActionsSequenceSystem.IAction{
    private text: string
    private id: number
    selected: boolean = false

    constructor(text: string, group: OptionsGroupData){
        this.text = text
        this.selected = false
        this.id = group.options.length
    }
    onStart(): void {
        log("OPTION "+ this.id + ": " + this.text)
        this.hasFinished = true
    }    
    update(dt: number): void {
    }
    onFinish(): void {
    }
    hasFinished: boolean = false;
}

class CallbackAction implements ActionsSequenceSystem.IAction{
    private callback: ()=>void
    constructor(callback: ()=>void){
        this.callback = callback
    }
    onStart(): void {
        if (this.callback)this.callback()
        this.hasFinished = true
    }    
    update(dt: number): void {
    }
    onFinish(): void {
    }
    hasFinished: boolean;
}

class WaitForInputAction implements ActionsSequenceSystem.IAction{
    private group: OptionsGroupData
    constructor(group: OptionsGroupData){
        this.group = group
    }
    onStart(): void {
        this.hasFinished = false
    }    
    update(dt: number): void {
        /*this.hasFinished = true
        this.group.options[0].selected = true
        this.group.optionSelected = 0*/
    }
    onFinish(): void {
    }
    hasFinished: boolean;
}

class ShowPortraitAction implements ActionsSequenceSystem.IAction{
    private getDialogInstance: ()=>SimpleDialog
    private changeTexture: Texture
    private changeConfig: SimpleDialog.ImageConfig
    private index: SimpleDialog.PortraitIndex

    constructor(index: SimpleDialog.PortraitIndex, changeTexture: Texture, changeConfig: SimpleDialog.ImageConfig, getDialogInstance: ()=>SimpleDialog){
        this.getDialogInstance = getDialogInstance
        this.changeTexture = changeTexture
        this.changeConfig = changeConfig
        this.index = index
    }
    onStart(): void {
        if (this.changeTexture){
            this.getDialogInstance().setPortrait(this.index, this.changeTexture, this.changeConfig)
        }
        else if (this.changeConfig){
            this.getDialogInstance().setPortraitImageConfig(this.index, this.changeConfig)            
        }
        this.getDialogInstance().showPortrait(this.index)
        this.hasFinished = true
    }    
    update(dt: number): void {
    }
    onFinish(): void {
    }
    hasFinished: boolean;
}

class HidePortraitAction implements ActionsSequenceSystem.IAction{
    private getDialogInstance: ()=>SimpleDialog
    private index: SimpleDialog.PortraitIndex

    constructor(index: SimpleDialog.PortraitIndex, getDialogInstance: ()=>SimpleDialog){
        this.getDialogInstance = getDialogInstance
        this.index = index
    }
    onStart(): void {
        this.getDialogInstance().hidePortrait(this.index)
        this.hasFinished = true
    }    
    update(dt: number): void {
    }
    onFinish(): void {
    }
    hasFinished: boolean;
}