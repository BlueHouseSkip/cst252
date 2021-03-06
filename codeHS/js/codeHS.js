/* Top Down Tank Shooter v1.01
 *
 * What I Need:
 * - Multi-Purpose Movement Script  |
 * - Player Input Interpreter       |
 * - Opponent AI                    |
 * - Multi-Purpose Collisions       |
 * - Projectile Interpreting        |
 * - Main Menu / Restart            |
 * - Image Import Function          |
 * - Random Area Generator          |
 * - Enemy Placement Script         |
 *
 * https://eloquentjavascript.net <== good source for complex stuff
 *
 * Important information:
 * - Degrees are used a lot in this script.
 * - This is a reference for how they are interpreted:
 *
 *            270
 *       225 .-""-. 315
 *          /      \
 *     180 ;        ; 0
 *          \      /
 *       315 '-..-' 45
 *             90
 *
 * InputBin:  0     0   0   0
 *           Left Right Up Down
 * math stuff:
 * https://math.stackexchange.com/questions/1676897/how-can-you-find-the-distance-between-the-center-and-edges-of-a-rectangle-a-li
 * https://www.quora.com/Is-there-a-way-to-calculate-the-angle-of-a-rectangles-diagonal
 * https://stackoverflow.com/questions/2676719/calculating-the-angle-between-the-line-defined-by-two-points
 * https://keisan.casio.com/exec/system/1223014436
 */

//### GLOBAL_VARS (Unchanging) ###


// ##################################### CONTINUE IMPLEMENTING SCORE. WE ARE WORKING IN projectileCollision();

// FIX GAME OVER

// Map globals
const MAP_ROWS = 5;
const MAP_COLS = 5;
const WALL_WIDTH = 7;
const CELL_WIDTH = easyFrac(1,MAP_COLS,getWidth());
const CELL_HEIGHT= easyFrac(1,MAP_ROWS,getHeight());
const WALL_COLOR = Color.orange;

// Tank globals
const TANK_WIDTH = CELL_WIDTH*0.42;
const TANK_HEIGHT= CELL_HEIGHT*0.45;
const TURN_SPEED = 10; //in degrees per step
const MOVE_SPEED = 1.5; //in x,y per step
const COLLIDE_BUFFER = 1;

// Projectile Globals
const PROJ_RADIUS = 5;
const PROJ_COLOR1 = Color.red;
const PROJ_COLOR2 = Color.yellow;
const PROJ_SPEED = 3.2; // MUST BE A WHOLE NUMBER
const PROJ_BUFFER = 1;
const PROJ_FUSE = 100; // How long until the projectile destroys itself

// Enemy Globals
const ENEMIES_PER_BOARD = 5;
const ENEMY_WIDTH = CELL_WIDTH*0.40;
const ENEMY_HEIGHT=CELL_HEIGHT*0.35;
const ENEMY_ATTACK_RADIUS = 500;
const ENEMY_FIRE_DELAY = 100; // how many steps before the enemy can fire again.

// active objects
var playerObj;
var enemyArr = new Array();
var projArr = new Array();
var AIProjArr = new Array();
var scoreObj;

// Exit vars
const EXIT_BG_COLOR = "#ae00ff";
const EXIT_STAIRS_COLOR = "#ff0099";
var EXIT_EXISTS = false;
var ENTER_X = 0;
var ENTER_Y = 0;

// Score vars
var SCORE = 0;
const SCORE_PER_ENEMY = 100;
const SCORE_PER_WALL_BOUNCE = 50; // Stored in the ball and if it hits a target the points are added.
const TIME_SCORE = 5000; // if(TIME_SCORE - board_time > 0) score += TIME_SCORE - board_time;
var   LIVES = 3; // Number of lives you start with
var   TIME_ON_PAST_BOARDS = 0;

// Color vars
const PLR_BASE_COLOR = Color.purple;
const PLR_TURRET_COLOR = "#eb0000";
const PLR_HIT_COLOR1 = "#ec6bff";
const PLR_HIT_COLOR2 = Color.cyan;
const PLR_I_FRAMES = 200;
const ENEMY_BASE_COLOR = Color.gray;
const ENEMY_TURRET_COLOR = "#1f1f1f";
const GAME_OVER_COLOR = "#ff00ff";

// Misc globals
const GAME_OVER_DELAY = 10; // In steps, how long to wait after death to display the game over screen.

// Debug objects
var debug_line = new Line(0,0,0,0);
var debug_dot = new Circle(5);
const DEBUG = new Array(false, false, false); // DEBUG[0] = println; DEBUG[1] = graphical; DEBUG[2] = console.log;
var collideDebug = new Array(); // used to check the player's collision points
const GARBAGE_COLLECT = 1000; // how many steps before garbage collect. NOT IMPLEMENTED BECAUSE IT DOESN'T WORK
var STEPS = 0; // the number of steps that have passed.

function start() {
    newGame();
}

