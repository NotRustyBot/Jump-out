//#region věci
function Vector(x, y) {
    this.x = x;
    this.y = y;

    this.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    this.distance = function (vector) {
        let v = new Vector(
            Math.abs(this.x - vector.x),
            Math.abs(this.y - vector.y)
        );
        return v.length();
    };

    this.add = function (vector) {
        this.x = this.x + vector.x;
        this.y = this.y + vector.y;
        return this;
    };

    this.sub = function (vector) {
        this.x = this.x - vector.x;
        this.y = this.y - vector.y;
        return this;
    };

    this.mult = function (magnitude) {
        this.x = this.x * magnitude;
        this.y = this.y * magnitude;
        return this;
    };

    this.normalize = function (length) {
        length = length || 1;
        let total = this.length();
        this.x = (this.x / total) * length;
        this.y = (this.y / total) * length;
        return this;
    };

    this.toAngle = function () {
        return Math.atan2(this.y, this.x);
    }

    this.result = function () {
        return new Vector(this.x, this.y);
    };
}
Vector.zero = function () {
    return new Vector(0, 0);
};
Vector.fromAngle = function (r) {
    return new Vector(Math.cos(r), Math.sin(r));
};


function ShipType() {
    this.name = "ShipTypeName";
    this.speed = 5;
    this.acceleration = 1;
    this.reverseAccelreation = 0.5;
    this.rotationSpeed = 1;
    this.afterBurnerBonus = 3;
    this.afterBurnerCapacity = 60;
}

ShipType.init = function () {
    ShipType.types = [];
    let debugShip = new ShipType();
    debugShip.name = "Debug";
    debugShip.speed = 150;
    debugShip.acceleration = 5;
    debugShip.reverseAccelreation = 3;
    debugShip.rotationSpeed = 1;
    debugShip.afterBurnerSpeedBonus = 1.5;
    debugShip.afterBurnerAgilityBonus = 1.5;
    debugShip.afterBurnerCapacity = 60;
    ShipType.types["Debug"] = debugShip;
};

ShipType.init();


function Ship() {
    this.stats;
    this.position = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.rotation = 0;
    this.control = new Vector(0, 0);
    this.afterBurnerActive = 0;

    this.init = function (type) {
        this.stats = type;
    };

    this.update = function (dt) {
        let stats = this.stats;
        console.log(stats);

        if (this.control.x != 0) {
            // rotationace
            this.rotation += (stats.rotationSpeed + this.afterBurnerActive * stats.afterBurnerAgilityBonus) * this.control.x * dt;
        }

        if (this.control.y != 0) {
            // zrychlení / brždění
            let pointing = Vector.fromAngle(this.rotation).mult(this.control.y);
            pointing.mult(dt);
            if (this.control.y > 0) {
                pointing.normalize(stats.accel + this.afterBurnerActive * stats.afterBurnerAgilityBonus);
            } else {
                pointing.normalize(stats.revAccel + this.afterBurnerActive * stats.afterBurnerAgilityBonus);
            }
            this.velocity.add(pointing);
        }

        if (this.velocity.length() >= stats.speed + this.afterBurnerActive * stats.afterBurnerSpeedBonus) {

            this.velocity.normalize(stats.speed + this.afterBurnerActive * stats.afterBurnerSpeedBonus);
        }

        this.position.add(this.velocity.result().mult(dt));
    };
}


function Player(id) {
    this.nick = "nick";
    this.ship;
    this.id = id;
    this.init = function () {
        this.ship = new Ship();
        this.ship.init(ShipType.types["Debug"]);
    };
    Player.players.push(this);
}
Player.players = [];
Player.findID = function (id) {
    for (let i = 0; i < Player.players.length; i++) {
        if (Player.players[i].id == id) {
            return Player.players[i];
        }
    }
    console.log("Couldn't find player with ID " + id);
    return null;
}

