function ShipType() {
    this.name;
    this.speed;
    this.acceleration;
    this.reverseAccelreation;
    this.rotationSpeed;
    this.afterBurnerBonus;
    this.afterBurnerCapacity;
    this.cargoCapacity;
    this.drag;
    this.actionPool = [];
    this.size;
    this.trails;
}

function defineShips(Action) {
    ShipType.types = [];

    let fuelShip = new ShipType();
    fuelShip.name = "fuel";
    fuelShip.size = 200;
    fuelShip.speed = 1000;
    fuelShip.acceleration = 100;
    fuelShip.reverseAccelreation = 50;
    fuelShip.rotationSpeed = 1;
    fuelShip.afterBurnerSpeedBonus = 1000;
    fuelShip.afterBurnerRotationBonus = 1;
    fuelShip.afterBurnerAccelerationBonus = 100;
    fuelShip.afterBurnerCapacity = 600;
    fuelShip.cargoCapacity = 30;
    fuelShip.inventory = [{unique: true, capacity: 15, filter: 0},{unique: true, capacity: 15, filter: 1},{unique: true, capacity: 15, filter: 2},{unique: true, capacity: 50, filter: 3},{unique: false},{unique: false},{unique: false},{unique: false},{unique: false},{unique: false},{unique: false},{unique: false},{unique: false}],
    fuelShip.drag = 0.05;
    fuelShip.actionPool = [Action.buildTest, Action.MineRock, Action.DropItem, Action.SwapSlots, Action.CreateMarker];
    fuelShip.radarRange = 14000;
    fuelShip.trails = [
        {
            x:-180,
            y:-72,
            useTrail:true
        },
        {
            x:-180,
            y:72,
            useTrail:true
        },
        {
            x:-127,
            y:-124,
            useTrail:true
        },
        {
            x:-127,
            y:124,
            useTrail:true
        },
        {
            x:55,
            y:-112,
            useTrail:false
        },
        {
            x:55,
            y:112,
            useTrail:false
        },

    ];
    fuelShip.spriteSize = 1.9;
    ShipType.types[100] = fuelShip;

    let debugShip = new ShipType();
    debugShip.name = "debug";
    debugShip.size = 125;
    debugShip.speed = 1000;
    debugShip.acceleration = 600;
    debugShip.reverseAccelreation = 300;
    debugShip.rotationSpeed = 3;
    debugShip.afterBurnerSpeedBonus = 1000;
    debugShip.afterBurnerRotationBonus = 1;
    debugShip.afterBurnerAccelerationBonus = 800;
    debugShip.afterBurnerCapacity = 600;
    debugShip.cargoCapacity = 30;
    debugShip.inventory = [{unique: true, capacity: 15, filter: 1},{unique: false},{unique: false}],
    debugShip.drag = 0.5;
    debugShip.actionPool = [Action.buildTest, Action.MineRock, Action.DropItem, Action.SwapSlots, Action.CreateMarker, Actions.Shoot, Actions.LevelMove, Actions.Interact];
    debugShip.radarRange = 14000;
    debugShip.trails = [
        {
            x:-90,
            y:0,
            useTrail:true
        },
    ];
    debugShip.spriteSize = 1;
    ShipType.types[0] = debugShip;

    let hackerShip = new ShipType();
    hackerShip.name = "hacker";
    hackerShip.size = 180;
    hackerShip.speed = 1000;
    hackerShip.acceleration = 600;
    hackerShip.reverseAccelreation = 300;
    hackerShip.rotationSpeed = 3;
    hackerShip.afterBurnerSpeedBonus = 1000;
    hackerShip.afterBurnerRotationBonus = 1;
    hackerShip.afterBurnerAccelerationBonus = 800;
    hackerShip.afterBurnerCapacity = 600;
    hackerShip.cargoCapacity = 30;
    hackerShip.inventory = [{unique: true, capacity: 15, filter: 0},{unique: true, capacity: 3, filter: 1},{unique: false},{unique: false}],
    hackerShip.drag = 0.5;
    hackerShip.actionPool = [Action.buildTest, Action.MineRock, Action.DropItem, Action.SwapSlots, Action.CreateMarker];
    hackerShip.radarRange = 14000;
    hackerShip.trails = [
        {
            x:-120,
            y:-20,
            useTrail:true
        },
        {
            x:-120,
            y:20,
            useTrail:true
        },
    ];
    hackerShip.spriteSize = 1.6;
    ShipType.types[1] = hackerShip;

    return ShipType;
};