function newGame() {
    // createExit(); For quick switching between levels;

    // A simple message to the player about the game.
    print("Welcome to my tank game. v3.08\n * Use the arrow keys to move your tank\n * Use the mouse to aim your tank's gun.\n * Left click to fire.\n");
    print("You have 3 lives, try to get the highest score! \nKill all the enemies to go to the next level.\n");

    var maze = newMaze(MAP_COLS,MAP_ROWS);
    var wallArray = mazeToDrawArray(maze, WALL_WIDTH, WALL_COLOR, true);

    // Create score monitor
    scoreObj = new Text(SCORE, "15pt Helvetica");
    scoreObj.setColor(Color.black);
    scoreObj.setPosition(getWidth()-5-scoreObj.getWidth(), getHeight()-5);
    add(scoreObj);

    // Create player
    playerObj = createTank(TANK_WIDTH, TANK_HEIGHT, PLR_BASE_COLOR, 0, 0, 5, TANK_HEIGHT*0.6, PLR_TURRET_COLOR, true);
    playerObj.livesCounter = new Text(LIVES, "15pt Helvetica");
    playerObj.livesCounter.setColor(Color.white);
    playerObj.livesCounter.setPosition(playerObj.pos.x - playerObj.livesCounter.getWidth()/2,
        playerObj.pos.y + playerObj.livesCounter.getHeight()/2);
    addTank(playerObj);
    playerObj.hitStep = 0;

    // Create 5 enemies in random cells
    for(var i=0;i<=ENEMIES_PER_BOARD;i++) {
        var __x = 0;
        var __y = 0;
        while(__x === 0 && __y === 0) {
            __x = Randomizer.nextInt(0,MAP_COLS-1);
            __y = Randomizer.nextInt(0,MAP_ROWS-1);
        }
        enemyArr[i] = createTank(ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_BASE_COLOR, __x, __y, 5, TANK_HEIGHT*0.6, ENEMY_TURRET_COLOR, true);
        enemyArr[i].steps = 0;
        enemyArr[i].shouldFire = false;
        enemyArr[i].lastFired = 0;
        enemyArr[i].active = true;
        enemyArr[i].deactiveStep = null;
        addTank(enemyArr[i]);
    }

    if(DEBUG[1]) {
        add(debug_line);
        debug_dot.setPosition(100,100);
        add(debug_dot);
    }

    if(DEBUG[1]) {
        for(var i=0;i<playerObj.collideArr.length;i++) {
            collideDebug[i] = new Circle(5);
            collideDebug[i].setColor(Color.black);
            collideDebug[i].setPosition(0,0);
            add(collideDebug[i]);
        }
        println("COLLIDE DEBUG CREATED SUCCESSFULY");
    }

    // Key and mouse functions
    mouseMoveMethod(rotateTurretToMouse);
    mouseClickMethod(mouseClick);
    keyDownMethod(keyDown);
    keyUpMethod(keyUp);
    setTimer(playerStep, 10);
    setTimer(enemyStep, 10);
    setTimer(projectileStep, 10);
    setTimer(AIProjStep, 5);
    setTimer(updateScore, 10);
}

function nextBoard() {
    removeAll();
    EXIT_EXISTS = false;
    var maze = newMaze(MAP_COLS,MAP_ROWS);
    var wallArray = mazeToDrawArray(maze, WALL_WIDTH, WALL_COLOR, true);

    // Add the time score
    SCORE += TIME_SCORE - (STEPS - TIME_ON_PAST_BOARDS) > 0 ? Math.round((TIME_SCORE - (STEPS - TIME_ON_PAST_BOARDS) - STEPS)/2) : 0;

    TIME_ON_PAST_BOARDS += STEPS; // Make sure the time score still works for the next level.

    projArr = new Array(); // Remove all active projectiles
    AIProjArr = new Array();
    enemyArr = new Array(); // reset Enemy array in case somehow exit is reached while enemies are still alive.
    for(var i=0;i<=ENEMIES_PER_BOARD;i++) {
        var __x = ENTER_X;
        var __y = ENTER_Y;
        while(__x === ENTER_X && __y === ENTER_Y) {
            __x = Randomizer.nextInt(0,MAP_COLS-1);
            __y = Randomizer.nextInt(0,MAP_ROWS-1);
        }
        enemyArr[i] = createTank(ENEMY_WIDTH, ENEMY_HEIGHT, ENEMY_BASE_COLOR, __x, __y, 5, TANK_HEIGHT*0.6, ENEMY_TURRET_COLOR, true);
        enemyArr[i].steps = 0;
        enemyArr[i].shouldFire = false;
        enemyArr[i].lastFired = 0;
        enemyArr[i].active = true;
        enemyArr[i].deactiveStep = null;
        addTank(enemyArr[i]);
    }
    playerObj.hitStep = STEPS; // Give player I-frames at the beginning of the level
}

