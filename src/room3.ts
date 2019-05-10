import { ToggleComponent } from "./modules/toggleComponent";

import { MoveTransformComponent, RotateTransformComponent } from "./modules/transfromSystem";

export function CreateRoom3() : void{
    //constants
    const bookshelfDefaultPos = new Vector3(15.525, 0, 6.53)
    const chandelierDefaultRot = Quaternion.Identity
    const bookDefaultRot = Quaternion.Euler(0,-90,0)
    const couchDefaultPos = new Vector3(15, 0, 2.5)
    const wineBottleDefaultPos = new Vector3(8.53,1.011,3.72)
    const wineGlassDefaultPos = new Vector3(8.72,1.041,3.42)
    const chairDefaultRot = Quaternion.Identity
    const wallPaintingDefaultRot =  Quaternion.Euler(90,0,0)

    //create AudioClips that we are going to use in several entities
    let audioClipMoveObject1 = new AudioClip("sounds/move_object1.mp3")
    let audioClipMoveObject2 = new AudioClip("sounds/move_object2.mp3")

    //create bookshel entity
    let bookshelf = new Entity()

    //add gltf shape component
    bookshelf.addComponent(new GLTFShape("models/room3/bookshelf.glb"))

    //create transform component, set it and add it to entity
    bookshelf.addComponent(new Transform({position: bookshelfDefaultPos, rotation: Quaternion.Euler(0,90,0)}))

    //add audio source and set audio clip
    bookshelf.addComponent(new AudioSource(audioClipMoveObject1))

    //create chandelier entity
    let chandelier = new Entity()

    //add gltf shape component
    chandelier.addComponent(new GLTFShape("models/room3/chandelier.glb"))

    //add transform component
    chandelier.addComponent(new Transform({position: new Vector3(0.4,1.5,-0.05), rotation: chandelierDefaultRot}))

    //add audio source and set audio clip
    chandelier.addComponent(new AudioSource(audioClipMoveObject1))

    //set chandelier as child of bookshelf
    chandelier.setParent(bookshelf)

    //create book entity
    let book = new Entity()

    //add gltf shape component
    book.addComponent(new GLTFShape("models/room3/book.glb"))

    //add transform component
    book.addComponent(new Transform({position: new Vector3(-0.8,0.59,-0.19), rotation: bookDefaultRot}))

    //add audio source and set audio clip
    book.addComponent(new AudioSource(audioClipMoveObject1))

    //set book as child of bookshelf
    book.setParent(bookshelf)

    //create couch entity
    let couch = new Entity()

    //add gltf shape component
    couch.addComponent(new GLTFShape("models/room3/couch.glb"))

    //add transform component
    couch.addComponent(new Transform({position: couchDefaultPos}))

    //add audio source and set audio clip
    couch.addComponent(new AudioSource(audioClipMoveObject1))

    //create table entity
    let table = new Entity()

    //add gltf shape component
    table.addComponent(new GLTFShape("models/room3/table.glb"))

    //add transform component
    table.addComponent(new Transform({position: new Vector3(8.63,0,3.63)}))

    //add audio source and set audio clip
    table.addComponent(new AudioSource(audioClipMoveObject1))

    //create wine bottle entity
    let wineBottle = new Entity()

    //add gltf shape component
    wineBottle.addComponent(new GLTFShape("models/room3/winebottle.glb"))

    //add transform component
    wineBottle.addComponent(new Transform({position: wineBottleDefaultPos}))

    //add audio source and set audio clip
    wineBottle.addComponent(new AudioSource(audioClipMoveObject2))

    //create wine glass entity
    let wineGlass = new Entity()

    //add gltf shape component
    wineGlass.addComponent(new GLTFShape("models/room3/wineglass.glb"))

    //add transform component
    wineGlass.addComponent(new Transform({position: wineGlassDefaultPos}))

    //add audio source and set audio clip
    wineGlass.addComponent(new AudioSource(audioClipMoveObject2))

    //create chair entity
    let chair = new Entity()

    //add gltf shape component
    chair.addComponent(new GLTFShape("models/room3/chair.glb"))

    //add transform component
    chair.addComponent(new Transform({position: new Vector3(9.22,0,3.86), rotation: chairDefaultRot}))

    //add audio source and set audio clip
    chair.addComponent(new AudioSource(audioClipMoveObject1))

    //create chair entity
    let wallPainting = new Entity()

    //add gltf shape component
    wallPainting.addComponent(new GLTFShape("models/room3/manacoin.glb"))

    //add transform component
    wallPainting.addComponent(new Transform({position: new Vector3(12.33,2.65,0.31), rotation: wallPaintingDefaultRot}))

    //add audio source and set audio clip
    wallPainting.addComponent(new AudioSource(audioClipMoveObject1))

    //create fake door (spoiler alert: it will never open)
    let fakeDoor = new Entity()

    //add gltf shape to fake door
    fakeDoor.addComponent(new GLTFShape("models/generic/door.glb"))

    //add and set transform component
    fakeDoor.addComponent(new Transform({position: new Vector3(10.5,0,0.4)}))

    //toggle for bookshelf
    bookshelf.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            //move bookshelf when it's toggled on
            bookshelf.addComponentOrReplace(new MoveTransformComponent(bookshelf.getComponent(Transform).position,bookshelfDefaultPos.add(new Vector3(0,0,-1.5)), 3))
            //play sound when moved
            bookshelf.getComponent(AudioSource).playOnce()
        }
        else{
            //move back to default position when bookshelf's toggled off
            bookshelf.addComponentOrReplace(new MoveTransformComponent(bookshelf.getComponent(Transform).position,bookshelfDefaultPos, 3))
            //play sound when moved
            bookshelf.getComponent(AudioSource).playOnce()
        }
    }))

    //toggle for chandelier
    chandelier.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            //rotate chandelier when toggled on and activate bookshelf
            chandelier.addComponentOrReplace(new RotateTransformComponent(chandelier.getComponent(Transform).rotation,Quaternion.Euler(0,0,-30), 0.5, ()=>{
                bookshelf.getComponent(ToggleComponent).set(ToggleComponent.ToggleState.On)
            }))
            //play sound when rotated
            chandelier.getComponent(AudioSource).playOnce()
        }
        else{
            //rotate back to default position when off and deactivate bookshelf
            chandelier.addComponentOrReplace(new RotateTransformComponent(chandelier.getComponent(Transform).rotation,chandelierDefaultRot, 0.5, ()=>{
                bookshelf.getComponent(ToggleComponent).set(ToggleComponent.ToggleState.Off)
            }))
            //play sound when rotated
            chandelier.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on chandelier and toggle it's state
    chandelier.addComponent(new OnClick(event=>{
        chandelier.getComponent(ToggleComponent).toggle()
    }))

    //toggle for book
    book.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            book.addComponentOrReplace(new RotateTransformComponent(book.getComponent(Transform).rotation,Quaternion.Euler(0,-90,25), 0.5))
            book.getComponent(AudioSource).playOnce()
        }
        else{
            book.addComponentOrReplace(new RotateTransformComponent(book.getComponent(Transform).rotation,bookDefaultRot, 0.5))
            book.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on book
    book.addComponent(new OnClick(event=>{
        book.getComponent(ToggleComponent).toggle()
    }))

    //toggle for wine bottle
    wineBottle.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            wineBottle.addComponentOrReplace(new MoveTransformComponent(wineBottle.getComponent(Transform).position,wineBottleDefaultPos.add(new Vector3(-0.2,0,0)), 0.5))
            wineBottle.getComponent(AudioSource).playOnce()
        }
        else{
            wineBottle.addComponentOrReplace(new MoveTransformComponent(wineBottle.getComponent(Transform).position,wineBottleDefaultPos, 0.5))
            wineBottle.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on wine bottle
    wineBottle.addComponent(new OnClick(event=>{
        wineBottle.getComponent(ToggleComponent).toggle()
    }))

    //toggle for wine glass
    wineGlass.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            wineGlass.addComponentOrReplace(new MoveTransformComponent(wineGlass.getComponent(Transform).position,wineGlassDefaultPos.add(new Vector3(0,0,-0.2)), 0.5))
            wineGlass.getComponent(AudioSource).playOnce()
        }
        else{
            wineGlass.addComponentOrReplace(new MoveTransformComponent(wineGlass.getComponent(Transform).position,wineGlassDefaultPos, 0.5))
            wineGlass.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on wine glass
    wineGlass.addComponent(new OnClick(event=>{
        wineGlass.getComponent(ToggleComponent).toggle()
    }))

    //toggle for chair
    chair.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            chair.addComponentOrReplace(new RotateTransformComponent(chair.getComponent(Transform).rotation,Quaternion.Euler(0,15,0), 0.5))
            chair.getComponent(AudioSource).playOnce()
        }
        else{
            chair.addComponentOrReplace(new RotateTransformComponent(chair.getComponent(Transform).rotation,chairDefaultRot, 0.5))
            chair.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on chair
    chair.addComponent(new OnClick(event=>{
        chair.getComponent(ToggleComponent).toggle()
    }))

    //toggle for wall painting
    wallPainting.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            //rotate wall painting and toggle ON bookshelf's state when rotation ends
            wallPainting.addComponentOrReplace(new RotateTransformComponent(wallPainting.getComponent(Transform).rotation, Quaternion.Euler(90,10,0), 0.5))
            wallPainting.getComponent(AudioSource).playOnce()
        }
        else{
            //rotate wall painting back to default
            wallPainting.addComponentOrReplace(new RotateTransformComponent(wallPainting.getComponent(Transform).rotation,wallPaintingDefaultRot, 0.5))
            wallPainting.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on wall paiting
    wallPainting.addComponent(new OnClick(event=>{
        wallPainting.getComponent(ToggleComponent).toggle()
    }))

    //toggle for couch
    couch.addComponent(new ToggleComponent(ToggleComponent.ToggleState.Off, value =>{
        if (value == ToggleComponent.ToggleState.On){
            couch.addComponentOrReplace(new MoveTransformComponent(couch.getComponent(Transform).position,couchDefaultPos.add(new Vector3(0,0,0.4)), 0.5))
            couch.getComponent(AudioSource).playOnce()
        }
        else{
            couch.addComponentOrReplace(new MoveTransformComponent(couch.getComponent(Transform).position,couchDefaultPos, 0.5))
            couch.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on couch
    couch.addComponent(new OnClick(event=>{
        couch.getComponent(ToggleComponent).toggle()
    }))

    //add entities to engine
    engine.addEntity(bookshelf)
    engine.addEntity(couch)
    engine.addEntity(table)
    engine.addEntity(wineBottle)
    engine.addEntity(wineGlass)
    engine.addEntity(chair)
    engine.addEntity(wallPainting)
    engine.addEntity(fakeDoor)
}