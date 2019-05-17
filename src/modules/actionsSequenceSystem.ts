export class ActionsSequenceSystem implements ISystem{
    private beginSequenceNode : SequenceNode = null

    setSequence(sequenceBuilt: ActionsSequenceSystem.SequenceBuilder){
        this.beginSequenceNode = sequenceBuilt.beginSequenceNode
    }

    update(dt: number): void{
    }
}

export namespace ActionsSequenceSystem {

    export interface IAction{
        onStart(): void,
        update(dt: number): void,
        onFinish(): void,
        hasFinished : boolean
    }

    export class SequenceBuilder{
        private currentSequenceNode : SequenceNode = null
        public beginSequenceNode : SequenceNode = null
    
        then(action: ActionsSequenceSystem.IAction): SequenceBuilder{
            if (this.currentSequenceNode == null){
                this.currentSequenceNode = new SequenceNode()
                this.currentSequenceNode.action = action
                this.beginSequenceNode = this.currentSequenceNode
            }
            else{
                this.currentSequenceNode = this.currentSequenceNode.then(action)
            }
            return this
        }
    
        if (condition: ()=>boolean): SequenceBuilder{
            let ifSeq = new IfSequenceNode(condition)
            if (this.currentSequenceNode != null){
                this.currentSequenceNode.next = ifSeq
            }
            else{
                this.beginSequenceNode = ifSeq
            }
            this.currentSequenceNode = ifSeq
            return this
        }
    
        else (): SequenceBuilder{
            if (this.currentSequenceNode instanceof IfSequenceNode){
                let elseSeq = new ElseSequenceNode(this.currentSequenceNode)
                this.currentSequenceNode.next = elseSeq
                this.currentSequenceNode = elseSeq
            }
            else{
                throw new Error("IF statement is needed to be called before ELSE statement.");
            }
            return this
        }
    
        endIf (): SequenceBuilder{
            if (this.currentSequenceNode instanceof IfSequenceNode || this.currentSequenceNode instanceof ElseSequenceNode){
                let endifSeq = new SequenceNode()
                this.currentSequenceNode.next = endifSeq
                this.currentSequenceNode = endifSeq
            }
            else{
                throw new Error("IF statement is needed to be called before ENDIF statement.");
            }
            return this
        }
    
        while (condition: ()=>boolean): SequenceBuilder{
            let whileSeq = new WhileSequenceNode(condition)
            if (this.currentSequenceNode != null){
                this.currentSequenceNode.next = whileSeq
            }
            else{
                this.beginSequenceNode = whileSeq
            }
            this.currentSequenceNode = whileSeq
            return this
        }
    
        endWhile (): SequenceBuilder{
            if (this.currentSequenceNode instanceof WhileSequenceNode){
                let endWhileSeq = new SequenceNode()
                this.currentSequenceNode.next = endWhileSeq
                this.currentSequenceNode = endWhileSeq
            }
            else{
                throw new Error("WHILE statement is needed to be called before ENDWHILE statement.");
            }
            return this
        }        
    }
}


class SequenceNode {
    action: ActionsSequenceSystem.IAction = null
    next: SequenceNode = null

    then(action: ActionsSequenceSystem.IAction) : SequenceNode{
        this.next = new SequenceNode()
        this.next.action = action
        return this.next
    }
}

class SubSequenceNode extends SequenceNode {
    currentSequence: SequenceNode = null
    startingSequence: SequenceNode = null

    then(action: ActionsSequenceSystem.IAction) : SequenceNode{
        if (this.currentSequence == null){
            this.currentSequence = new SequenceNode()
            this.currentSequence.action = action
            this.startingSequence = this.currentSequence
        }
        else{
            this.currentSequence = this.currentSequence.then(action)
        }
        return this
    }
}

class IfSequenceNode extends SubSequenceNode {
    condition: ()=> boolean

    constructor(condition: ()=> boolean){
        super()
        this.condition = condition
    }
}

class ElseSequenceNode extends SubSequenceNode {
    ifSequence: SequenceNode = null

    constructor(ifSequence: SequenceNode){
        super()
        this.ifSequence = ifSequence
    }
}

class WhileSequenceNode extends SubSequenceNode {
    condition: ()=> boolean

    constructor(condition: ()=> boolean){
        super()
        this.condition = condition
    }
}