const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const showDirectionCheckbox = document.getElementById("showDirectionCheckbox");
const showFOVCheckbox = document.getElementById("showFOVCheckbox");

let play = false;

function pressPlay() {
    play = !play;
    animate();
}

class Rabbit {
    constructor(x, y, speed, visionRange, fov) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.visionRange = visionRange;
        this.fov = fov;
        this.direction = 0;
        this.state = "wander";
    }

    move() {
        if (this.state == "wander") {
            if (Math.random() < 0.5) {
                this.direction = getRandomlyAlteredAngle(this.direction);
            }
        }
        let dxdy = radiansToXY(this.direction, this.speed);
        this.x += dxdy[0];
        if (this.x < 0) {
            this.x = canvas.width;
        } else if (this.x > canvas.width) {
            this.x = 0;
        }
        this.y += dxdy[1];
        if (this.y < 0) {
            this.y = canvas.height;
        } else if (this.y > canvas.height) {
            this.y = 0;
        }
    }

    drawSelf() {
        drawCircle(this.x, this.y, 10, "white");
    }

    drawDirection() {
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + (100 * Math.cos(this.direction)), this.y + (100 * Math.sin(this.direction)));
        ctx.stroke();
    }

    drawVision() {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.arc(this.x, this.y, this.visionRange, this.direction - (this.fov / 2), this.direction + (this.fov / 2));
        ctx.lineTo(this.x, this.y);
        ctx.fill();
    }

    canSee(object) {
        if (distanceBetween2Points(this.x, this.y, object.x, object.y) <= this.visionRange) {
            let v1 = getVector(this.x, this.y, object.x, object.y);
            let v2 = getVector(this.x, this.y, this.x + (100 * Math.cos(this.direction)), this.y + (100 * Math.sin(this.direction)));
            let a = angleBetweenTwoVectors(v1, v2);
            if (a <= this.fov) {
                return true;
            }
        }
        return false;
    }
}

class Plant {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    drawSelf() {
        drawCircle(this.x, this.y, 10, "darkgreen");
    }
}

function drawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function getRandomlyAlteredAngle(angle) {
    let diff = (2 * Math.PI) / 50;
    if (Math.random() < 0.5) {
        return angle + diff;
    }
    return angle - diff;
}

function getRandomAngle() {
    return (Math.random() * 4 * Math.PI) - (2 * Math.PI);
}

function animate() {
    clearCanvas();
    for (let i = 0; i < rabbits.length; i++) {
        let r = rabbits[i];
        r.move();
        r.state = "wander";
        r.drawSelf();
        if (showFOVCheckbox.checked) {
            r.drawVision();
        }
        if (showDirectionCheckbox.checked) {
            r.drawDirection();
        }
        if (play) {
            requestAnimationFrame(animate);
        }
    }
    for (let i = 0; i < plants.length; i++) {
        let p = plants[i];
        p.drawSelf();
        if (rabbits[0].canSee(plants[i])) {
            rabbits[0].state = "beeline";
            console.log(true);
        }
        if (hasCollision(rabbits[0], plants[i])) {
            plants.splice(i, 1);
            i--;
        }
    }
}

function hasCollision(object1, object2) {
    return distanceBetween2Points(object1.x, object1.y, object2.x, object2.y) <= 20;
}

function drawTriangle(x1, y1, x2, y2, x3, y3, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.fill();
}

function radiansToXY(dirRadians, h) {
    return [h * Math.cos(dirRadians), h * Math.sin(dirRadians)];
}

function distanceBetween2Points(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function getVector(ox, oy, dx, dy) {
    return [dx - ox, dy - oy];
}

function dotProduct(v1, v2) {
    return (v1[0] * v2[0]) + (v1[1] * v2[1]);
}

function magnitude(v) {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
}

function angleBetweenTwoVectors(v1, v2) {
    return Math.acos(dotProduct(v1, v2)/(magnitude(v1) * magnitude(v2)));
}

function rad2Deg(rad) {
    return (rad / (2 * Math.PI)) * 360;
}

let rabbits = [new Rabbit(x=300, y=300, speed=2.5, visionRange=300, fov=0.25*Math.PI)];
let plants = [];
for (let i = 0; i < 20; i++) {
    plants.push(new Plant(Math.random() * canvas.width, Math.random() * canvas.height));
}

animate();