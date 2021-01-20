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
    this.rotate = function (angle) {
        return new Vector(
            this.x * Math.cos(angle) - this.y * Math.sin(angle),
            this.x * Math.sin(angle) + this.y * Math.cos(angle)
        );
    }
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

function Entity(type) {
    this.position = new Vector(0, 0);
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.type = type;
    this.id = Entity.list.length;
    Entity.list.push(this);
    this.sprite = new ShadedSprite(this, "asteroid", { size: 0.35 });
    this.update = function (dt) {
        this.rotation += this.rotationSpeed * dt;
        this.sprite.update({ directional: true, rotation: -2 });

    };
}
Entity.list = [];


function ShadedSprite(parent, prefix, sizeObject) {
    this.container = new PIXI.Container();
    this.parent = parent;
    this.sizeObject = sizeObject;
    this.base = new PIXI.Sprite(loader.resources[prefix + "_base"].texture);
    this.dark = new PIXI.Sprite(loader.resources[prefix + "_dark"].texture);
    this.outline = new PIXI.Sprite(loader.resources[prefix + "_outline"].texture);
    this.lightMask = new PIXI.Sprite(loader.resources["lightMask"].texture);
    this.outlineMask = new PIXI.Sprite(loader.resources["outlineMask"].texture);
    this.shadow = new PIXI.Sprite(loader.resources["shadow"].texture);

    this.base.anchor.set(0.5);
    this.dark.anchor.set(0.5);
    this.outline.anchor.set(0.5);
    this.lightMask.anchor.set(0.5);
    this.outlineMask.anchor.set(0.5);
    this.shadow.anchor.set(0.5, 0.09);

    /* DEL THIS */
    this.dark.scale.set(0.35);
    this.base.scale.set(0.35);
    this.outline.scale.set(0.35);

    this.lightMask.scale.set(sizeObject.size);
    this.outlineMask.scale.set(sizeObject.size);

    this.shadow.scale.set(sizeObject.size, 1);
    this.shadow.alpha = 0.2;

    this.base.mask = this.lightMask;
    this.outline.mask = this.outlineMask;

    this.container.addChild(
        this.shadow,
        this.dark,
        this.base,
        this.outline,
        this.lightMask,
        this.outlineMask
    );

    gameContainer.addChild(this.container);

    this.update = function (source) {

        this.container.position.set(this.parent.position.x, this.parent.position.y);

        this.dark.rotation = (this.parent.rotation);
        this.base.rotation = (this.parent.rotation);
        this.outline.rotation = (this.parent.rotation);

        let rotation;
        let distanceRatio;
        if (!source.directional) {
            distanceRatio = source.range / Math.sqrt(Math.pow(source.position.y - this.container.y, 2) + Math.pow(source.position.x - this.container.x, 2));
            rotation = Math.atan2(source.position.y - this.container.y, source.position.x - this.container.x);
        } else {
            rotation = source.rotation;
            distanceRatio = 1;
        }

        this.lightMask.rotation = rotation;
        this.outlineMask.rotation = rotation;

        this.lightMask.alpha = Math.pow(Math.min(distanceRatio, 1), 2);
        this.outlineMask.alpha = Math.pow(Math.min(distanceRatio, 1), 2);
        this.shadow.rotation = rotation + Math.PI / 2;
    }
}


