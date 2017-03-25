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


So why not just use React?
- YOU define the way your code interacts with whatever API you want.
- There is no rendering step in Declarity, as any rendering code is defined within entities.


```javascript
/** @jsx Declarity.createEntity */
import Declarity from 'declarity'

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

class Box {
    create = () => {}

    update = () => {}
}

class SampleEntity {
    getChildContext = ({state}) => {
        let {ctx, canvasHeight, canvasWidth} = state

        return {ctx, canvasHeight, canvasWidth}
    }

    create = ({setState}) => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const canvasHeight = 400
        const canvasWidth = 400

        canvas.height = canvasHeight
        canvas.width = canvasWidth

        document.getElementsByTagName('body')[0].appendChild(canvas)

        const render = () => {
            requestAnimationFrame(render)

            setState({})
        }

        render()

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

        return [
            <Box
                key={'box1'}
                systems={[translate, rotate, renderBox]}
                position={{x: 30, y: 30}}
                rotation={rotationVal}
                scale={{x: 50, y: 50}}
                color="red"
            />,
            <Box
                key={'box2'}
                systems={[translate, rotate, renderBox]}
                position={{x: 100, y: 100}}
                rotation={rotationVal}
                scale={{x: 50, y: 50}}
                color="blue"
            />,
            <Box
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

Declarity.register(<Canvas key='rotatingBoxCanvas'>)
```