function keyDown(e) {
    var startStep = new Array(Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN);
    if(startStep.join('').includes(e.keyCode)) {
        if(e.keyCode == Keyboard.LEFT)  playerObj.inputBin = parseInt('1000',2) | playerObj.inputBin;
        if(e.keyCode == Keyboard.RIGHT) playerObj.inputBin = parseInt('0100',2) | playerObj.inputBin;
        if(e.keyCode == Keyboard.UP)    playerObj.inputBin = parseInt('0010',2) | playerObj.inputBin;
        if(e.keyCode == Keyboard.DOWN)  playerObj.inputBin = parseInt('0001',2) | playerObj.inputBin;
        inputToDeg(playerObj.inputBin,playerObj);
        if(DEBUG[0]) println(`${playerObj.inputBin} to ${playerObj.newDirection}`);
    }
}
function keyUp(e) {
    var startStep = new Array(Keyboard.LEFT, Keyboard.RIGHT, Keyboard.UP, Keyboard.DOWN);
    if(startStep.join('').includes(e.keyCode)) {
        if(e.keyCode == Keyboard.LEFT)  playerObj.inputBin = parseInt('1000',2) ^ playerObj.inputBin;
        if(e.keyCode == Keyboard.RIGHT) playerObj.inputBin = parseInt('0100',2) ^ playerObj.inputBin;
        if(e.keyCode == Keyboard.UP)    playerObj.inputBin = parseInt('0010',2) ^ playerObj.inputBin;
        if(e.keyCode == Keyboard.DOWN)  playerObj.inputBin = parseInt('0001',2) ^ playerObj.inputBin;
        inputToDeg(playerObj.inputBin,playerObj);
    }
}

function updateScore() {
    // Always keep the score on top of everything else
    scoreObj.setPosition(getWidth()-5-scoreObj.getWidth(), getHeight()-5);
    add(scoreObj);
    remove(scoreObj);
    add(scoreObj);
    var __score = parseInt(scoreObj.getLabel());
    if(__score < SCORE) {
        scoreObj.setText(__score+1+Math.floor(easyFrac(1, 25, SCORE - __score)));
    }
}

function gameOver() {
    stopTimer(playerStep);
    stopTimer(enemyStep);
    stopTimer(projectileStep);
    stopTimer(AIProjStep);
    stopTimer(updateScore);
    clear();
    var gameOverText =  new Text("GAME OVER", "30pt Arial Black");
    var scoreText =     new Text(`Your score was: ${SCORE}`, "15pt Arial Black");
    gameOverText.setBorder(true);
    scoreText.setBorder(true);
    gameOverText.setColor(GAME_OVER_COLOR);
    scoreText.setColor(GAME_OVER_COLOR);
    gameOverText.setBorderColor(Color.white);
    scoreText.setBorderColor(Color.white);
    gameOverText.setBorderWidth(5);
    scoreText.setBorderWidth(5);
    gameOverText.setPosition(getWidth()/2 - gameOverText.getWidth()/2, getHeight()/3 + gameOverText.getHeight()/2)
    scoreText.setPosition(getWidth()/2 - scoreText.getWidth()/2, getHeight()*(2/3) + scoreText.getHeight()/2);
    add(gameOverText);
    add(scoreText);
}

function enemyStep() {
    if(enemyArr.length === 0) createExit();
    enemyArr.forEach(function (element, index) {
        if(element.active) {
            element.steps++;
            rotateGun(element.pos.x, element.pos.y, playerObj.pos.x, playerObj.pos.y, element);
            let __distance = getDistanceBtwnPoints(element.pos.x, element.pos.y, playerObj.pos.x, playerObj.pos.y);
            if(__distance <= ENEMY_ATTACK_RADIUS && element.steps % ENEMY_FIRE_DELAY/3 === 0) {
                createProjectile(element.gun.getEndX(), element.gun.getEndY(), PROJ_RADIUS, PROJ_COLOR1, PROJ_SPEED, element.gun.angle, true, element);
            }
            AIProjArr.forEach(proj => {
                if(proj.object === element && proj.playerHit === true) {
                    element.shouldFire = true;
                    }
            });
            if(element.shouldFire && element.steps - ENEMY_FIRE_DELAY >= element.lastFired) {
                createProjectile(element.gun.getEndX(), element.gun.getEndY(), PROJ_RADIUS, PROJ_COLOR1, PROJ_SPEED, element.gun.angle);
                element.shouldFire = false;
                element.lastFired = element.steps;
            }
        } else {
            createProjectile(element.pos.x, element.pos.y, PROJ_RADIUS, Color.orange, 0, 0);
            projArr[projArr.length-1].steps = PROJ_FUSE;
            if(DEBUG[0]) println("tank destroyed");
            removeTank(element);
            enemyArr.splice(index, 1);
        }
    });
}

function mouseClick(e) {
    if(LIVES > 0) createProjectile(playerObj.gun.getEndX(), playerObj.gun.getEndY(), PROJ_RADIUS, PROJ_COLOR1, PROJ_SPEED, playerObj.gun.angle);
}
// __obj is only needed if AItest is true.
function createProjectile(startX, startY, radius, color, speed, angle, AItest=false, __obj=null) {
    projArr.push(new Circle(radius));
    let n = projArr.length-1;
    projArr[n].setColor(color);
    projArr[n].setPosition(startX, startY);
    projArr[n].speed = speed; // The speed the projectile will move at
    projArr[n].angle = angle; // The angle that the projectile move at
    projArr[n].steps = 0;// The number of steps the projectile has existed
    projArr[n].active = true;
    projArr[n].bounces = 0;
    var __newPos = calcCirclePoint(startX, startY, speed, angle, true);
    projArr[n].xVeloc = __newPos.x - startX;
    projArr[n].yVeloc = __newPos.y - startY;
    if(!AItest) add(projArr[n]);
    else { // For invisible AI projectiles
        projArr[n].object = __obj;
        projArr[n].playerHit = false;
        projArr[n].speed = speed*2;
        projArr[n].setColor("#f6ff00")
        let __proj = projArr.splice(n, 1);
        AIProjArr.push(__proj[0]);
        if(DEBUG[1]) add(AIProjArr[AIProjArr.length-1]);
        if(DEBUG[0]) println("created AI proj");
    }
}