function Ship() {
    this.stats;
    this.position = new Vector(0, 0);
    this.velocity = new Vector(0, 0);
    this.rotation = 0;
    this.control = new Vector(0, 0);
    this.afterBurnerActive = 0;
    this.afterBurnerFuel = 0;
    this.trails = [new Trail(this, new Vector(-30, 0))];
    this.sprite = new ShadedSprite(this, "ship", { size: 0.35 });

    this.init = function (type) {
        this.stats = type;
    };

    this.update = function (dt) {

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        this.sprite.update({ directional: true, rotation: -2 });
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
    /*this.particleSystems[0] = new ParticleSystem({
        offset: new Vector(-20, 0),
        texture: loader.resources.spark.texture,
        maxParticles: 10000,
        emitRate: 100,
        inheritVelocity: -0.01,
        inheritRotation: -30,
        rotateToVelocity: true,
        randomRotation: false,
        randomVelocity: 5,
        scale: new Ramp(1, 1),
        alpha: new Ramp(.8, 0),
        velocity: new Ramp(1000, 800),
        color: new ColorRamp(0xFFFFFF, 0x1199FF),
        lifetime: new Ramp(0.1, 0.1),
        rotationSpeed: new Ramp(0, 0)
    });*/
    /*this.particleSystems[1] = new ParticleSystem({
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
    });*/
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
        miniMap.removeChild(this.miniMapMarker);
    }
    this.lensFlare = new LensFlare();
    this.toGlobal = function (vector) {
        //let rv = Vector.fromAngle(this.ship.rotation);
        let cos = Math.cos(this.ship.rotation);
        let sin = Math.sin(this.ship.rotation);
        return new Vector(vector.x * cos - vector.y * sin, vector.x * sin + vector.y * cos).add(this.ship.position);
    };
    this.miniMapMarker = new PIXI.Sprite(loader.resources.marker1.texture);
    miniMap.addChild(this.miniMapMarker);
    this.miniMapMarker.anchor.set(0.5);
    this.miniMapMarker.tint = Math.floor(Math.random() * 16777215);
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
            offset: new Vector(0, 0),
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
        this.emitter.position = position.add(this.settings.offset.rotate(rotation));
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
        this.emitter.position = obj.position.result().add(this.settings.offset.rotate(this.emitter.rotation));
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

function Graph(values, scale) {
    if (scale != null) {
        for (let i = 0; i < values.length; i++) values[i] *= scale;
    }

    this.values = values;
    this.evaluate = function (value) {
        let length = this.values.length - 1;
        let bottom = Math.floor(value * length);
        let top = Math.ceil(value * length);
        let min = this.values[bottom];
        let max = this.values[top];
        return min + (max - min) * (value * length - bottom);
    };
}

function LensFlare() {
    this.position = new Vector(0, 0);
    this.sprites = [];
    this.sprites[0] = new PIXI.Sprite(loader.resources.lensflare.texture);
    //this.sprites[1] = new PIXI.Sprite(loader.resources.lensflare1.texture);
    //this.sprites[2] = new PIXI.Sprite(loader.resources.lensflare2.texture);
    this.sprites.forEach(sprite => {
        sprite.anchor.set(0.5);
        sprite.scale.set(0.13);
        sprite.blendMode = PIXI.BLEND_MODES.ADD;
        app.stage.addChild(sprite);
    });
    this.spriteOffsets = [1, 0.5, -0.7];
    this.enbaled = true;
    this.tint = 0x5599FF;
    this.update = function (pos) {
        this.position = pos.result();
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].x = screen.center.x + this.position.x * this.spriteOffsets[i];
            this.sprites[i].y = screen.center.y + this.position.y * this.spriteOffsets[i];
            this.sprites[i].tint = this.tint;
            this.sprites[i].visible = this.enabled;

        }
    }
    this.delete = function () {
        this.sprites.forEach(sprite => {
            app.stage.removeChild(sprite);
        });
    }
}



