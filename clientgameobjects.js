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
    };

    this.result = function () {
        return new Vector(this.x, this.y);
    };
    this.lerp = function (vector, amount) {
        return new Vector(
            this.x + (vector.x - this.x) * amount,
            this.y + (vector.y - this.y) * amount
        );
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


var Universe = {};
Universe.gasMap = [];

function Entity() {
    this.position = new Vector(0,0);
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.type = 0;
    this.id = Entity.list.length;
    Entity.list.push(this);
    this.update = function (dt) {
        this.rotation += this.rotationSpeed * dt;
        this.sprite.rotation = this.rotation;
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    };
    this.sprite = new PIXI.Sprite(loader.resources.circle_r300.texture);
    this.sprite.x = this.position.x;
    this.sprite.y = this.position.y;
    this.sprite.anchor.set(0.5);
    gameContainer.addChild(this.sprite);
}
Entity.list = [];

function Ship() {
    this.stats;
    this.position = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.rotation = 0;
    this.control = new Vector(0, 0);
    this.afterBurnerActive = 0;
    this.afterBurnerFuel = 0;

    this.init = function (type) {
        this.stats = type;
    };

    this.update = function (dt) {
        let stats = this.stats;
        console.log(stats);

        if (this.control.x != 0) {
            // rotationace
            this.rotation +=
                (stats.rotationSpeed +
                    this.afterBurnerActive * stats.afterBurnerAgilityBonus) *
                this.control.x *
                dt;
        }

        if (this.control.y != 0) {
            // zrychlení / brždění
            let pointing = Vector.fromAngle(this.rotation).mult(this.control.y);
            pointing.mult(dt);
            if (this.control.y > 0) {
                pointing.normalize(
                    stats.accel +
                    this.afterBurnerActive * stats.afterBurnerAgilityBonus
                );
            } else {
                pointing.normalize(
                    stats.revAccel +
                    this.afterBurnerActive * stats.afterBurnerAgilityBonus
                );
            }
            this.velocity.add(pointing);
        }

        if (
            this.velocity.length() >=
            stats.speed + this.afterBurnerActive * stats.afterBurnerSpeedBonus
        ) {
            this.velocity.normalize(
                stats.speed +
                this.afterBurnerActive * stats.afterBurnerSpeedBonus
            );
        }

        this.position.add(this.velocity.result().mult(dt));
    };
}

function Player(id) {
    this.nick = "nick";
    this.ship;
    this.id = id;
    this.ship = new Ship();
    this.ship.init(ShipType.types["Debug"]);
    this.sprite = new PIXI.Sprite(loader.resources.player1.texture);
    this.sprite.scale.set(0.5);
    this.sprite.anchor.set(0.5);
    Player.players.set(this.id, this);
    this.particleSystems = [];
    this.particleSystems[0] = new ParticleSystem({
        texture: loader.resources.spark.texture,
        maxParticles: 10000,
        emitRate: 200,
        inheritVelocity: 0,
        inheritRotation: -60,
        rotateToVelocity: true,
        randomRotation: false,
        randomVelocity: 10,
        scale: new Ramp(1, 1),
        alpha: new Ramp(1, 0),
        velocity: new Ramp(1000, 500),
        color: new ColorRamp(0xFFFFFF, 0x1199FF),
        lifetime: new Ramp(0.1, 0.15),
        rotationSpeed: new Ramp(0, 0)
    });
    this.particleSystems[1] = new ParticleSystem({
        texture: loader.resources.kour7.texture,
        maxParticles: 10000,
        emitRate: 15,
        inheritVelocity: 0,
        inheritRotation: -50,
        rotateToVelocity: true,
        randomRotation: true,
        randomVelocity: 20,
        scale: new Ramp(0.5, 5),
        alpha: new Ramp(0.15, 0),
        velocity: new Ramp(500, 0),
        color: new ColorRamp(0xFFFFFF, 0xFDFDFD),
        lifetime: new Ramp(1, 3),
        rotationSpeed: new Ramp(-1, 1)
    });
    this.particleSystems[2] = new ParticleSystem({
        enabled: true,
        texture: loader.resources.kour7.texture,
        maxParticles: 10000,
        emitRate: 120,
        inheritVelocity: 0,
        inheritRotation: -50,
        rotateToVelocity: true,
        randomVelocity: 0,
        randomRotation: true,
        scale: new Ramp(0.1, 1.5),
        alpha: new Ramp(0.1, 0),
        velocity: new Ramp(15, 0),
        color: new ColorRamp(0xBEDEFE, 0x0077FF),
        lifetime: new Ramp(40, 10),
        rotationSpeed: new Ramp(-2, 2)
    });
    gameContainer.addChild(this.sprite);
    this.nameText = new PIXI.Text(this.nick + this.id, { fontFamily: "Montserrat", fontSize: 30, fill: 0xFFFFFF, align: "center" });
    gameContainer.addChild(this.nameText);
    this.nameText.anchor.set(0.5);
    this.delete = function () {
        gameContainer.removeChild(this.sprite);
        gameContainer.removeChild(this.nameText);
        this.lensFlare.delete();
        this.particleSystems.forEach(ps => {
            ps.delete();
        });
        Player.players.delete(this.id);
    }
    this.lensFlare = new LensFlare();
    this.toGlobal = function(vector){
        //let rv = Vector.fromAngle(this.ship.rotation);
        let cos = Math.cos(this.ship.rotation);
        let sin = Math.sin(this.ship.rotation);
        return new Vector(vector.x*cos - vector.y*sin,vector.x*sin + vector.y*cos).add(this.ship.position);
    };

    
}
Player.players = new Map();

function Particle(pos, vel, rot, lifetime, texture, rotSpeed, colorRamp) {
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
    this.rotationSpeed = rotSpeed || 0;
    this.colorRamp = colorRamp;
    this.update = function (deltaTime) {
        if (this.age != 0) {
            this.position.add(this.velocity.result().mult(deltaTime));
        }
        this.age += deltaTime;
        this.ageRatio = this.age / this.lifetime;
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
        this.rotation += this.rotationSpeed * deltaTime;
        this.sprite.rotation = this.rotation;
        this.sprite.tint = this.colorRamp.evaluate(this.ageRatio);
        //console.log("DT:"+deltaTime,this.age);
    };
}

function ParticleSystem(settings) {
    this.emitBuildup = 0;
    this.particles = [];
    this.emitter = {
        velocityAngle: 0,
        position: new Vector.zero(),
        oldPosition: new Vector.zero(),
        velocity: new Vector.zero(),
        rotation: 0,
        oldRotation: 0,
        olderRotation: 0,
    };
    this.container = new PIXI.ParticleContainer(10000, {
        scale: true,
        position: true,
        rotation: true,
        tint: true,
    });
    //this.container = new PIXI.Container();
    //TODO: WHY BROKEN UPDATE WITH PARTICLECONTAINER?????????
    //this.container.blendMode = PIXI.BLEND_MODES.SCREEN;
    gameContainer.addChild(this.container);
    if (settings != null) this.settings = settings;
    else {
        this.settings = {
            enabled: true,
            texture: loader.resources.spark.texture,
            maxParticles: 100,
            emitRate: 1,
            inheritVelocity: 0,
            inheritRotation: -50,
            rotateToVelocity: true,
            randomRotation: false,
            randomVelocity: 50,
            scale: new Ramp(1, 1),
            alpha: new Ramp(1, 0),
            velocity: new Ramp(600, 0),
            color: new ColorRamp(0xffffff, 0x1199ff),
            lifetime: new Ramp(0.1, 0.5),
            rotationSpeed: new Ramp(0, 0),
        };
    }
    this.update = function (deltaTime) {
        if (
            this.settings.enabled &&
            this.particles.length < this.settings.maxParticles
        ) {
            this.emitBuildup += this.settings.emitRate * deltaTime;
            /*let testSprite = new PIXI.Sprite(this.settings.texture);
            this.container.addChild(testSprite);
            testSprite.destroy();*/
            //this.container.containerUpdateTransform();
            let thisFrameBuildup = this.emitBuildup;
            //console.log(thisFrameBuildup);
            while (this.emitBuildup > 1) {
                this.emitBuildup--;
                let buildupRatio = this.emitBuildup / thisFrameBuildup;
                let newP = new Particle(
                    this.emitter.position.lerp(
                        this.emitter.oldPosition,
                        1 - buildupRatio
                    ),
                    this.emitter.velocity
                        .result()
                        .mult(this.settings.inheritVelocity)
                        .add(
                            new Vector(
                                0.5 - Math.random(),
                                0.5 - Math.random()
                            ).mult(this.settings.randomVelocity)
                        )
                        .add(
                            Vector.fromAngle(
                                new Ramp(
                                    this.emitter.oldRotation,
                                    this.emitter.rotation
                                ).evaluate(buildupRatio)
                            ).mult(this.settings.inheritRotation)
                        ),

                    0,
                    this.settings.lifetime.evaluate(Math.random()),
                    this.settings.texture,
                    this.settings.rotationSpeed.evaluate(Math.random()),
                    this.settings.color.copy()
                );
                newP.velocity = Vector.fromAngle(newP.velocityAngle).mult(
                    this.settings.velocity.min
                );
                newP.position.add(
                    newP.velocity
                        .result()
                        .mult(deltaTime)
                        .lerp(Vector.zero(), buildupRatio)
                );
                if (this.settings.rotateToVelocity)
                    newP.rotation = newP.velocityAngle;
                if (this.settings.randomRotation)
                    newP.rotation = Math.random() * 6.28;
                this.particles.push(newP);
                this.container.addChild(newP.sprite);
            }
        }

        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            if (particle.ageRatio < 1) {
                particle.velocity = Vector.fromAngle(
                    particle.velocityAngle
                ).mult(this.settings.velocity.evaluate(particle.ageRatio));

                particle.sprite.scale.set(
                    this.settings.scale.evaluate(particle.ageRatio)
                );

                particle.sprite.alpha = this.settings.alpha.evaluate(
                    particle.ageRatio
                );
                particle.update(deltaTime);
            } else if (particle.ageRatio >= 1) {
                //this.container.removeChild(particle.sprite);
                particle.sprite.destroy();
                this.particles.splice(i, 1);
                i--;
            }
        }
    };
    this.setEmitter = function (position, velocity, rotation) {
        this.emitter.velocity = velocity;
        this.emitter.rotation = rotation;
        this.emitter.position = position;
    };
    this.updateEmitter = function (obj) {
        this.emitter.velocityAngle = this.emitter.velocity.toAngle();
        this.emitter.velocity = obj.velocity.result();
        if (
            this.emitter.rotation != obj.rotation ||
            (this.emitter.olderRotation == this.emitter.oldRotation &&
                this.emitter.rotationAge >= 3)
        ) {
            this.emitter.oldRotation = this.emitter.rotation;
            this.emitter.rotationAge = 0;
        }
        this.emitter.olderRotation = this.emitter.oldRotation;
        this.emitter.rotationAge++;
        this.emitter.rotation = obj.rotation;
        this.emitter.oldPosition = this.emitter.position.result();
        this.emitter.position = obj.position.result();
    };
    this.delete = function () {
        gameContainer.removeChild(this.container);
    };
}

