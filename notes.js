import {Entity} from 'declarity';

// Entity = A unique ID
// Component = some group of information, possibly the "state"
// System = Logic function. Hopefully pure, and indempotent.

/*
Challenges:
- Updating child entities
*/

/*
The Entity class
*/
class Entity {
    // Every entity has a unique id.
    id = Math.random();
}

class Engine extends Entity {
    create() {

    }

    destroy() {

    }

    /*
        pipeLine is called after create(), basically it's update.
        Not a standard tree, can be an Array.
    */
    pipeLine() {
        return (
            <Scene />
            <Camera>
                <System1 />
                <System2 />
            </Camera>
            <Light>
                <System3 someProp={true} />
            </Light>
        );
    }
}

class Scene extends Entity {
    actions = {
        // Actions that will be past down to other entities.
    }
    createEntity = () => {
        return {

        }
    }
    // After the Entity is created, It can be passed down to other
    // entities.
    afterCreate = () => {}

    onUpdate = () => {

    }

    onDestroy = () => {

    }

    /*
        The render "path" for JUST this entity.
        Basically a series of transforms/systems that are pure.
        This way the the input can be checked before each point in the chain
        and can stop if they are same. Most likely will have to use immutable
        inputs/outputs.

    */
    render() {
        return ();
    }
}