function Particle(pos, vel, rot, lifetime, texture) {
    this.position = pos.result();
    this.velocity = vel.result();
    this.velocityAngle = this.velocity.toAngle();
    this.rotation = rot;
    this.lifetime = lifetime;
    this.age = 0;
    this.ageRatio = 0;
    this.sprite = new PIXI.Sprite(texture);
    this.sprite.x = pos.x;
    this.sprite.y = pos.y;
    this.sprite.anchor.set(0.5);
    this.update = function (deltaTime) {
        this.age += deltaTime;
        this.ageRatio = this.age / this.lifetime;
        this.position.add(this.velocity.result().mult(deltaTime));
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.sprite.rotation = this.rotation;
        //console.log("DT:"+deltaTime,this.age);
    }
}

function ParticleSystem(settings) {
    this.particles = [];
    this.emitter = {
        velocityAngle: 0,
        position: new Vector.zero(),
        velocity: new Vector.zero(),
        rotation: 0
    }
    this.container = new PIXI.ParticleContainer(10000, { scale: true, position: true, rotation: true, tint: true, });
    //this.container = new PIXI.Container();
    //TODO: WHY BROKEN UPDATE WITH PARTICLECONTAINER?????????
    //this.container.blendMode = PIXI.BLEND_MODES.SCREEN;
    app.stage.addChild(this.container);
    if (settings != null) this.settings = settings;
    else {
        this.settings = {
            texture: loader.resources.spark.texture,
            maxParticles: 100,
            emitRate: 1,
            inheritVelocity: 0,
            inheritRotation: -50,
            rotateToVelocity: true,
            randomVelocity: 50,
            scale: new Ramp(1, 1),
            alpha: new Ramp(1, 0),
            velocity: new Ramp(600, 0),
            color: new ColorRamp(0xFFFFFF, 0x1199FF),
            lifetime: new Ramp(0.1, 0.5)
        }
    }
    this.update = function (deltaTime) {
        /*let testSprite = new PIXI.Sprite(this.settings.texture);
        this.container.addChild(testSprite);
        testSprite.destroy();*/
        //this.container.containerUpdateTransform();
        if (this.settings.emitRate > 0) {
            for (let i = 0; i < this.settings.emitRate; i++) {



                this.emitter.velocityAngle = this.emitter.velocity.toAngle();
                let newP = new Particle(this.emitter.position,

                    this.emitter.velocity.result()
                        .mult(this.settings.inheritVelocity)
                        .add(new Vector(0.5 - Math.random(), 0.5 - Math.random())
                            .mult(this.settings.randomVelocity))
                        .add(Vector.fromAngle(this.emitter.rotation).mult(this.settings.inheritRotation)),


                    1, this.settings.lifetime.evaluate(Math.random()), this.settings.texture);
                if (this.settings.rotateToVelocity) newP.rotation = newP.velocityAngle;
                this.particles.push(newP);
                this.container.addChild(newP.sprite);
            }

        }
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.ageRatio < 1) {
                particle.velocity = Vector.fromAngle(particle.velocityAngle).mult(this.settings.velocity.evaluate(particle.ageRatio));

                particle.sprite.scale.set(this.settings.scale.evaluate(particle.ageRatio));

                particle.sprite.alpha = this.settings.alpha.evaluate(particle.ageRatio);
                particle.sprite.tint = this.settings.color.evaluate(particle.ageRatio);
                particle.update(deltaTime);
            }
            else if (particle.ageRatio >= 1) {
                //this.container.removeChild(particle.sprite);
                particle.sprite.destroy();
                this.particles.splice(i, 1);
                i--;
            }
        }
    }
    this.setEmitter = function (position, velocity, rotation) {
        this.emitter.velocity = velocity;
        this.emitter.rotation = rotation;
        this.emitter.position = position;
    }
}

function Ramp(min, max) {
    this.min = min;
    this.max = max;
    this.evaluate = function (value) {
        return min + (max - min) * value;
    }
}
function ColorRamp(min, max) {
    this.min = min;
    this.max = max;
    this.evaluate = function (value) {
        if (value == 0) return min;
        else {

            var ah = this.min,
                ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
                bh = this.max,
                br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
                rr = ar + value * (br - ar),
                rg = ag + value * (bg - ag),
                rb = ab + value * (bb - ab);

            return ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0)/*.toString(16).slice(1)*/;
        }
    }
}



//#endregion
