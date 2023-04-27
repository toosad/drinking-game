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

// Instance and add a clip
drink.getComponent(Animator).addClip(new AnimationState("sodaAction"))





let gameTrigger = new Entity()
gameTrigger.addComponent(new Transform({ position: new Vector3(6, 0, 8.5) }))
gameTrigger.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(10, 3, 10), new Vector3(0, 1.5, 0)), {
  enableDebug: true,
  onCameraEnter: () => {
    engine.removeEntity(gameTrigger)
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
  if (!hasDrink) {
    hasDrink = true
    ui.displayAnnouncement("Press E to Start drinking!")
    engine.addEntity(drink)
    drink.setParent(Attachable.AVATAR)
    newTimer(15)
  }
}, {
  button: ActionButton.POINTER,
  hoverText: "Grab Drink"
}))

async function initDrinkingGame() {
  health = new ui.UIBar(0, -25, -15, Color4.Red(), ui.BarStyles.ROUNDSILVER, 1)
  drinkCounter = new ui.UICounter(drinkCount, -115, -25, undefined, 28)
}

async function drankDrink() {
  hasDrink = false
  ui.displayAnnouncement("drink gone!")
  drinkCount++
  drink.getComponent(Animator).getClip("sodaAction").stop()
  if (drinkCount >= 5) {
    VeryDrunk.show()
  }
  drinkCounter.set(drinkCount)
  health.set(0)
  Drunk.show()


}

Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, async () => {
  if (hasDrink) {
    if (health.read() >= 1) {
      await drankDrink()
      hasEmptyDrink = true
    }
    if(hasEmptyDrink){
      hasEmptyDrink = false
      const transform = refill.getComponent(Transform)
      drink.setParent(null)
      engine.removeEntity(drink)
      const forwardVector: Vector3 = Vector3.Forward()
        .scale(Z_OFFSET)
        .rotate(Camera.instance.rotation)
      transform.position = Camera.instance.position.clone().add(forwardVector)
      transform.lookAt(Camera.instance.position)
      transform.rotation.x = 0
      transform.rotation.z = 0
      transform.position.y = GROUND_HEIGHT
      drink.getComponent(Animator).getClip("sodaAction").stop()
    }
    else {
      if (health.read() < 1) {
        health.increase()
        drink.getComponent(Animator).getClip("sodaAction").play()
      }
    }
  }
})





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
export function newTimer(intervals : number){
gameStarted = true
let timerValue = new Timer()

intervalEntity.addComponent(new utils.Interval(1000, () => {
    timerText.value = timerValue.updateTimeString(intervals)
    intervals -= 1
    log('intervalEntity', intervals)
    if (intervals < 0 ){
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