function Ramp(min, max) {
    this.min = min;
    this.max = max;
    this.evaluate = function (value) {
        return this.min + (this.max - this.min) * value;
    };
}
function ColorRamp(min, max) {
    this.min = min;
    this.max = max;
    this.evaluate = function (value) {
        if (value == 0) return this.min;
        else {
            var ah = this.min,
                ar = ah >> 16,
                ag = (ah >> 8) & 0xff,
                ab = ah & 0xff,
                bh = this.max,
                br = bh >> 16,
                bg = (bh >> 8) & 0xff,
                bb = bh & 0xff,
                rr = ar + value * (br - ar),
                rg = ag + value * (bg - ag),
                rb = ab + value * (bb - ab);

            return (
                ((1 << 24) + (rr << 16) + (rg << 8) + rb) |
                0 /*.toString(16).slice(1)*/
            );
        }
    };
    this.copy = function () {
        return new ColorRamp(this.min, this.max);
    };
}

function LensFlare(){
    this.position = new Vector(0,0);
    this.sprites = [];
    this.sprites[0] = new PIXI.Sprite(loader.resources.lensflare0.texture);
    //this.sprites[1] = new PIXI.Sprite(loader.resources.lensflare1.texture);
    //this.sprites[2] = new PIXI.Sprite(loader.resources.lensflare2.texture);
    this.sprites.forEach(sprite => {
        sprite.anchor.set(0.5);
        sprite.scale.set(0.7);
        sprite.blendMode = PIXI.BLEND_MODES.ADD;
        app.stage.addChild(sprite);
    });
    this.spriteOffsets = [1,0.5,-0.7];
    this.enbaled = true;
    this.tint = 0x5599FF;
    this.update = function(pos){
        this.position = pos.result();
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].x = screen.center.x + this.position.x * this.spriteOffsets[i];
            this.sprites[i].y = screen.center.y + this.position.y * this.spriteOffsets[i];
            this.sprites[i].tint = this.tint;
            this.sprites[i].visible = this.enabled;
            
        }
    }
    this.delete = function(){
        this.sprites.forEach(sprite => {
            app.stage.removeChild(sprite);
        });
    }
}

//#endregion
