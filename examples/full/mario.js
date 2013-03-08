var WindowDimensions = require("../../input").WindowDimensions
var KeyboardArrows = require("../../input").KeyboardArrows
var fps = require("../../input").fps

var map = require("../../signal").map
var mapMany = require("../../signal").mapMany
var foldp = require("../../signal").foldp

var rect = require("../../element").rect
var filled = require("../../element").filled
var collage = require("../../element").collage
var image = require("../../element").image
var toForm = require("../../element").toForm

var render = require("../../render")

// named color variables
var skyblue = { r: 174, g: 238, b: 238 }
var grassgreen = { r: 74, g: 163, b: 41 }

/* Application Model */
var MarioModel = {
    xPosition: 0
    , yPosition: 0
    , xVelocity: 0
    , yVelocity: 0
    , direction: "right"
}

/* Inputs */
var dimensions = WindowDimensions()
var arrows = KeyboardArrows()
var framerate = fps(25)

var input = mapMany([framerate, arrows], function toTuple(delta, arrows) {
    return { delta: delta, arrows: arrows }
})
input
// =>

function gravity(mario, delta) {
    return {
        yVelocity: mario.yVelocity - (delta / 700)
        , xVelocity: mario.xVelocity
        , xPosition: mario.xPosition
        , yPosition: mario.yPosition
    }
}

function jump(mario, arrows) {
    if (arrows.y > 0 && mario.yPosition === 0) {
        return {
            yVelocity: 0.5
            , xVelocity: mario.xVelocity
            , xPosition: mario.xPosition
            , yPosition: mario.yPosition
        }
    } else {
        return mario
    }
}

function walk(mario, arrows) {
    return {
        xVelocity: arrows.x / 20
        , yVelocity: mario.yVelocity
        , xPosition: mario.xPosition
        , yPosition: mario.yPosition
    }
}

function move(mario, delta) {
    return {
        xPosition: mario.xPosition + (delta * mario.xVelocity)
        , yPosition: Math.max(0, mario.yPosition + delta * mario.yVelocity)
        , xVelocity: mario.xVelocity
        , yVelocity: mario.yVelocity
    }
}

/* state */
var marioState = foldp(input, function update(mario, inputState) {
    var delta = inputState.delta
    var arrows = inputState.arrows

    var jumpedMario = jump(mario, arrows)
    var gravityMario = gravity(jumpedMario, delta)
    var walkedMario = walk(gravityMario, arrows)

    return move(walkedMario, delta)
}, MarioModel)
marioState
// =>

/* rendering */
var main = mapMany([
    dimensions, marioState
], function display(dimensions, mario) {
    var src = "/imgs/mario/stand/right.gif"

    var w = dimensions.w
    var h = dimensions.h
    var verb = mario.y > 0 ? "jump" :
        mario.xVelocity !== 0 ? "walk" : "stand"
    var direction = mario.xVelocity < 0 ? "left" : "rigth"

    var src = "/imgs/mario/" + verb + "/" + direction + ".gif"

    var largeRect = rect(h, { x: w / 2, y: h / 2 })
    var smallRect = rect(50, { x: w / 2, y: 25 })
    var sky = filled(largeRect, skyblue)
    var grass = filled(smallRect, grassgreen)
    var marioImage = image(35, 35, src)

    var marioForm = toForm(marioImage, {
        x: mario.x
        , y: (h - 63) - mario.y
    })

    return collage(w, h, [sky, grass, marioForm])
})

// render(main)
// =>