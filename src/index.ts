import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'
import { Timer } from './timer'

//variables
export let health: ui.UIBar
export let hasDrink: boolean = false
export let hasEmptyDrink: boolean = false
export let gameStarted: boolean = false
export let drinkCount: number = 0
export let drinkCounter: ui.UICounter

//drinking sound effects
const drunksound1 = new Entity()
const tipsyclip = new AudioClip('sounds/tipsy.mp3')
const tipsysource = new AudioSource(tipsyclip)
drunksound1.addComponent(tipsysource)
drunksound1.addComponent(new Transform())
drunksound1.getComponent(Transform).position = Camera.instance.position
engine.addEntity(drunksound1)

const drinkingsound = new Entity()
const drinkingclip = new AudioClip('sounds/navigationForward.mp3')
const drinkingsource = new AudioSource(drinkingclip)
drinkingsound.addComponent(drinkingsource)
drinkingsound.addComponent(new Transform())
drinkingsound.getComponent(Transform).position = Camera.instance.position
engine.addEntity(drinkingsound)

const drinkingsound2 = new Entity()
const drinkingclip2 = new AudioClip('sounds/star-collect.mp3')
const drinkingsource2 = new AudioSource(drinkingclip2)
drinkingsound2.addComponent(drinkingsource2)
drinkingsound2.addComponent(new Transform())
drinkingsound2.getComponent(Transform).position = Camera.instance.position
engine.addEntity(drinkingsound2)


// Create an entity
const drink = new Entity()
const Z_OFFSET = 1.5
const GROUND_HEIGHT = 0.55

// Give the entity a shape
drink.addComponent(new GLTFShape("models/soda_.glb"))

drink.addComponent(new Transform({
  position: new Vector3(0, .3, 1),
  scale: new Vector3(1, 1, 1),
  rotation: Quaternion.Euler(0, 0, 0)
}))

// Add the entity to the engine

// Create and add animator component
drink.addComponent(new Animator())
const drinkclip = new AnimationState("sodaAction")

// Instance and add a clip
drink.getComponent(Animator).addClip(drinkclip)





let gameTrigger = new Entity()
gameTrigger.addComponent(new Transform({ position: new Vector3(6, 0, 8.5) }))
gameTrigger.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(10, 3, 10), new Vector3(0, 1.5, 0)), {
  enableDebug: true,
  onCameraEnter: () => {
    engine.removeEntity(gameTrigger)
    ui.displayAnnouncement("Welcome BAR")
    initDrinkingGame()
  },
  onCameraExit: () => {
    Drunk.hide()
    VeryDrunk.hide()
  }
}))
engine.addEntity(gameTrigger)

let refill = new Entity()
refill.addComponent(new GLTFShape("models/soda.glb"))
refill.addComponent(new Transform({ position: new Vector3(8, .3, 5), scale: new Vector3(.8, .8, .8) }))
engine.addEntity(refill)
refill.addComponent(new OnPointerDown(() => {

  let transform = drink.getComponent(Transform)

  if (!hasDrink) {
    hasDrink = true
    ui.displayAnnouncement("Press E to Start drinking!")
    engine.addEntity(drink)
    engine.removeEntity(refill)

    transform.position.x = 0.5
    transform.position.y = 0.25
    transform.rotation = Quaternion.Zero()
    transform.position.z = 0.6
    drink.setParent(Attachable.AVATAR)
    newTimer(60)
  }
}, {
  button: ActionButton.POINTER,
  hoverText: "Grab Drink"
}))

async function initDrinkingGame() {
  health = new ui.UIBar(0, -600, -15, Color4.Magenta(), ui.BarStyles.ROUNDSILVER, 1)
  drinkCounter = new ui.UICounter(drinkCount, -700, -25, undefined, 28)
}

async function drankDrink() {
  hasDrink = false
  ui.displayAnnouncement("Refill !")
  drinkCount++
  drink.getComponent(Animator).getClip("sodaAction").stop()
  if (drinkCount >= 5) {
    VdrunkImage()

    //sound effect
    tipsysource.playing = true
    tipsysource.playOnce()
  }

  drinkCounter.set(drinkCount)
  health.set(0)
  drunkImage()

  //sound effect
  drinkingsource2.playing = true
  drinkingsource2.playOnce()


}

Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, async () => {
  if (hasDrink) {
    if (health.read() >= 1) {
      await drankDrink()
      hasEmptyDrink = true
    }
    if (hasEmptyDrink) {
      hasEmptyDrink = false
      const transform = refill.getComponent(Transform)
      drink.setParent(null)
      engine.removeEntity(drink)
      engine.addEntity(refill)
      //const forwardVector: Vector3 = Vector3.Forward()
      //.scale(Z_OFFSET)
      //.rotate(Camera.instance.rotation)
      //transform.position = Camera.instance.position.clone().add(forwardVector)
      //transform.lookAt(Camera.instance.position)
      //transform.rotation.x = 0
      //transform.rotation.z = 0
      //transform.position.y = GROUND_HEIGHT

      //Place drink at the bar
      refill.addComponent(new Transform({ position: new Vector3(8, .3, 5), scale: new Vector3(.8, .8, .8) }))
      drink.getComponent(Animator).getClip("sodaAction").stop()
    }
    else {
      if (health.read() < 1) {
        health.increase()
        drink.getComponent(Animator).getClip("sodaAction").play()
        drinkclip.looping = false

        //sound effect
        drinkingsource.playing = true
        drinkingsource.playOnce()
      }
    }
  }
})

function drunkImage() {
  Drunk.show()
  utils.setTimeout(5000, () => {
    Drunk.hide()
  })

}


function VdrunkImage() {
  VeryDrunk.show()
  utils.setTimeout(5000, () => {
    VeryDrunk.hide()
  })

}



let Drunk = new ui.CenterImage('images/drunkScreen.png', 1, true, 0, 0, 1650, 940, {
  sourceHeight: 940,
  sourceWidth: 1650,
  sourceLeft: 0,
  sourceTop: 0
})


let VeryDrunk = new ui.CenterImage('images/veryDrunkScreen.png', 1, true, 0, 0, 1650, 940, {
  sourceHeight: 940,
  sourceWidth: 1650,
  sourceLeft: 0,
  sourceTop: 0
})




export const timerText = new UIText(ui.canvas)
export const intervalEntity = new Entity()
export function newTimer(intervals: number) {
  gameStarted = true
  let timerValue = new Timer()

  intervalEntity.addComponent(new utils.Interval(1000, () => {
    timerText.value = timerValue.updateTimeString(intervals)
    intervals -= 1
    log('intervalEntity', intervals)
    if (intervals < 0) {
      intervalEntity.removeComponent(utils.Interval)
      timerText.value = ''
      gameStarted = false
      ui.displayAnnouncement("Game Over! You Drank:       " + drinkCount + "     Drinks")
      drinkCounter.set(0)
      drinkCount = 0
      Drunk.hide()
      VeryDrunk.hide()
    }
  }))
  timerText.color = Color4.White()
  timerText.fontSize = 50
  timerText.positionX = 0
  timerText.positionY = 300


  engine.addEntity(intervalEntity)
}