function projectileStep() {
    projArr.forEach(function (element, index) {
        if(element.active) {
            element.steps++;
            if(element.steps >= PROJ_FUSE-easyFrac(1,5,PROJ_FUSE)) {
                if(element.steps >= PROJ_FUSE) {
                    projExplode(element);
                } else if(element.steps-(Math.trunc(element.steps/10))*10 === 5) {
                    element.setColor(PROJ_COLOR1);
                } else if(element.steps-(Math.trunc(element.steps/10))*10 === 7) {
                    element.setColor(PROJ_COLOR2);
                }
            }
            projectileCollision(element);
            element.setPosition(element.getX() + element.xVeloc, element.getY() + element.yVeloc);
        } else {
            remove(element);
            projArr.splice(index, 1);
        }
    });
}

function AIProjStep() {
    AIProjArr.forEach(function (element, index) {
        if(element.active) {
            element.steps++;
            if(element.steps >= PROJ_FUSE) {
                element.active = false;
            }
            let __hit = projectileCollision(element, true);
            if(__hit) {
                element.playerHit = true;
            }
            element.setPosition(element.getX() + element.xVeloc, element.getY() + element.yVeloc);
        } else {
            remove(element);
            AIProjArr.splice(index, 1);
        }
    });
}

function playerHit(__obj, __proj) {
    if(DEBUG[0]) println("hit!");
    __proj.xVeloc = 0;
    __proj.yVeloc = 0;
    if(__proj.steps < PROJ_FUSE) __proj.steps = PROJ_FUSE; // This is a dirty fix but it's the fastest
    if(STEPS - playerObj.hitStep >= PLR_I_FRAMES) {
        playerObj.hitStep = STEPS;
        --LIVES;
        playerObj.livesCounter.setLabel(LIVES);
        if(LIVES < 1 && playerObj.hitStep < STEPS - GAME_OVER_DELAY) gameOver();
    }
}

function enemyHit(__obj, __proj) {
    __proj.xVeloc = 0;
    __proj.yVeloc = 0;
    SCORE += SCORE_PER_ENEMY + (SCORE_PER_WALL_BOUNCE*__proj.bounces);
    if(__proj.steps < PROJ_FUSE) __proj.steps = PROJ_FUSE; // This is a dirty fix but it's the fastest
    enemyArr.forEach(function (element, index) {
        if(element.gun === __obj || element.main === __obj || element.turret === __obj) {
            if(DEBUG[0]) println("TANK IDENTIFIED AND DESTROYED");
            element.active = false;
            element.deactiveStep = element.step;
        }
    });
}

function createExit() {
    if(!EXIT_EXISTS) {
        EXIT_EXISTS = true;
        var __x = Randomizer.nextInt(0,MAP_COLS-1);
        var __y = Randomizer.nextInt(0,MAP_ROWS-1);
        ENTER_X = __x;
        ENTER_Y = __y;
        var __xy = cellToPos(__x, __y);
        var exitBG  = new Rectangle(30,30);
        var stairs1 = new Rectangle(exitBG.getWidth()*(3/3), exitBG.getHeight()*(1/3));
        var stairs2 = new Rectangle(exitBG.getWidth()*(2/3), exitBG.getHeight()*(2/3));
        var stairs3 = new Rectangle(exitBG.getWidth()*(1/3), exitBG.getHeight()*(3/3));
        exitBG.setBorderColor(EXIT_BG_COLOR);
        exitBG.setBorderWidth(10);
        exitBG.setColor(EXIT_BG_COLOR);
        stairs1.setColor(EXIT_STAIRS_COLOR);
        stairs2.setColor(EXIT_STAIRS_COLOR);
        stairs3.setColor(EXIT_STAIRS_COLOR);
        exitBG.setPosition(__xy.x - exitBG.getWidth()/2, __xy.y - exitBG.getHeight()/2);
        stairs1.setPosition(exitBG.getX(), exitBG.getY() + (exitBG.getHeight() - stairs1.getHeight()));
        stairs2.setPosition(exitBG.getX(), exitBG.getY() + (exitBG.getHeight() - stairs2.getHeight()));
        stairs3.setPosition(exitBG.getX(), exitBG.getY() + (exitBG.getHeight() - stairs3.getHeight()));
        add(exitBG);
        add(stairs1);
        add(stairs2);
        add(stairs3);
    }
}

