# Declarity

[![Build Status](https://travis-ci.org/brochington/declarity.svg?branch=master)](https://travis-ci.org/brochington/declarity)

```
npm install --save declarity
```


### Documentation

[view documentation here](https://brochington.gitbooks.io/declarity-documentation)

Declarity allows you to write and organize imperative API code in a declarative manner. Its structure is heavily inspired by React, but is extended with Entity/Component/System functionality. There is no rendering step in Declarity, as any rendering code is defined directly within entities. This gives the developer complete control to interact with whatever API they choose, without sacrificing performance or efficiency.

Declarity offers:
- Extremely fast tree diffing. Running a tree with thousands of nodes at 60FPS is no problem.
- Hot module reloading via webpack and the [declarity loader](https://github.com/brochington/declarity-loader)
- A heavily React inspired API (lifecycle methods, props, state, etc...)
- JSX syntax support.
- Works in unison with React.
- No coupling to any specific API, including the DOM.

Declarity is great for:
- Projects that do not need a complete DOM diffing option.
- Adding familiar code structure to any API. Declarity was originally designed to help target WebGL.
- Targeting multiple APIs within the same tree.


## Example

below is a basic example of a Declarity app that renders three spinning boxes on a canvas.

```javascript
/** @jsx Declarity.createEntity */
import Declarity from 'declarity'

/*
    Declarity supports the use of "systems", which offer a way to extend entities without
    having access to the internals of an entity.
 */
const translate = {
    update: ({context, props}) => {
        let {ctx} = context
        let {position, scale} = props

        ctx.translate(position.x + (scale.x / 2), position.y + (scale.y / 2));
    }
}

const rotate = {
    update: ({context, props}) => {
        let {ctx} = context
        let {rotation} = props

        ctx.rotate(rotation)
    }
}

const renderBox = {
    update: ({context, props}) => {
        let {ctx} = context
        let {color, scale} = props

        ctx.fillStyle = color
        ctx.fillRect(-(scale.x / 2), -(scale.y / 2), scale.x, scale.y)

        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
/*
    "Entities" are analogous to React components. They contain lifecycle methods, as
    well as a render method for rendering children. Unlike React, Declarity uses standard classes
    that do not need to inherit from a base class.
*/
class Canvas {
    /*
        The create() method is where you can initialize any state that belongs to the entity.
    */
    create = ({setState}) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const canvasHeight = 400
        const canvasWidth = 400

        canvas.height = canvasHeight
        canvas.width = canvasWidth

        document.getElementsByTagName('body')[0].appendChild(canvas)

        const render = () => {
            /*
                Declarity is fast! It has no problems updating an entity tree frequently.
            */
            requestAnimationFrame(render)
            /*
                Instead of the setState method being found on the instance of the component,
                It is passed in through arguments.
            */
            setState({})
        }

        render()
        /*
            Entity state can be set by return value.
        */
        return {canvas, ctx, canvasHeight, canvasWidth, count: 1}
    }

    update = ({state}) => {
        const {ctx, canvasHeight, canvasWidth, count} = state

        ctx.clearRect(0, 0, canvasHeight, canvasWidth)

        return {count: count + 1}
    }

    render = ({state}) => {
        const {context, ctx, count} = state;
        const rotationVal = (count % 360) * (Math.PI / 180)

        /*
            The "entity" type is an empty type, similar to a "div".
            Functionality can be given to the entities via props and systems.
        */
        return [
            <entity
                key={'box1'}
                systems={[translate, rotate, renderBox]}
                position={{x: 30, y: 30}}
                rotation={rotationVal}
                scale={{x: 50, y: 50}}
                color="red"
            />,
            <entity
                key={'box2'}
                systems={[translate, rotate, renderBox]}
                position={{x: 100, y: 100}}
                rotation={rotationVal}
                scale={{x: 50, y: 50}}
                color="blue"
            />,
            <entity
                key={'box3'}
                systems={[translate, rotate, renderBox]}
                position={{x: 70, y: 120}}
                rotation={rotationVal}
                scale={{x: 30, y: 50}}
                color="green"
            />
        ]
    }
}
/*
    "Mount" the app.
*/
Declarity.register(<Canvas key='rotatingBoxCanvas'>)
```

### Related repos

[declarity-react-boilerplate](https://github.com/brochington/declarity-react-boilerplate)

[declarity-three-boilerplate](https://github.com/brochington/declarity-three-boilerplate)

[declarity-loader](https://github.com/brochington/declarity-react-boilerplate)
