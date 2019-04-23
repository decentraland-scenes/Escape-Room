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
            particleInstance.particleComponent.updateParticle(dt, this.position)
            if (!particleInstance.particleComponent.shouldBeAlive()){
                this.removeParticle(i)
            }
        }
    }

    private createParticles(config: IEmitterConfig){
        for (let i=0; i<config.maxParticles; i++){
            let entity = new Entity()
            let transform = new Transform()
            let material = config.particlesMaterials[i % config.particlesMaterials.length]

            if (config.useMaterialClone){
                material = this.cloneMaterial(material)
            }

            let particle = new ParticleComponent(config.particleConfig, transform, material)

            entity.addComponent(new Billboard())
            entity.addComponent(new PlaneShape())
            entity.addComponent(transform)
            entity.addComponent(material)

            this.availableParticles.push({particleComponent:particle, particleEntity:entity})
        }
    }

    private spawnParticle() : boolean{
        if (this.availableParticles.length > 0){
            let particleInstance = this.availableParticles[0]
            this.availableParticles.splice(0,1)
            particleInstance.particleComponent.reset()
            particleInstance.particleComponent.setSourcePosition(this.position)
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

    private cloneMaterial(source: Material): Material{
        let mat = new Material()
        mat.albedoColor = source.albedoColor
        mat.albedoTexture = source.albedoTexture
        mat.alpha = source.alpha
        mat.alphaTexture = source.albedoTexture
        mat.ambientColor = source.ambientColor
        mat.bumpTexture = source.bumpTexture
        mat.directIntensity = source.directIntensity
        mat.disableLighting = source.disableLighting
        mat.emissiveColor = source.emissiveColor
        mat.emissiveIntensity = source.emissiveIntensity
        mat.emissiveTexture = source.emissiveTexture
        mat.environmentIntensity = source.environmentIntensity
        mat.hasAlpha = source.hasAlpha
        mat.metallic = source.metallic
        mat.microSurface = source.microSurface
        mat.reflectionColor = source.reflectionColor
        mat.reflectivityColor = source.reflectivityColor
        mat.refractionTexture = source.refractionTexture
        mat.roughness = source.roughness
        mat.specularIntensity = source.specularIntensity
        mat.transparencyMode = source.transparencyMode
        return mat
    }
}

export interface IEmitterConfig{
    duration: number
    loop: boolean
    maxParticles: number
    particlesMaterials: Material[]
    startDelay: number
    particleSpawnInterval: number
    useMaterialClone: boolean
    particleConfig: IParticleConfig
}

export interface IParticleConfig{
    getColor(particleInitialPosition: ReadOnlyVector3, particleCurrentPosition: ReadOnlyVector3, emitterPosition: ReadOnlyVector3, lifetimeRatio: number): Color4
    getScale(particleInitialPosition: ReadOnlyVector3, particleCurrentPosition: ReadOnlyVector3, emitterPosition: ReadOnlyVector3, lifetimeRatio: number): Vector3
    getVelocity(particleInitialPosition: ReadOnlyVector3, particleCurrentPosition: ReadOnlyVector3, emitterPosition: ReadOnlyVector3, lifetimeRatio: number): Vector3
    getStartPosition(): Vector3
    getLifeTime(): number
}

export class ParticleBasicConfig implements IParticleConfig{
    startScale: IParticleVector3Value
    endScale: IParticleVector3Value
    velocity: IParticleVector3Value
    startPosition : IParticleVector3Value
    startColor: Color4 = null
    endColor: Color4 = null
    lifeTime: number = 2

    constructor(lifeTime: number, velocity?: Vector3 | RandomVector3 | RandomOnceVector3, startPosition?: Vector3 | RandomVector3 | RandomOnceVector3, 
    startColor?: Color4, endColor?: Color4, startScale?: Vector3 | RandomVector3 | RandomOnceVector3, endScale?: Vector3 | RandomVector3 | RandomOnceVector3){
        this.lifeTime = lifeTime
        if (velocity){
            if (velocity instanceof Vector3){
                this.velocity = new JustVector3(velocity)
            }
            else{
                this.velocity = velocity
            }
        }
        else{
            this.velocity = new JustVector3(Vector3.Zero())
        }

        if (startPosition){
            if (startPosition instanceof Vector3){
                this.startPosition = new JustVector3(startPosition)
            }
            else{
                this.startPosition = startPosition
            }
        }
        else{
            this.startPosition = new JustVector3(Vector3.Zero())
        }

        this.startColor = startColor
        this.endColor = endColor

        if (startScale){
            if (startScale instanceof Vector3){
                this.startScale = new JustVector3(startScale)
            }
            else{
                this.startScale = startScale
            }
        }
        else{
            this.startScale = new JustVector3(Vector3.One())
        }

        if (endScale){
            if (endScale instanceof Vector3){
                this.endScale = new JustVector3(endScale)
            }
            else{
                this.endScale = endScale
            }
        }
        else{
            this.endScale = new JustVector3(Vector3.One())
        }
    }

    getScale(particleInitialPosition: ReadOnlyVector3, particleCurrentPosition: ReadOnlyVector3, emitterPosition: ReadOnlyVector3, lifetimeRatio: number): Vector3 {
        return Vector3.Lerp(this.startScale.getValue(), this.endScale.getValue(), lifetimeRatio)
    }
    getVelocity(particleInitialPosition: ReadOnlyVector3, particleCurrentPosition: ReadOnlyVector3, emitterPosition: ReadOnlyVector3, lifetimeRatio: number): Vector3 {
        return this.velocity.getValue()
    }
    getColor(particleInitialPosition: ReadOnlyVector3, particleCurrentPosition: ReadOnlyVector3, emitterPosition: ReadOnlyVector3, lifetimeRatio: number): Color4{
        if (this.startColor != null && this.endColor != null){
            return Color4.Lerp(this.startColor, this.endColor, lifetimeRatio)
        }
        return null
    }
    getStartPosition(): Vector3 {
        return this.startPosition.getValue()
    }
    getLifeTime(): number {
        return this.lifeTime
    }
}

interface IParticleVector3Value{
    getValue(): Vector3
}

class JustVector3 implements IParticleVector3Value{
    value: Vector3

    constructor(value: ReadOnlyVector3){
        this.value = new Vector3(value.x, value.y, value.z)
    }

    getValue(): Vector3 {
        return this.value
    }
}

export class RandomVector3 implements IParticleVector3Value{
    minValue: ReadOnlyVector3
    maxValue: ReadOnlyVector3

    constructor(minValue: ReadOnlyVector3, maxValue: ReadOnlyVector3){
        this.minValue = minValue
        this.maxValue = maxValue
    }

    getValue(): Vector3{
        let ret = new Vector3()
        ret.x = this.minValue.x + (this.maxValue.x - this.minValue.x) * Math.random()
        ret.y = this.minValue.y + (this.maxValue.y - this.minValue.y) * Math.random()
        ret.z = this.minValue.z + (this.maxValue.z - this.minValue.z) * Math.random()
        return ret
    }
}

export class RandomOnceVector3 implements IParticleVector3Value{
    value: Vector3

    constructor(minValue: ReadOnlyVector3, maxValue: ReadOnlyVector3){
        this.value = new Vector3()
        this.value.x = minValue.x + (maxValue.x - minValue.x) * Math.random()
        this.value.y = minValue.y + (maxValue.y - minValue.y) * Math.random()
        this.value.z = minValue.z + (maxValue.z - minValue.z) * Math.random()
    }

    getValue(): Vector3{
        return this.value
    }
}

Component("particleComponent")
class ParticleComponent{
    private particleConfig: IParticleConfig
    private particleLifeTime: number = 0
    private particleTransform: Transform
    private particleMaterial: Material
    private particleInitialPosition: Vector3

    constructor(particleConfig: IParticleConfig, particleTransform: Transform, particleMaterial: Material){
        this.particleConfig = particleConfig
        this.particleTransform = particleTransform
        this.particleMaterial = particleMaterial
        this.reset()
    }

    updateParticle(dt: number, emitterPosition: Vector3){
        this.particleLifeTime += dt

        let lifeTimeRatio = Scalar.Clamp(this.particleLifeTime/this.particleConfig.getLifeTime(), 0, 1)

        this.particleTransform.scale = this.particleConfig.getScale(this.particleInitialPosition,this.particleTransform.position, emitterPosition, lifeTimeRatio)
        this.particleTransform.position = this.particleTransform.position.add(
            this.particleConfig.getVelocity(this.particleInitialPosition,this.particleTransform.position, emitterPosition, lifeTimeRatio).multiplyByFloats(dt,dt,dt))

        let newColor = this.particleConfig.getColor(this.particleInitialPosition,this.particleTransform.position, emitterPosition, lifeTimeRatio)
        if (newColor != null){
            let oldColor = this.particleMaterial.albedoColor
            if (newColor.r != oldColor.r || newColor.g != oldColor.g || newColor.b != oldColor.b){
                this.particleMaterial.albedoColor = new Color3(newColor.r, newColor.g, newColor.b)
            }
            if (this.particleMaterial.alpha != newColor.a){
                this.particleMaterial.alpha = newColor.a
            }
        }
    }

    reset(emitterPosition: Vector3 = Vector3.Zero()){
        this.particleLifeTime = 0
        this.particleTransform.position = emitterPosition.add(this.particleConfig.getStartPosition())
        this.particleInitialPosition = this.particleTransform.position
        this.particleTransform.scale = this.particleConfig.getScale(this.particleInitialPosition,this.particleTransform.position, emitterPosition, 0)

        let color = this.particleConfig.getColor(this.particleInitialPosition,this.particleTransform.position, emitterPosition, 0)
        if (color != null){
            this.particleMaterial.albedoColor = new Color3(color.r, color.g, color.b)
            this.particleMaterial.alpha = color.a
        }
    }

    shouldBeAlive(): boolean{
        return this.particleLifeTime < this.particleConfig.getLifeTime()
    }

    setSourcePosition(position: Vector3){
        this.particleTransform.position = position.add(this.particleConfig.getStartPosition())
        this.particleInitialPosition = this.particleTransform.position
    }
}

class ParticleInstance{
    particleComponent: ParticleComponent
    particleEntity: Entity
}