function projExplode(__obj) {
    if(__obj.steps >= PROJ_FUSE+15) {
        __obj.active = false;
    } else if([0,2,4,6,8].includes(__obj.steps-(Math.trunc(__obj.steps/10))*10)) {
        __obj.setColor(PROJ_COLOR1);
    } else if([1,3,5,7,9].includes(__obj.steps-(Math.trunc(__obj.steps/10))*10)) {
        __obj.setColor(PROJ_COLOR2);
    }
    if(__obj.xVeloc !== 0) __obj.xVeloc -= 0.1*Math.sign(__obj.xVeloc);
    if(__obj.yVeloc !== 0) __obj.yVelox -= 0.1*Math.sign(__obj.yVeloc);
    __obj.radius++;
}

function projectileCollision(object, returnHitPlayer=false) {
    // Imported from breakout and adapted
    // check collision at 8 points on the circle to make it seem like full collision is in place
    var angleRads = new Array(0.785398, 2.35619, 3.92699, 5.49779);
    var checkPoints = new Array();
    checkPoints[0] = new Array(object.getX() + object.getRadius()+PROJ_BUFFER, object.getY());
    checkPoints[1] = new Array(object.getX() - object.getRadius()-PROJ_BUFFER, object.getY());
    checkPoints[2] = new Array(object.getX(), object.getY() + object.getRadius()+PROJ_BUFFER);
    checkPoints[3] = new Array(object.getX(), object.getY() - object.getRadius()-PROJ_BUFFER);
    for(var i=0;i<4;i++) {
        var tempPoints = calcCirclePoint(object.getX(), object.getY(), object.getRadius()+PROJ_BUFFER, angleRads[i]);
       checkPoints[i+4] = tempPoints;
    }
    // Check if the points are colliding.
    for(var i=0;i<checkPoints.length;i++) {
        if(!returnHitPlayer) remove(object);
        var pointGet = getElementAt(checkPoints[i][0], checkPoints[i][1]);
        if(!returnHitPlayer) add(object);
        if(pointGet !== null && pointGet.color === WALL_COLOR) {
            object.bounces++;
            if(i===0||i===1)        object.xVeloc = -object.xVeloc;
            else if(i===2||i===3)   object.yVeloc = -object.yVeloc;
            else {
                object.xVeloc = -object.xVeloc;
                object.yVeloc = -object.yVeloc;
            }
        } else if(pointGet !== null && pointGet.color === PLR_BASE_COLOR && object.steps >= 4) {
            if(!returnHitPlayer) playerHit(pointGet, object);
            else return true;
        } else if(pointGet !== null && (pointGet.color === ENEMY_BASE_COLOR || pointGet.color === ENEMY_TURRET_COLOR) && object.steps >= 3) {
            if(!returnHitPlayer) enemyHit(pointGet, object);
        } else if(pointGet !== null && (pointGet.color === PROJ_COLOR1 || pointGet.color === PROJ_COLOR2) && object.steps >= 3) {
            object.xVeloc = 0;
            object.yVeloc = 0;
            if(object.steps < PROJ_FUSE) object.steps = PROJ_FUSE;
        }
    }
    return false;
}

function playerStep() {
    STEPS++;
    // Animate I frames, was originally it's own function but JS didn't like that
    if(STEPS - playerObj.hitStep >= PLR_I_FRAMES && playerObj.main.color !== PLR_BASE_COLOR) {
        playerObj.main.color = PLR_BASE_COLOR;
    } else if(STEPS - playerObj.hitStep <= PLR_I_FRAMES && STEPS % 5 === 0) {
        if(playerObj.main.color === PLR_BASE_COLOR || playerObj.main.color === PLR_HIT_COLOR1) playerObj.main.color = PLR_HIT_COLOR2;
        else playerObj.main.color = PLR_HIT_COLOR1;
    }
    var __collide = checkCollision(playerObj, true);
    if(__collide && __collide.length) {
        __collide.forEach(function (element, index) {
            moveTank(playerObj, oppositeAngle(element, false), MOVE_SPEED, false);
            getCollision(playerObj);
            if(DEBUG[0]) println(`COLLIDE HIT, ANGLE: ${element}`);
        });
    }
    if(playerObj.newDirection !== -1) {
        getCollision(playerObj);
        if(!checkCollision(playerObj)) {
            moveTank(playerObj, playerObj.direction, MOVE_SPEED);
        }
        rotateTank(playerObj);

        if(DEBUG[1]) {
            playerObj.collideArr.forEach(function (point, index) {
                collideDebug[index].setPosition(point.x, point.y);
            });
        }
    }
    remove(playerObj.livesCounter);
    add(playerObj.livesCounter);
    playerObj.livesCounter.setPosition(playerObj.pos.x - playerObj.livesCounter.getWidth()/2,
    playerObj.pos.y + (playerObj.livesCounter.getHeight()/2)-3);
}

function moveTank(__obj, direction, speed, deg=true) {
    var __mp = calcCirclePoint(__obj.pos.x, __obj.pos.y, speed, direction, deg);
    __obj.main.setPosition(__mp.x-__obj.main.getWidth()/2, __mp.y-__obj.main.getHeight()/2);
    __obj.turret.setPosition(__mp.x, __mp.y);
    __obj.gun.setPosition(__mp.x, __mp.y);
    var __endpoint = calcCirclePoint(__mp.x, __mp.y, __obj.gun.reach, __obj.gun.angle);
    __obj.gun.setEndpoint(__endpoint.x, __endpoint.y);
    __obj.pos = {x: __mp.x, y: __mp.y};
}