function Trail(emitter, offset) {
    this.emit = false;
    this.offset = offset ?? Vector.zero();
    this.color = new ColorRamp(0x6ae2f2, 0x5f2eff);
    this.boostColor = new ColorRamp(0xffffee, 0xff0077);
    this.baseColor = new ColorRamp(0xaaffff, 0x003388);
    this.emitter = emitter;
    this.firstPoint = null;
    this.scale = new Ramp(10, 0);
    this.maxAge = 1;
    this.framesPerEmit = 2;
    this.framesFromEmit = 0;
    this.points = 0;
    this.maxHeat = 1;
    this.heat = 0;
    this.heatingMultiplier = 1;
    this.coolingMultiplier = 3;
    this.heatRatioMap = new Ramp(0.8, 0);
    this.heatRatio = this.heatRatioMap.min;
    this.update = function (deltaTime) {

        //console.log(this.points);
        let point = this.firstPoint;
        let previousPoint = this.firstPoint;
        let emitPos = this.offset.rotate(this.emitter.rotation).add((this.emitter.position));
        while (point != null) {
            point.age += deltaTime;
            point.visualAge = Math.min(this.maxAge, point.visualAge + deltaTime);
            if (point.age >= this.maxAge) {
                this.firstPoint = point.nextPoint;
                //console.log(this.firstPoint);
                this.points--;
                //console.log("removing point");
            }
            else {
                //let ageRatio = point.age / this.maxAge;
                let visualAgeRatio = point.visualAge / this.maxAge;
                let color = point.colorRamp.evaluate(visualAgeRatio);
                //if (point.stop) color = 0xff0000;
                let scale = this.scale.evaluate(visualAgeRatio);
                graphics.beginFill(color);
                graphics.moveTo(point.pos.x, point.pos.y);
                graphics.lineStyle(0, color);
                graphics.drawCircle(point.pos.x, point.pos.y, scale / 2);
                graphics.lineStyle(scale, color);
                if (!point.stop) {
                    if (point.nextPoint != null) {
                        graphics.lineTo(point.nextPoint.pos.x, point.nextPoint.pos.y);
                    }
                    else if (this.heat > 0) {
                        graphics.lineTo(emitPos.x, emitPos.y);
                        graphics.lineStyle(0, color);
                        graphics.drawCircle(emitPos.x, emitPos.y, scale / 2);
                    }
                }
                graphics.endFill();
            }
            previousPoint = point;
            point = point.nextPoint;
        }
        if (this.emit) {
            this.heat = Math.min(this.maxHeat, this.heat + deltaTime * this.heatingMultiplier);
            this.heatRatio = this.heatRatioMap.evaluate(this.heat / this.maxHeat);
        }
        else {
            if (this.heat > 0) {
                this.heat = Math.max(0, this.heat - deltaTime * this.coolingMultiplier);
                this.heatRatio = this.heatRatioMap.evaluate(this.heat / this.maxHeat);
                if (this.heat == 0) {
                    previousPoint.nextPoint = new Point(emitPos, true, this.maxAge * this.heatRatio, this.color);
                    this.points++;
                }
            }
        }
        if (this.emitter.control.y == 1) {
            this.emit = true;
            if (this.emitter.afterBurnerUsed == 1)
                this.color = this.boostColor;
            else
                this.color = this.baseColor;

        }
        else {
            if (previousPoint) {
                if (this.emit) {
                    //previousPoint.nextPoint = new Point(emitPos, true,this.maxAge-this.emitTime);
                    //this.points++;
                    //this.emitTime = this.minHeatRatio;
                }
            }
            this.emit = false;
        }
        if (this.heat > 0) {
            this.framesFromEmit++;
            if (this.framesFromEmit >= this.framesPerEmit) {
                if (previousPoint)
                    previousPoint.nextPoint = new Point(emitPos, false, this.maxAge * this.heatRatio, this.color);
                else
                    this.firstPoint = new Point(emitPos, false, this.maxAge * this.heatRatio, this.color);
                this.points++;
                this.framesFromEmit = 0;
            }
        }
    }
    Trail.trails.push(this);
}

Trail.trails = [];

function Point(vector, stop, age, color) {
    this.colorRamp = color;
    this.nextPoint = null;
    this.age = 0;
    this.visualAge = age ?? 0;
    //console.log("added point with age " + this.age);
    this.pos = { x: vector.x, y: vector.y };
    this.stop = stop ?? false;
}

//#endregion
