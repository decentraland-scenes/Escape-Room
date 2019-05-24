import { ActionsSequenceSystem } from "./actionsSequenceSystem";

export class SimpleDialog{
    private actionsSequenceSystem: ActionsSequenceSystem

    private dialogContainer: UIContainerRect
    private portraitContainers: PortraitContainer[] = []
    private textContainer: DialogTextContainer
    private optionsContainer: OptionContainer

    private onFinishCallback: ()=>void

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
        this.hideOptions()
        this.show()
        dialogTree.simpleDialogInstance = this
        this.actionsSequenceSystem.startSequence(dialogTree.actionsSequenceBuilder)
        this.actionsSequenceSystem.setOnFinishCallback(()=>{
            if(this.onFinishCallback) this.onFinishCallback()
            this.hide()
        })
    }

    setFinishCallback(onFinishCallback: ()=>void){
        this.onFinishCallback = onFinishCallback
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

    addOption(text: string, callback: ()=>void){
        this.optionsContainer.addOption(text, callback)
    }

    showOptions(){
        this.optionsContainer.show()
    }

    hideOptions(){
        this.optionsContainer.hideAndClearOptions()
    }

    getDialogTextContainer(): UIContainerRect{
        return this.textContainer.container
    }

    getOptionsContainer(): UIContainerStack{
        return this.optionsContainer.optionsStack
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
            //this.actionsSequenceBuilder.if(()=>groupData.optionSelected != -1)
            //this.actionsSequenceBuilder.endIf()
            return this
        }

        endOptionsGroup(): DialogTree{
            this.actionsSequenceBuilder.then(new WaitForInputAction(this.optionsGroupStack[this.optionsGroupStack.length-1], ()=>this.simpleDialogInstance))
            this.actionsSequenceBuilder.endWhile()
            this.optionsGroupStack.splice(this.optionsGroupStack.length-1,1)
            return this
        }

        option(stringFunction: ()=>string): DialogTree{
            let group = this.optionsGroupStack[this.optionsGroupStack.length-1]
            let optionAction = new OptionAction(stringFunction, ()=>this.simpleDialogInstance)
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

        call(callback:()=>void): DialogTree{
            this.actionsSequenceBuilder.then(new CallbackAction(callback))
            return this
        }

        customAction(action: ActionsSequenceSystem.IAction): DialogTree{
            this.actionsSequenceBuilder.then(action)
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
        background?: Texture
        backgroundConfig?: ImageConfig
    }

    export class OptionsContainerConfig{
        optionsTextConfig?: TextConfig
        adaptWidth?: boolean
        adaptHeight?: boolean
        color?: Color4
        stackOrientation?: UIStackOrientation
        spacing?: number
        hAlign?: string
        vAlign?: string
        width?: string | number
        height?: string | number
        positionX?: string | number
        positionY?: string | number
        background?: Texture
        backgroundConfig?: ImageConfig
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
        if (config.background){
            let bg = new UIImage(this.container, config.background)
            bg.width = "100%"
            bg.height = "100%"
            if (config.backgroundConfig) configImage(bg, config.backgroundConfig)
        }

        this.text = new UIText(this.container)
        this.text.width = "100%"
        this.text.height = "100%"
        this.text.hTextAlign = "left"
        this.text.vTextAlign = "center"
        this.text.textWrapping = true
        if (config.textConfig) configText(this.text, config.textConfig)
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

class OptionContainerData{
    image: UIImage
    text: UIText
    active: boolean
    callback: ()=>void
}

class OptionContainer{
    container: UIContainerRect
    optionsStack: UIContainerStack
    background: UIImage
    options: OptionContainerData[] = []
    config: SimpleDialog.OptionsContainerConfig

    constructor(config: SimpleDialog.OptionsContainerConfig, parent: UIContainerRect){
        this.container = new UIContainerRect(parent)
        this.background = new UIImage(this.container, null)
        this.background.opacity = 0
        this.background.width = "100%"
        this.background.height = "100%"

        this.optionsStack = new UIContainerStack(this.container)
        this.optionsStack.adaptHeight = false
        this.optionsStack.adaptWidth = false
        this.optionsStack.width = "100%"
        this.optionsStack.height = "100%"
        this.setConfig(config)
    }

    setConfig(config: SimpleDialog.OptionsContainerConfig){
        this.config = config
        if(config.adaptWidth) this.optionsStack.adaptWidth = config.adaptWidth
        if(config.adaptHeight) this.optionsStack.adaptHeight = config.adaptHeight
        if(config.color) this.container.color = config.color
        if(config.spacing) this.optionsStack.spacing = config.spacing
        if(config.stackOrientation) this.optionsStack.stackOrientation = config.stackOrientation
        if(config.hAlign) this.container.hAlign = config.hAlign
        if(config.vAlign) this.container.vAlign = config.vAlign
        if(config.width) this.container.width = config.width
        if(config.height) this.container.height = config.height
        if(config.positionX) this.container.positionX = config.positionX
        if(config.positionY) this.container.positionY = config.positionY

        if (config.background){
            if (this.background){
                this.background.source = config.background
                this.background.opacity = 1
            }
            if (config.backgroundConfig){
                configImage(this.background, config.backgroundConfig)
            }
        }

        this.options.forEach(option => {
            if (config.optionsTextConfig){
                configText(option.text, config.optionsTextConfig)
            }
            if(config.optionsTextConfig == null || config.optionsTextConfig.fontAutoSize == null){
                option.text.fontSize = 10
            }
        });
    }

    addOption(text: string, callback: ()=>void){
        let optionData: OptionContainerData = null
        const defaultFontSize = 10

        for (let i=0; i<this.options.length; i++){
            if (!this.options[i].active){
                optionData = this.options[i]
                break
            }
        }

        let uitext: UIText
        let uiImage: UIImage

        if (optionData != null){
            uitext = optionData.text
            uiImage = optionData.image
            optionData.active = true
            uiImage.visible = false
        }
        else{
            uitext = new UIText(this.optionsStack)
            uiImage = new UIImage(uitext, null)
            
            uitext.adaptHeight = true
            uitext.adaptWidth = true
            uitext.fontSize = defaultFontSize

            uiImage.width = "100%"
            uiImage.height = "100%"
            uiImage.opacity = 0
        }

        uiImage.onClick = new OnClick(callback)
        uiImage.paddingLeft = uitext.paddingLeft
        uiImage.paddingRight = uitext.paddingRight
        uiImage.paddingTop = uitext.paddingTop
        uiImage.paddingBottom = uitext.paddingBottom

        uitext.value = text

        if (this.config.optionsTextConfig){
            configText(uitext, this.config.optionsTextConfig)
        }
        if(this.config.optionsTextConfig == null || this.config.optionsTextConfig.fontSize == null){
            uitext.fontSize = defaultFontSize
        }

        if (optionData == null){
            optionData = {text: uitext, active: true, callback: callback, image: uiImage}
            this.options.push(optionData)
        }
        else{
            optionData.callback = callback
        }
    }

    hideAndClearOptions(){
        for (let i=0; i<this.options.length; i++){
            this.options[i].active = false
            this.options[i].image.visible = false
        }
        this.container.visible = false
    }

    show(){
        for (let i=0; i<this.options.length; i++){
            if(this.options[i].active){
                this.options[i].image.visible = true
            }
        }
        this.container.visible = true
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
    private textCallback: ()=>string
    private getDialogInstance: ()=>SimpleDialog
    selected: boolean = false

    constructor(textCallback: ()=>string, getDialogInstance: ()=>SimpleDialog){
        this.textCallback = textCallback
        this.getDialogInstance = getDialogInstance
        this.selected = false
    }
    onStart(): void {
        this.getDialogInstance().addOption(this.textCallback(), ()=>{
            this.selected = true
        })
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
    private getDialogInstance: ()=>SimpleDialog
    constructor(group: OptionsGroupData,getDialogInstance: ()=>SimpleDialog){
        this.group = group
        this.getDialogInstance = getDialogInstance
    }
    onStart(): void {
        this.hasFinished = false
        this.getDialogInstance().showOptions()
    }    
    update(dt: number): void {
        for (let i=0; i<this.group.options.length; i++){
            if (this.group.options[i].selected){
                this.group.optionSelected = i
                this.hasFinished = true
                this.getDialogInstance().hideOptions()
                break
            }
        }
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