function getWallUnderProj(__x, __y, __objWriteList = new Array()) {
    // Makes sure you can't go through walls by making the collision function unable to see them.
    var foundObj = getElementAt(__x, __y);
    if(foundObj === null) {
        return null;
    } else if (foundObj.color === PROJ_COLOR1 || foundObj.color === PROJ_COLOR2) {
        __objWriteList[__objWriteList.length] = foundObj;
        remove(foundObj);
        getWallUnderProj(__x, __y, __objWriteList);
    } else {
        __objWriteList.forEach(element => {
            if(element !== null && element !== undefined) add(element)
        });
        return foundObj
    }
}

function checkCollision(__obj, returnAngle=false) {
    // Checking collision at the corners of the tank
    var __rtn =  new Array();
    removeTank(__obj); //remove the tank so the walls can be seen
    __obj.collideArr.forEach(function (element, index) {
        var foundObj = getWallUnderProj(element.x, element.y);
        if(foundObj !== null && foundObj !== undefined) {
            if(foundObj.color === WALL_COLOR) { // If the object is orange it sees it as a wall
                if(returnAngle) __rtn.push(__obj.collideAngleArr[index]); // Angle is used to determine where to move away from
                else __rtn.push(true);
            } else if(foundObj.color === EXIT_BG_COLOR || foundObj.color === EXIT_STAIRS_COLOR) {
                nextBoard();
            }
        }
    });
    addTank(__obj); // Add back the tank
    if(returnAngle) return __rtn;
    else {
        if(!Array.isArray(__rtn) || !__rtn.length) return false;
        else return true;
    }
}

function getCollision(__obj) {
    __obj.collideArr = getCirclePoints(__obj.pos.x, __obj.pos.y, __obj.collisionRadius,1,1);
}

function rotateTank(__obj) {
    if(__obj.direction >= 360) __obj.direction -= 360;
    if(__obj.direction < 0)    __obj.direction += 360;
    if(__obj.direction === __obj.newDirection) return 0;
    var __dirSpeed = TURN_SPEED*circumDir(__obj.direction, __obj.newDirection);
    var __diff = Math.abs((__obj.direction) - __obj.newDirection);
    if(__diff > TURN_SPEED) {
        __obj.direction += __dirSpeed;
        __obj.main.rotate(__dirSpeed);
    } else {
        __obj.direction = __obj.newDirection;
        __obj.main.setRotation(__obj.newDirection+90);
        __obj.oldDirection = __obj.direction;
        if(DEBUG[0]) println("ROTATION SET PERFECT");
    }
    if(DEBUG[0]) println(` CONTINUE BC DIFF: ${__obj.direction} TO ${__obj.newDirection}
        OF ${__diff} SPEED: ${__dirSpeed}`);
}

function rotateTurretToMouse(e) {
    var __obj=playerObj;
    if(DEBUG[1]) debugRayCast(e, __obj);
    if(LIVES > 0) rotateGun(__obj.pos.x, __obj.pos.y, e.getX(), e.getY(), __obj);
}

// x1 and y1 represent origin, this is where the gun will come out from
// x2 and y2 represent the point to look at
function rotateGun(x1, y1, x2, y2, __obj) {
    var angle = (Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI) + 180;
    if(angle < 0) angle += 360;
    var __endpt = calcCirclePoint(__obj.pos.x, __obj.pos.y, __obj.gun.reach, angle);
    __obj.gun.setEndpoint(__endpt.x, __endpt.y);
    __obj.gun.angle = angle;
    if(DEBUG[0]) println(angle);
}

function debugRayCast(__m, __obj) {
    debug_line.setPosition(__m.getX(), __m.getY());
    debug_line.setEndpoint(__obj.pos.x, __obj.pos.y);
    debug_line.setLineWidth(5);
    debug_dot.setPosition(__m.getX(),__m.getY());
}

function garbageCollect() {
    //stopTimer(playerStep);
    //setTimer(playerStep, 10);
    println(`TIMER RESET #####################################################`);
}

function createTank(width, height, color, xCell, yCell, gunWidth, gunLength, turretColor, __add=false) {
    var __pos = cellToPos(xCell, yCell);
    var __plr = {main: new Rectangle(width, height),
                turret: new Circle(width/3),
                gun: new Line(__pos.x,__pos.y,0,0),
                pos: {x:__pos.x, y:__pos.y}};
    __plr.main.setColor(color);
    __plr.main.rotation = degToRad(0);
    __plr.newDirection = -1;
    __plr.direction = 270;
    __plr.oldDirection = 270;
    __plr.inputBin = parseInt('0000',2);
    __plr.turret.setColor(turretColor);
    __plr.gun.setColor(turretColor);
    __plr.gun.setLineWidth(gunWidth);
    __plr.main.setPosition   (__pos.x-width/2, __pos.y-height/2);
    __plr.turret.setPosition (__pos.x,__pos.y);
    var __endpt = calcCirclePoint(__pos.x, __pos.y, gunLength, 90);
    __plr.gun.setEndpoint    (__endpt.x, __endpt.y);
    __plr.gun.reach = gunLength;
    __plr.gun.angle = 0;
    __plr.collisionRadius = __plr.main.getWidth() < __plr.main.getHeight() ? __plr.main.getWidth()/1.6 : __plr.main.getHeight()/1.6;
    __plr.collideArr = getCirclePoints(__plr.pos.x, __plr.pos.y, __plr.collisionRadius, 1, 1, true, __plr);
    if(DEBUG[0]) println("Tank created");
    return __plr;
}

