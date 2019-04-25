export class ParticleSystem implements ISystem{
    private config: IEmitterConfig
    private availableParticles: ParticleInstance[] = []
    private aliveParticles: ParticleInstance[] = []
    private isRunning: boolean = false
    private runningTime: number
    private delayTime: number
    private timeForNextSpawn: number
    private parent: Transform = null
    private emitterPosition: Vector3 = Vector3.Zero()

    constructor(config: IEmitterConfig){
        this.config = config
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

    running(): boolean{
        return this.isRunning
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
            particleInstance.particleComponent.update(dt)
            if (!particleInstance.particleComponent.shouldBeAlive()){
                this.removeParticle(i)
            }
        }
    }

    private createParticles(config: IEmitterConfig){
        for (let i=0; i<config.maxParticles; i++){
            let entity = new Entity()
            let transform = new Transform()
            let particleProperties = new ParticleProperties(transform, this)

            let particle = new ParticleComponent(entity, config.particlesBehavior, particleProperties, config.particleLifeTime)

            entity.addComponent(new Billboard())
            entity.addComponent(new PlaneShape())
            entity.addComponent(transform)

            this.availableParticles.push({particleComponent:particle, particleEntity:entity})
        }
    }

    private spawnParticle() : boolean{
        if (this.availableParticles.length > 0){
            let particleInstance = this.availableParticles[0]
            this.availableParticles.splice(0,1)
            let spwnPosition = this.getSpawnPosition()
            particleInstance.particleComponent.spawn(this.getSpawnPosition())
            this.aliveParticles.push(particleInstance)
            engine.addEntity(particleInstance.particleEntity)
            return true
        }
        return false
    }

    private removeParticle(particleIndex: number){
        let particleInstance = this.aliveParticles[particleIndex]
        this.aliveParticles.splice(particleIndex, 1)
        this.availableParticles.push(particleInstance)
        engine.removeEntity(particleInstance.particleEntity)
    }

    private getSpawnPosition() : Vector3{        
        let getSpawnInIndex = (indexSize) =>{
            if (indexSize == 0) return 0
            else{
                let sign = Math.random() < 0.5? 1 : -1
                return Math.random() * indexSize * sign
            }
        }
        let spawnOffet = Vector3.Zero()
        spawnOffet.x = getSpawnInIndex(this.config.sourceSize.x)
        spawnOffet.y = getSpawnInIndex(this.config.sourceSize.y)
        spawnOffet.z = getSpawnInIndex(this.config.sourceSize.z)
        return this.position.add(spawnOffet)
    }
}

export interface IEmitterConfig{
    duration: number
    loop: boolean
    maxParticles: number
    startDelay: number
    sourceSize: Vector3
    particleSpawnInterval: number
    particleLifeTime: number
    particlesBehavior: IParticlesBehavior
}

export class ParticleProperties {
    private transform : Transform
    private material : Material
    private velocity : Vector3
    private emiterSystem: ParticleSystem
    private bundle : any

    constructor(transform: Transform, emiterSystem: ParticleSystem){
        this.transform = transform
        this.emiterSystem = emiterSystem
    }

    setPosition(position: Vector3){
        this.transform.position = position
    }

    getPosition(): Vector3{
        return this.transform.position
    }

    setRotation(rotation: Quaternion){
        this.transform.rotation = rotation
    }

    getRotation(): Quaternion{
        return this.transform.rotation
    }

    setScale(scale: Vector3){
        this.transform.scale = scale
    }

    getScale(): Vector3{
        return this.transform.scale
    }

    setVelocity(velocity: Vector3){
        this.velocity = velocity
    }

    getVelocity(): Vector3{
        return this.velocity
    }

    getMaterial(): Material{
        return this.material
    }

    setColor(color: Color4){
        if (this.material != null){
            this.material.albedoColor = new Color3(color.r, color.g, color.b)
            if (this.material.hasAlpha) this.material.alpha = color.a
        }
    }

    setMaterial(material: Material){
        this.material = material
    }

    setBundle(bundle){
        this.bundle = bundle
    }

    getBundle(): any{
        return this.bundle
    }

    getEmiterPosition(): Vector3{
        return this.emiterSystem.position
    }
}

