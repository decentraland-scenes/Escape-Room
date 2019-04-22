export class ParticleSystem implements ISystem{
    private config: EmitterConfig
    private availableParticles: ParticleInstance[] = []
    private aliveParticles: ParticleInstance[] = []
    private isRunning: boolean = false
    private runningTime: number
    private delayTime: number
    private timeForNextSpawn: number
    private parent: Transform = null
    private emitterPosition: Vector3 = Vector3.Zero()

    constructor(config: EmitterConfig){
        this.createParticles(config)
    }

    start(){
        this.isRunning = true
        this.delayTime = this.config.startDelay
        this.timeForNextSpawn = 0
        this.runningTime = 0
    }

    stop(){
        this.isRunning = false
    }

    setParent(parent: Transform){
        this.parent = parent
    }

    set position(value: Vector3){
        this.emitterPosition = value
    }

    get position() : Vector3{
        if (this.parent != null){
            return this.parent.position.add(this.emitterPosition)
        }
        return this.emitterPosition
    }

    update(dt: number){
        if (this.isRunning){
            if (this.delayTime > 0){
                this.delayTime -= dt
            }
            else{
                this.runningTime += dt
                this.timeForNextSpawn -= dt
                if (this.timeForNextSpawn <= 0){
                    if (this.config.particleSpawnInterval <=0){
                        while(this.spawnParticle()){}
                    }
                    else if (this.spawnParticle()){
                        this.timeForNextSpawn = this.config.particleSpawnInterval
                    }
                }
                if (this.runningTime > this.config.duration && !this.config.loop){
                    this.stop()
                }
            }
        }
        for (let i=this.aliveParticles.length-1; i>=0; i--){
            let particleInstance = this.aliveParticles[i]
            particleInstance.particleComponent.updateParticle(this.position, dt)
            if (!particleInstance.particleComponent.shouldBeAlive()){
                this.removeParticle(i)
            }
        }
    }

    private createParticles(config: EmitterConfig){
        for (let i=0; i<config.maxParticles; i++){
            let entity = new Entity()
            let transform = new Transform()
            let material = new Material()
            material.albedoTexture = new Texture(config.texturePath)
            let particle = new ParticleComponent(config.particleConfig, transform, material)

            entity.addComponent(new Billboard())
            entity.addComponent(new PlaneShape())
            entity.addComponent(transform)
            entity.addComponent(material)

            this.availableParticles.push({particleComponent:particle, particleEntity:entity})
        }
    }

    private spawnParticle() : boolean{
        let particleInstance = this.aliveParticles.pop()
        if (particleInstance != null){
            particleInstance.particleComponent.reset()
            this.aliveParticles.push(particleInstance)
            engine.addEntity(particleInstance.particleEntity)
            return true
        }
        return false
    }

    private removeParticle(particleIndex: number){
        let particleInstance = this.aliveParticles[particleIndex]
        this.aliveParticles.splice(particleIndex, particleIndex)
        this.availableParticles.push(particleInstance)
        engine.removeEntity(particleInstance.particleEntity)
    }
}

export class EmitterConfig{
    duration: number
    loop: boolean
    maxParticles: number
    texturePath: string
    startDelay: number
    particleSpawnInterval: number
    particleConfig: IParticleConfig
}

interface IParticleConfig{
    getColor(lifetimeRatio : number): Color4
    getScale(lifetimeRatio : number): Vector3
    getVelocity(lifetimeRatio : number): Vector3
    getStartPosition(): Vector3
    getLifeTime(): number
}

export class ParticleConfig implements IParticleConfig{
    startScale: Vector3 = Vector3.One()
    endScale: Vector3 = Vector3.One()
    velocity: Vector3 = Vector3.Up()
    startPosition : Vector3 = Vector3.Zero()
    startColor: Color4 = Color3.White().toColor4(1)
    endColor: Color4 = Color3.White().toColor4(1)
    lifeTime: number = 2

    getScale(lifetimeRatio : number): Vector3 {
        return Vector3.Lerp(this.startScale, this.endScale, lifetimeRatio)
    }
    getVelocity(lifetimeRatio : number): Vector3 {
        return this.velocity
    }
    getColor(lifetimeRatio : number): Color4{
        return Color4.Lerp(this.startColor, this.endColor, lifetimeRatio)
    }
    getStartPosition(): Vector3 {
        return this.startPosition
    }
    getLifeTime(): number {
        return this.lifeTime
    }
}

Component("particleComponent")
class ParticleComponent{
    private particleConfig: IParticleConfig
    private particleLifeTime: number = 0
    private particleTransform: Transform
    private particleMaterial: Material

    constructor(particleConfig: IParticleConfig, particleTransform: Transform, particleMaterial: Material){
        this.particleConfig = particleConfig
        this.particleTransform = particleTransform
        this.particleMaterial = particleMaterial
        this.reset()
    }

    updateParticle(emitterPosition: Vector3, dt: number){
        this.particleLifeTime += dt

        let lifeTimeRatio = Scalar.Clamp(this.particleLifeTime/this.particleConfig.getLifeTime(), 0, 1)

        this.particleTransform.scale = this.particleConfig.getScale(lifeTimeRatio)
        this.particleTransform.position = this.particleTransform.position.add(this.particleConfig.getVelocity(lifeTimeRatio).multiplyByFloats(dt,dt,dt))

        let newColor = this.particleConfig.getColor(lifeTimeRatio)
        let oldColor = this.particleMaterial.albedoColor
        if (newColor.r != oldColor.r || newColor.g != oldColor.g || newColor.b != oldColor.b){
            this.particleMaterial.albedoColor = new Color3(newColor.r, newColor.g, newColor.b)
        }
        if (this.particleMaterial.alpha != newColor.a){
            this.particleMaterial.alpha = newColor.a
        }

    }

    reset(){
        this.particleLifeTime = 0
        this.particleTransform.scale = this.particleConfig.getScale(0)
        this.particleTransform.position = this.particleConfig.getStartPosition()

        let color = this.particleConfig.getColor(0)
        this.particleMaterial.albedoColor = new Color3(color.r, color.g, color.b)
        this.particleMaterial.alpha = color.a
    }

    shouldBeAlive(): boolean{
        return this.particleLifeTime < this.particleConfig.getLifeTime()
    }
}

class ParticleInstance{
    particleComponent: ParticleComponent
    particleEntity: Entity
}