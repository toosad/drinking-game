import * as utils from '@dcl/ecs-scene-utils'
import * as ui from '@dcl/ui-scene-utils'

//variables
export let health:ui.UIBar
export let hasDrink:boolean = false
export let drinkCount:number = 0
export let drinkCounter:ui.UICounter


let gameTrigger = new Entity()
gameTrigger.addComponent(new Transform({position: new Vector3(63, 0, 15.5)}))
gameTrigger.addComponent(new utils.TriggerComponent(new utils.TriggerBoxShape(new Vector3(.1,3,8), new Vector3(0,1.5,0)),{
  enableDebug: true,
  onCameraEnter:()=>{
    engine.removeEntity(gameTrigger)
    initDrinkingGame()
  }
}))
engine.addEntity(gameTrigger)

let refill = new Entity()
refill.addComponent(new BoxShape())
refill.addComponent(new Transform({position: new Vector3(11, 1, 4.8), scale: new Vector3(.8,.8,.8)}))
engine.addEntity(refill)
refill.addComponent(new OnPointerDown(()=>{
  if(!hasDrink){
    hasDrink = true
    ui.displayAnnouncement("Start drinking!")
  }
}, {button: ActionButton.POINTER}))

async function initDrinkingGame(){  
  health = new ui.UIBar(0, -25, -15, Color4.Red(), ui.BarStyles.ROUNDSILVER, 1)
  drinkCounter = new ui.UICounter(drinkCount, -115, -25, undefined, 28)
}

async function drankDrink(){
  hasDrink = false
  ui.displayAnnouncement("drink gone!")
  drinkCount++
  drinkCounter.set(drinkCount)
  health.set(0)
}

Input.instance.subscribe("BUTTON_DOWN", ActionButton.PRIMARY, false, async()=>{
  if(hasDrink){
    if(health.read() >= 1){
      await drankDrink()
    }
    else{
      if(health.read() < 1){
        health.increase()
      }
    }
  }
})