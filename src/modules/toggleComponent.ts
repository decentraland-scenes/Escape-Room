export const enum ToggleState { Off = 0 , On }

@Component("toggle")
export class ToggleComponent{
    public enabled: boolean = true

    private setCallback : (value: ToggleState) => void
    private state : ToggleState

    constructor(startingState: ToggleState = ToggleState.On, onValueChangedCallback : (value: ToggleState) => void = null){
        this.set(startingState)
        this.onValueChanged(onValueChangedCallback)
    }

    public set(state : ToggleState): void{
        this.state = state
        if (this.setCallback)this.setCallback(state)
    }

    public toggle(): void{
        if (this.enabled){
            this.set(1-this.state)
        }
    }

    public isOn(): boolean{
        return this.state == ToggleState.On
    }

    public onValueChanged(onValueChangedCallback : (value: ToggleState) => void): void{
        this.setCallback = onValueChangedCallback
    }
}