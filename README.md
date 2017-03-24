# Declarity

[![Build Status](https://travis-ci.org/brochington/declarity.svg?branch=master)](https://travis-ci.org/brochington/declarity)

Declarity allows you to write and organize imperative API code in a declarative manner similar to React.

Declarity offers:
- The ability to interact with imperative APIs in a declarative manner.
- A heavily React inspired API (lifecycle methods, props, state, etc...)
- JSX
- Not coupled to any specific API, including the DOM.
- Extremely fast
- API improvements to help structure your code
-


So why just use React?
- YOU define the way your code interacts with whatever API you want.
-


```javascript
/** @jsx Declarity.createEntity */
import Declarity from 'declarity'

class Canvas {
    getChildContext = ({state}) => {
        let {ctx} = state

        return {ctx}
    }

    create = () => {
        let canvas = document.createElement('canvas')
        let ctx = canvas.getContext('2d')
        let count = 1;

        document.appendChild(canvas)

        const render = () => {
            requestAnimationFrame(render)

            setState({})
        }

        return {canvas, ctx, count}
    }

    update = ({state}) => {
        const {count} = state

        return {count: count + 1}
    }

    render = ({state}) => {
        const {context, count} = state;
        const rotationVal = (count % 180) * Math.PI / 180

        return [
            <Box
                key={'box1'}
                position={{x: 50, y: 50}}
                rotation={rotationVal}
                scale={{x: 10, y: 10}}
            />
        ]
    }
}

class Box {
    updateBox = ({props, context}) => {
        let {ctx} = context
        let {position, rotation, size} = props

        ctx.fillRect(position.x, position.y, scale.x, scale.y)
        ctx.rotate(rotation)
    }

    create = (params) => {
        this.updateBox(params)
    }

    update = (params) => {
        this.updateBox(params)
    }
}

Declarity.register(<Canvas key='rotatingBoxCanvas'>)
```
