import { ToggleComponent } from "./modules/toggleComponent";

import { MoveTransformComponent, RotateTransformComponent } from "./modules/transfromSystem";

export function CreateRoom3() : void{
    //constants
    const bookshelfDefaultPos = new Vector3(20.6557,5.4996,15.041)
    const chandelierDefaultRot = Quaternion.Identity
    const bookDefaultRot = Quaternion.Identity
    const telescopeDefaultRot = Quaternion.Identity
    const book2DefaultPos = new Vector3(20.41,6.4118,10.4922)
    const wineGlassDefaultPos = new Vector3(25.7505,6.95786,10.5917)
    const globeDefaultRot = Quaternion.Euler(0.146,34.9,-33.8)

    //create AudioClips that we are going to use in several entities
    let audioClipMoveObject1 = new AudioClip("sounds/move_object1.mp3")
    let audioClipMoveObject2 = new AudioClip("sounds/move_object2.mp3")

    //create bookshel entity
    let bookshelf = new Entity()

    //add gltf shape component
    bookshelf.addComponent(new GLTFShape("models/room3/Puzzle04_LibraryDoor.glb"))

    //create transform component, set it and add it to entity
    bookshelf.addComponent(new Transform({position: bookshelfDefaultPos}))

    //add audio source and set audio clip
    bookshelf.addComponent(new AudioSource(audioClipMoveObject1))

    //create chandelier entity
    let chandelier = new Entity()

    //add gltf shape component
    chandelier.addComponent(new GLTFShape("models/room3/Puzzle04_Chandelier.glb"))

    //add transform component
    chandelier.addComponent(new Transform({position: new Vector3(17.5056,7.61611,15.3835), rotation: chandelierDefaultRot}))

    //add audio source and set audio clip
    chandelier.addComponent(new AudioSource(audioClipMoveObject2))

    //create book entity
    let book = new Entity()

    //add gltf shape component
    book.addComponent(new GLTFShape("models/room3/Puzzle04_Book1.glb"))

    //add transform component
    book.addComponent(new Transform({position: new Vector3(15.8321,7.83095,14.1252), rotation: bookDefaultRot}))

    //add audio source and set audio clip
    book.addComponent(new AudioSource(audioClipMoveObject1))

    //create telescope entity
    let telescope = new Entity()

    //add gltf shape component
    telescope.addComponent(new GLTFShape("models/room3/Puzzle04_Telescope.glb"))

    //add transform component
    telescope.addComponent(new Transform({position: new Vector3(22.6554,7.02615,10.6208), rotation: telescopeDefaultRot}))

    //add audio source and set audio clip
    telescope.addComponent(new AudioSource(audioClipMoveObject1))

    //create book entity
    let book2 = new Entity()

    //add gltf shape component
    book2.addComponent(new GLTFShape("models/room3/Puzzle04_Book2.glb"))

    //add transform component
    book2.addComponent(new Transform({position: book2DefaultPos}))

    //add audio source and set audio clip
    book2.addComponent(new AudioSource(audioClipMoveObject1))

    //create wine glass entity
    let wineGlass = new Entity()

    //add gltf shape component
    wineGlass.addComponent(new GLTFShape("models/room3/Puzzle04_WGlass.glb"))

    //add transform component
    wineGlass.addComponent(new Transform({position: wineGlassDefaultPos}))

    //add audio source and set audio clip
    wineGlass.addComponent(new AudioSource(audioClipMoveObject2))

    //create globe entity
    let globe = new Entity()

    //add gltf shape component
    globe.addComponent(new GLTFShape("models/room3/Puzzle04_Globe.glb"))

    //add transform component
    globe.addComponent(new Transform({position: new Vector3(21.2191,7.11234,10.6817), rotation: globeDefaultRot}))

    //add audio source and set audio clip
    globe.addComponent(new AudioSource(audioClipMoveObject1))

    //toggle for bookshelf
    bookshelf.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            //move bookshelf when it's toggled on
            bookshelf.addComponentOrReplace(new MoveTransformComponent(bookshelf.getComponent(Transform).position,bookshelfDefaultPos.add(new Vector3(1.5,0,0)), 3))
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
    chandelier.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            //rotate chandelier when toggled on and activate bookshelf
            chandelier.addComponentOrReplace(new RotateTransformComponent(chandelier.getComponent(Transform).rotation,Quaternion.Euler(0,0,30), 0.5, ()=>{
                bookshelf.getComponent(ToggleComponent).set(ToggleComponent.State.On)
            }))
            //play sound when rotated
            chandelier.getComponent(AudioSource).playOnce()
        }
        else{
            //rotate back to default position when off and deactivate bookshelf
            chandelier.addComponentOrReplace(new RotateTransformComponent(chandelier.getComponent(Transform).rotation,chandelierDefaultRot, 0.5, ()=>{
                bookshelf.getComponent(ToggleComponent).set(ToggleComponent.State.Off)
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
    book.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            book.addComponentOrReplace(new RotateTransformComponent(book.getComponent(Transform).rotation,Quaternion.Euler(0,0,-25), 0.5))
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

    //toggle for book
    book2.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            book2.addComponentOrReplace(new MoveTransformComponent(book2.getComponent(Transform).position,book2DefaultPos.add(new Vector3(0,0,-0.2)), 0.5))
            book2.getComponent(AudioSource).playOnce()
        }
        else{
            book2.addComponentOrReplace(new MoveTransformComponent(book2.getComponent(Transform).position,book2DefaultPos, 0.5))
            book2.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on wine book
    book2.addComponent(new OnClick(event=>{
        book2.getComponent(ToggleComponent).toggle()
    }))

    //toggle for wine glass
    wineGlass.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            wineGlass.addComponentOrReplace(new MoveTransformComponent(wineGlass.getComponent(Transform).position,wineGlassDefaultPos.add(new Vector3(0.2,0,0)), 0.5))
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

    //toggle for globe
    globe.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            globe.addComponentOrReplace(new RotateTransformComponent(globe.getComponent(Transform).rotation,Quaternion.Euler(174, -26.43, -149.37), 0.5))
            globe.getComponent(AudioSource).playOnce()
        }
        else{
            globe.addComponentOrReplace(new RotateTransformComponent(globe.getComponent(Transform).rotation,globeDefaultRot, 0.5))
            globe.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on globe
    globe.addComponent(new OnClick(event=>{
        globe.getComponent(ToggleComponent).toggle()
    }))

    //toggle for telescope
    telescope.addComponent(new ToggleComponent(ToggleComponent.State.Off, value =>{
        if (value == ToggleComponent.State.On){
            telescope.addComponentOrReplace(new RotateTransformComponent(telescope.getComponent(Transform).rotation,Quaternion.Euler(0,127,0), 0.5))
            telescope.getComponent(AudioSource).playOnce()
        }
        else{
            telescope.addComponentOrReplace(new RotateTransformComponent(telescope.getComponent(Transform).rotation,telescopeDefaultRot, 0.5))
            telescope.getComponent(AudioSource).playOnce()
        }
    }))

    //listen for click on telescope
    telescope.addComponent(new OnClick(event=>{
        telescope.getComponent(ToggleComponent).toggle()
    }))

    //add entities to engine
    engine.addEntity(bookshelf)
    engine.addEntity(chandelier)
    engine.addEntity(book)
    engine.addEntity(telescope)
    engine.addEntity(book2)
    engine.addEntity(wineGlass)
    engine.addEntity(globe)
}