function addTank(__obj) {
    add(__obj.main);
    add(__obj.turret);
    add(__obj.gun);
}

function removeTank(__obj) {
    remove(__obj.main);
    remove(__obj.turret);
    remove(__obj.gun);
}

function drawGrid(rows, cols) { // DEBUGGING TOOL
    for(var x=0;x<cols;x++) {
        for(var y=0;y<rows;y++) {
            var rect = new Rectangle(easyFrac(1,cols,getWidth())-2, easyFrac(1,rows,getHeight())-2);
            rect.setColor(Color.white);
            rect.setBorderColor(Color.black);
            rect.setPosition(easyFrac(x,cols,getWidth())+2, easyFrac(y,rows,getHeight())+2);
            add(rect);
        }
    }
}

function mazeToDrawArray(maze, wallWidth, wallColor, addWalls=true) {
    var cellWidth  = getWidth() /maze[0].length;
    var cellHeight = getHeight()/maze.length;
    var __rectA =  {width: [cellWidth, wallWidth, cellWidth, wallWidth],
        height:[wallWidth, cellHeight, wallWidth, cellHeight],
        relPos:[[0,0],[cellWidth,0],[0,cellHeight],[0,0]]};
    var mapArray = []; // Create empty array to avoid error
    for(var y=0;y<maze.length;y++) {
        mapArray[y] = []; // Create empty array to avoid error
        for(var x=0;x<maze[y].length;x++) {
            for(var i=0;i<4;i++) {
                if(maze[y][x][i] === 0) {
                    //Create each wall
                    mapArray[y][x] = new Rectangle(__rectA.width[i],__rectA.height[i]);
                    mapArray[y][x].setColor(wallColor);
                    mapArray[y][x].setPosition((easyFrac(x,maze[y].length,getWidth())+__rectA.relPos[i][0]-(wallWidth/2)*(i&1)),
                        (easyFrac(y, maze.length,getHeight())+__rectA.relPos[i][1])-(wallWidth/2)*((i+1)&1));
                    mapArray[y][x].center = {x: mapArray[y][x].getX()-(mapArray[y][x].getWidth()/2),
                        y: mapArray[y][x].getY()-(mapArray[y][x].getHeight()/2)};
                    mapArray[y][x].cornerAngleArr = getRectAngleArr(mapArray[y][x].getWidth(), mapArray[y][x].getHeight());
                    console.log(`MAPCORNERARRAY: ${mapArray[y][x].cornerAngleArr}`);
                    if(addWalls) add(mapArray[y][x]);
                }
            }
        }
    }
    return mapArray;
}

function easyFrac(numerator, denominator, value) {
    return (numerator / denominator) * value;
}

function getAngleBtwnPoints(x1, y1, x2, y2, rad=true) {
    var __angle = (Math.atan2(y1 - y2, x1 - x2) * 180 / Math.PI) + 180;
    if(__angle < 0) angle += 360;
    return __angle;
}

function getDistanceBtwnPoints(x1, y1, x2, y2) {
    return Math.hypot(x2-x1, y2-y1);
}

function cellToPos(row, col) {
    var x = col*CELL_WIDTH +(CELL_WIDTH/2);
    var y = row*CELL_HEIGHT+(CELL_HEIGHT/2);
    return {x, y};
}

function calcCirclePoint(xPos, yPos, radius, angle, deg=true) {
    if(deg) var __rads = degToRad(angle);
    else var __rads = angle;
    var __x = xPos + radius * Math.cos(__rads)
    var __y = yPos + radius * Math.sin(__rads)
    var __xy = {x: __x,y: __y};
    return __xy;
}

function degToRad(__deg) {
    return __deg * (Math.PI/180);
}

function radToDeg(radians) {
  var pi = Math.PI;
  return radians * (180/pi);
}

function inputToDeg(input, __obj) {
    switch(input) {
        case parseInt('0000',2): __obj.newDirection = -1;   break; // NONE
        case parseInt('1000',2): __obj.newDirection = 180; break; // LEFT
        case parseInt('0100',2): __obj.newDirection = 0;   break; // RIGHT
        case parseInt('0010',2): __obj.newDirection = 270; break; // UP
        case parseInt('0001',2): __obj.newDirection = 90;  break; // DOWN
        case parseInt('1010',2): __obj.newDirection = 225; break; // LEFT UP
        case parseInt('1001',2): __obj.newDirection = 135; break; // LEFT DOWN
        case parseInt('0110',2): __obj.newDirection = 315; break; // RIGHT UP
        case parseInt('0101',2): __obj.newDirection = 45;  break; // RIGHT DOWN
    }
}