export interface IParticlesBehavior{
    onCreate(particleEntity: Readonly<Entity>, properties: Readonly<ParticleProperties>)
    onSpawn(properties: Readonly<ParticleProperties>)
    onUpdate(properties: Readonly<ParticleProperties>, lifeTimeRatio: number)
}

export class BasicParticlesBehavior implements IParticlesBehavior{
    startVelocity: Vector3
    endVelocity: Vector3 = null
    startScale: Vector3 = null
    endScale: Vector3 = null
    startRotation: Quaternion = null
    endRotation: Quaternion = null
    material: Material

    constructor(material: Material, startVelocity?: Vector3, startRotation?: Quaternion, startScale?: Vector3, startColor?: Color4,
    endVelocity?: Vector3, endRotation?: Quaternion, endScale?: Vector3){
        this.startVelocity = startVelocity
        this.endVelocity = endVelocity
        this.startScale = startScale
        this.endScale = endScale 
        this.material = material
        this.startRotation = startRotation
        this.endRotation = endRotation
    }

    onCreate(particleEntity: Readonly<Entity>, properties: Readonly<ParticleProperties>){
        if (this.startVelocity == null) this.startVelocity = Vector3.Zero()
        if (this.startRotation == null) this.startRotation = Quaternion.Identity
        if (this.startScale == null) this.startScale = Vector3.One()
        particleEntity.addComponent(this.material)
        properties.setMaterial(this.material)
    }

    onSpawn(properties: Readonly<ParticleProperties>){
        properties.setVelocity(this.startVelocity)
        properties.setRotation(this.startRotation)
        properties.setScale(this.startScale)
    }

    onUpdate(properties: Readonly<ParticleProperties>, lifeTimeRatio: number){
        this.updateVelocity(properties, lifeTimeRatio)
        this.updateRotatio(properties, lifeTimeRatio)
        this.updateScale(properties, lifeTimeRatio)
    }

    private updateVelocity(properties: Readonly<ParticleProperties>, lifeTimeRatio: number){
        if (this.endVelocity != null){
            properties.setVelocity(Vector3.Lerp(this.startVelocity, this.endVelocity, lifeTimeRatio))
        }
    }
    private updateRotatio(properties: Readonly<ParticleProperties>, lifeTimeRatio: number){
        if (this.endRotation != null){
            properties.setRotation(Quaternion.Slerp(this.startRotation, this.endRotation, lifeTimeRatio))
        }
    }
    private updateScale(properties: Readonly<ParticleProperties>, lifeTimeRatio: number){
        if (this.endScale != null){
            properties.setScale(Vector3.Lerp(this.startScale, this.endScale, lifeTimeRatio))
        }
    }
}


Component("particleComponent")
class ParticleComponent{
    private particleBehavior: IParticlesBehavior
    private particleProperties: Readonly<ParticleProperties>
    private particleAliveTime: number = 0
    private particleLifeTime: number

    constructor(particleEntity: Readonly<Entity>, particleBehavior: Readonly<IParticlesBehavior>, 
    particleProperties:Readonly<ParticleProperties>, particleLifeTime: number){
        this.particleBehavior = particleBehavior
        this.particleProperties = particleProperties
        this.particleLifeTime = particleLifeTime
        particleBehavior.onCreate(particleEntity, particleProperties)
        this.reset()
    }

    spawn(position: Vector3){
        this.particleProperties.setPosition(position)
        this.particleBehavior.onSpawn(this.particleProperties)
        this.reset()
    }

    update(dt: number){
        this.particleAliveTime += dt
        let lifeTimeRatio = Scalar.Clamp(this.particleAliveTime / this.particleLifeTime, 0, 1)
        this.particleProperties.setPosition(this.particleProperties.getPosition().add(this.particleProperties.getVelocity().scale(dt)))
        this.particleBehavior.onUpdate(this.particleProperties, lifeTimeRatio)
    }

    reset(){
        this.particleAliveTime = 0
    }

    shouldBeAlive(): boolean{
        return this.particleAliveTime < this.particleLifeTime
    }
}

class ParticleInstance{
    particleComponent: ParticleComponent
    particleEntity: Entity
}