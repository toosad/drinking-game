export class Timer extends Entity {
    static formatTimeString: any;
    // Store the text entity for use in the method below
  
    constructor() {
      super();
      engine.addEntity(this);
    }
  
    private formatTimeString(seconds: number): string {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return (
        mins.toLocaleString(undefined, { minimumIntegerDigits: 2 }) +
        ":" +
        secs.toLocaleString(undefined, { minimumIntegerDigits: 2 })
      );
    }
  
    // This method can be called anytime to change the number of seconds on the clock
    public updateTimeString(seconds: number): string {
      return this.formatTimeString(seconds);
    }
  }