// Calculate which way to go around a circle from angle1 to angle2 the fastest
// Return 1 or -1 to multiply with your move speed var
function circumDir(angle1, angle2) {
    //calculate sign
    var sign = (angle1 - angle2 >= 0 && angle1 - angle2 <= 180) || (angle1 - angle2 <=-180 && angle1 - angle2 >= -360) ? -1 : 1;
    return sign;
}

function oppositeAngle(angle, deg=true) {
    if(deg) return (angle + 180) % 360;
    else return (angle + Math.PI) % (2 * Math.PI);
}

function getRectAngleArr(width, height) {
    var diagLength= Math.sqrt(Math.pow(width,2) + Math.pow(height,2)); // Calculate the length of the tank rectangle's diagonal
    var diagAngle = new Array();
    // instead of += 360 like I have below, I should be able to do % 360 on all the diagAngle definitions,
    // but that doesn't work for some reason
    diagAngle[0] = (Math.asin(height/diagLength)); // get's NE corner angle
    diagAngle[1] = (-Math.asin(height/diagLength)) ; // get's SE coner angle // ############## MAKE THIS ACTUALLY GET THE RIGHT ANGLE
    diagAngle[2] = (oppositeAngle(diagAngle[0]))           ; // get's SW coner angle
    diagAngle[3] = (oppositeAngle(diagAngle[1]))           ; // get's NW coner angle
    diagAngle.forEach(function (angle, index) {
        if(angle < 0) {
            diagAngle[index] += 360
        }
        });
    return diagAngle;
}

function getCirclePoints(centerX, centerY, radius, iterations, rows, storeAngle=false, __obj=false) {
    var __return = new Array();
    var diagAngle = new Array();
    for(var o=0;o<rows;o++) {
        for(var i=0;i<iterations;i++) {
            let offset = easyFrac(i, iterations, 45);
            diagAngle.push(offset+180); // LEFT
            diagAngle.push(offset+0);   // RIGHT
            diagAngle.push(offset+270); // UP
            diagAngle.push(offset+90);  // DOWN
            diagAngle.push(offset+225); // LEFT UP
            diagAngle.push(offset+135); // LEFT DOWN
            diagAngle.push(offset+315); // RIGHT UP
            diagAngle.push(offset+45);  // RIGHT DOWN
        }
    }
    diagAngle.forEach(function (angle, index) {
        __return[index] = calcCirclePoint(centerX, centerY, (radius+COLLIDE_BUFFER)-easyFrac(Math.floor(index/(iterations*8)),rows,radius), angle);
    });
    if(__obj !== false && storeAngle) {
        __obj.collideAngleArr = diagAngle;
        if(DEBUG[2]) console.log(__obj.collideAngleArr);
    }
    return __return;
}

/* Aquired from https://github.com/dstromberg2/maze-generator
 * Lisenced under CC BY-SA 3.0. https://creativecommons.org/licenses/by-sa/3.0/deed.en_US
 * https://dstromberg.com/2013/07/tutorial-random-maze-generation-algorithm-in-javascript/
 */
function newMaze(x, y) {

    // Establish variables and starting grid
    var totalCells = x*y;
    var cells = new Array();
    var unvis = new Array();
    for (var i = 0; i < y; i++) {
        cells[i] = new Array();
        unvis[i] = new Array();
        for (var j = 0; j < x; j++) {
            cells[i][j] = [0,0,0,0];
            unvis[i][j] = true;
        }
    }

    // Set a random position to start from
    var currentCell = [Math.floor(Math.random()*y), Math.floor(Math.random()*x)];
    var path = [currentCell];
    unvis[currentCell[0]][currentCell[1]] = false;
    var visited = 1;

    // Loop through all available cell positions
    while (visited < totalCells) {
        // Determine neighboring cells
        var pot = [[currentCell[0]-1, currentCell[1], 0, 2],
                [currentCell[0], currentCell[1]+1, 1, 3],
                [currentCell[0]+1, currentCell[1], 2, 0],
                [currentCell[0], currentCell[1]-1, 3, 1]];
        var neighbors = new Array();

        // Determine if each neighboring cell is in game grid, and whether it has already been checked
        for (var l = 0; l < 4; l++) {
            if (pot[l][0] > -1 && pot[l][0] < y && pot[l][1] > -1 && pot[l][1] < x && unvis[pot[l][0]][pot[l][1]]) {neighbors.push(pot[l]); }
        }

        // If at least one active neighboring cell has been found
        if (neighbors.length) {
            // Choose one of the neighbors at random
            var next = neighbors[Math.floor(Math.random()*neighbors.length)];

            // Remove the wall between the current cell and the chosen neighboring cell
            cells[currentCell[0]][currentCell[1]][next[2]] = 1;
            cells[next[0]][next[1]][next[3]] = 1;

            // Mark the neighbor as visited, and set it as the current cell
            unvis[next[0]][next[1]] = false;
            visited++;
            currentCell = [next[0], next[1]];
            path.push(currentCell);
        }
        // Otherwise go back up a step and keep going
        else {
            currentCell = path.pop();
        }
    }
    /* Returns 3D array [y][x][top, right, bottom, left]
     * top, right, bottom, left refer to borders to be added on each cell
     * 0 means border, 1 means no border
     */
    return cells;
}
