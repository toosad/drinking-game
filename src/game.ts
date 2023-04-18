// Create an entity
const drink = new Entity()

// Give the entity a shape
drink.addComponent(new GLTFShape("models/soda.glb"))

drink.addComponent(new Transform({ 
  position: new Vector3(1,1,1), 
  scale: new Vector3(1,1,1),
  rotation: Quaternion.Euler(0,0,0)
  }))

// Add the entity to the engine
engine.addEntity(drink)