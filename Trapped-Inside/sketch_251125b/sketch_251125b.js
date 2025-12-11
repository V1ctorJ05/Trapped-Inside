// ===================================================== 
// FULLSCREEN TOP-DOWN SCHOOL MAP WITH RAIN
// =====================================================

// MOVEMENT SETTINGS
let player = { x: 0, y: 0, size: 20, speed: 3 };
let keys = {};
let currentRoom = "red";

// NEW: STAMINA SYSTEM
let stamina = 100;
let maxStamina = 100;
let sprinting = false;

// ==============================
// ROOM DEFINITIONS
// ==============================
const rooms = {
  red: { w: 900, h: 700, color: "#c0392b", type: "hub", doors: [] },
  blueA: { w: 600, h: 450, color: "#3498db", type: "courtyard", doors: [] },
  blueB: { w: 600, h: 450, color: "#2980b9", type: "courtyard", doors: [] },
  orange: { w: 600, h: 450, color: "#e67e22", type: "courtyard", doors: [] },
  yellow: { w: 600, h: 450, color: "#f1c40f", type: "courtyard", doors: [] },
  purple: { w: 900, h: 650, color: "#8e44ad", type: "hub", doors: [] },
  blueC: { w: 600, h: 450, color: "#5dade2", type: "courtyard", doors: [] },
  blueD: { w: 600, h: 450, color: "#2471a3", type: "courtyard", doors: [] },
  pink: { w: 500, h: 400, color: "#ff69b4", type: "courtyard", doors: [] },
  brown: { w: 350, h: 250, color: "#a0522d", type: "courtyard", doors: [] },
  green: { w: 700, h: 450, color: "#27ae60", type: "hub", doors: [] }
};

// DOOR SETUP
rooms.red.doors = [
  { x: 0, y: 350, to: "blueA", side: "left" },
  { x: 900, y: 350, to: "blueB", side: "right" },
  { x: 0, y: 680, to: "orange", side: "left" },
  { x: 450, y: 0, to: "purple", side: "top", stair: true }
];
rooms.blueA.doors = [{ x: 600, y: 225, to: "red", side: "right" }];
rooms.blueB.doors = [{ x: 0, y: 225, to: "red", side: "left" }];
rooms.orange.doors = [
  { x: 600, y: 430, to: "red", side: "right" },
  { x: 0, y: 430, to: "yellow", side: "left" }
];
rooms.yellow.doors = [{ x: 600, y: 430, to: "orange", side: "right" }];
rooms.purple.doors = [
  { x: 0, y: 150, to: "blueC", side: "left" },
  { x: 900, y: 325, to: "blueD", side: "right" },
  { x: 0, y: 600, to: "pink", side: "left" },
  { x: 450, y: 0, to: "green", side: "top" },
  { x: 450, y: 650, to: "red", side: "bottom", stair: true }
];
rooms.blueC.doors = [{ x: 600, y: 225, to: "purple", side: "right" }];
rooms.blueD.doors = [{ x: 0, y: 225, to: "purple", side: "left" }];
rooms.pink.doors = [
  { x: 500, y: 380, to: "purple", side: "right" },
  { x: 0, y: 20, to: "brown", side: "left" }
];
rooms.brown.doors = [{ x: 350, y: 20, to: "pink", side: "right" }];
rooms.green.doors = [{ x: 350, y: 450, to: "purple", side: "bottom" }];

// ==========================
// ⭐ NEW: BLUE B — RED SQUARE OBJECTS
// ==========================
let blueB_RedSquares = [
  { x: 545, y: 10, w: 15, h: 15, interacted: false }
];

// RAIN SYSTEM
let rainDrops = [];
function initRain() {
  for (let i = 0; i < 250; i++) {
    rainDrops.push({ x: random(width), y: random(-height, height), speed: random(4, 7) });
  }
}
function drawRain(rx, ry, roomW, roomH) {
  for (let drop of rainDrops) {
    drop.y += drop.speed;
    if (drop.y > height) drop.y = random(-200, -50), drop.x = random(width);
    if (drop.x > rx && drop.x < rx + roomW && drop.y > ry && drop.y < ry + roomH) continue;
    stroke(200); line(drop.x, drop.y, drop.x, drop.y + 10);
  }
}

// COURTYARD DECORATION
function drawCourtyard(roomW, roomH, type) {
  if (type === "hub") return;
  let left = width / 2 - roomW / 2;
  let top = height / 2 - roomH / 2;

  noStroke(); fill(50,50,50,40); rect(0,0,width,height);
  fill(30); rect(left, top, roomW, roomH);

  stroke(80); 
  for(let i=0;i<8;i++){
    let x1=random(width),y1=random(height);
    let x2=x1+random(-40,40),y2=y1+random(-40,40);
    if(x1>left&&x1<left+roomW&&y1>top&&y1<top+roomH) continue;
    line(x1,y1,x2,y2);
  }
  noStroke(); fill(120,80,20,180); 
  for(let i=0;i<20;i++){
    let lx=random(width),ly=random(height);
    if(lx>left&&lx<left+roomW&&ly>top&&ly<top+roomH) continue;
    ellipse(lx,ly,10,5);
  }
}

// STATIC FLOOR TEXTURES
let floorTextures = {};
function generateWoodTexture(room, colorHex){
  let pg = createGraphics(room.w, room.h);
  let plankHeight = 20;

  for(let i=0;i<room.h;i+=plankHeight){
    let base = color(colorHex);
    let shade = lerpColor(base, color(30,20,15), random(0,0.5));
    pg.fill(shade); pg.noStroke(); pg.rect(0,i,room.w,plankHeight);

    pg.stroke(30,10,10);
    for(let j=0;j<room.w/50;j++){
      let cx=random(room.w);
      pg.line(cx,i,cx+random(-5,5),i+plankHeight);
    }

    pg.stroke(60,30,20,100);
    for(let s=0;s<3;s++){
      let sx=random(room.w);
      let sy=i+random(plankHeight);
      pg.line(sx,sy,sx+random(-10,10),sy+random(-2,2));
    }
  }

  pg.noFill(); pg.stroke(20,15,10,120); pg.strokeWeight(5);
  for(let e=0;e<100;e++){
    let ex=random(room.w); let ey=random(room.h);
    if(ex<50||ex>room.w-50||ey<50||ey>room.h-50) pg.point(ex,ey);
  }
  return pg;
}

function generateTileTexture(room, baseColor="#787878", addDetails=false){
  let pg = createGraphics(room.w, room.h);
  let tileSize = 40;

  for(let y=0;y<room.h;y+=tileSize){
    for(let x=0;x<room.w;x+=tileSize){
      let base = color(baseColor);
      let shade = lerpColor(base, color(80,80,80), random(0,0.5));
      pg.fill(shade); pg.stroke(60); pg.strokeWeight(1);
      pg.rect(x,y,tileSize,tileSize);

      pg.stroke(30,30,30,100);
      for(let c=0;c<2;c++){
        let cx = x + random(tileSize);
        let cy = y + random(tileSize);
        pg.line(cx,cy,cx+random(-5,5),cy+random(-5,5));
      }

      if(addDetails && random()<0.05){
        pg.stroke(50,50,50,120); pg.strokeWeight(2);
        pg.line(x+random(tileSize),y+random(tileSize),x+random(tileSize),y+random(tileSize));
      }
    }
  }

  pg.noFill(); pg.stroke(20,15,10,120); pg.strokeWeight(3);
  for(let e=0;e<50;e++){
    let ex=random(room.w); let ey=random(room.h);
    if(ex<20||ex>room.w-20||ey<20||ey>room.h-20) pg.point(ex,ey);
  }

  return pg;
}

// BLUE C — LIBRARY DETAILS
function drawLibraryDetails(room) {
  if(currentRoom !== "blueC") return;

  noStroke(); fill(80,50,30);
  for(let i=0; i<room.h; i+=120){
    rect(0, i, 20, 80);
    rect(room.w-20, i, 20, 80);
  }
  for(let i=50; i<room.w-50; i+=120){
    rect(i, 0, 60, 20);
    rect(i, room.h-20, 60, 20);
  }

  drawTableGrid(room, "#807050");
}

// PINK ROOM TABLES
function drawPinkTables(room){
  if(currentRoom !== "pink") return;

  const tableW = 80, tableH = 40;
  const startX = 100, startY = 100;
  const spacingX = 150, spacingY = 120;
  const rows = 2, cols = 3;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tx = startX + c * spacingX;
      let ty = startY + r * spacingY;

      fill("#899499");
      rect(tx, ty, tableW, tableH);

      fill(120);
      rect(tx+5,  ty+10, 15, 20);
      rect(tx+30, ty+10, 15, 20);
    }
  }
}

// BLUE C TABLE GRID
function drawTableGrid(room, tableColor){
  const tableW = 80, tableH = 40;
  const startX = 100, startY = 100;
  const spacingX = 150, spacingY = 120;
  const rows = 2, cols = 3;

  const bookColors = [
    [255,0,0],[0,255,0],[0,0,255],
    [255,255,0],[255,0,255],[0,255,255]
  ];

  let colorIndex = 0;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tx = startX + c * spacingX;
      let ty = startY + r * spacingY;

      fill(tableColor);
      rect(tx, ty, tableW, tableH);

      fill(...bookColors[colorIndex]);
      rect(tx+5, ty+10, 15, 20);
      rect(tx+30, ty+10, 15, 20);

      colorIndex = (colorIndex + 1) % bookColors.length;
    }
  }
}

// ⭐ NEW: BLUE B TABLES (COPY OF BLUE C)
function drawBlueBTables(room){
  if(currentRoom !== "blueB") return;

  const tableW = 80, tableH = 40;
  const startX = 100, startY = 100;
  const spacingX = 150, spacingY = 120;
  const rows = 2, cols = 3;

  fill("#a09080");
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tx = startX + c * spacingX;
      let ty = startY + r * spacingY;
      rect(tx, ty, tableW, tableH);
    }
  }
}

// ⭐ NEW: BLUE B — RED SQUARE DRAWING
function drawBlueBRedSquares(room){
  if(currentRoom !== "blueB") return;

  for(let sq of blueB_RedSquares){
    fill("#ff0000");
    rect(sq.x, sq.y, sq.w, sq.h);

    let px = player.x;
    let py = player.y;

    if(px + player.size > sq.x && px < sq.x + sq.w &&
       py + player.size > sq.y && py < sq.y + sq.h){
      fill(255,255,0);
      textSize(16);
      textAlign(CENTER,CENTER);
      text("Press E to interact", sq.x + sq.w/2, sq.y - 20);
    }
  }
}

// ORANGE ROOM — COURT + BENCHES
let orangeBenches = [
  { x: 0, y: 0, w: 300, h: 20 },
  { x: 0, y: 0, w: 300, h: 20 },
];

function drawOrangeCourt() {
  if (currentRoom !== "orange") return;

  const cw = 300;
  const ch = 160;
  const cx = (rooms.orange.w / 2) - cw / 2;
  const cy = (rooms.orange.h / 2) - ch / 2;

  fill("#d29b53");
  rect(cx, cy, cw, ch);

  stroke(255);
  strokeWeight(4);
  noFill();
  rect(cx, cy, cw, ch);

  ellipse(cx + cw / 2, cy + ch / 2, 60, 60);

  noStroke();

  orangeBenches[0].x = cx;
  orangeBenches[0].y = cy - 40;
  orangeBenches[1].x = cx;
  orangeBenches[1].y = cy + ch + 20;

  fill("#555");
  for (let b of orangeBenches) rect(b.x, b.y, b.w, b.h);
}

// COLLISION WITH ORANGE BENCHES
function collideWithBench(px, py) {
  for (let b of orangeBenches) {
    if (px < b.x + b.w &&
        px + player.size > b.x &&
        py < b.y + b.h &&
        py + player.size > b.y) return true;
  }
  return false;
}

// GREEN RAILING
let greenRailing = [];

function initGreenRailing() {
  const w = rooms.green.w;
  const h = rooms.green.h;
  const thickness = 10;

  greenRailing.push({x:0, y:0, w:w, h:thickness});
  greenRailing.push({x:0, y:h-thickness, w:w, h:thickness});
  greenRailing.push({x:0, y:0, w:thickness, h:h});
  greenRailing.push({x:w-thickness, y:0, w:thickness, h:h});
}

function drawGreenRailing() {
  if(currentRoom !== "green") return;
  fill("#888");

  for(let r of greenRailing) rect(r.x, r.y, r.w, r.h);
}

function collideWithGreenRailing(px, py){
  for(let r of greenRailing){
    if(px < r.x + r.w &&
       px + player.size > r.x &&
       py < r.y + r.h &&
       py + player.size > r.y) return true;
  }
  return false;
}

// GREEN BED
let greenBed = {
  x: rooms.green.w/2 - 50,
  y: 50,
  w: 100,
  h: 50,
  interacted: false
};

function drawGreenBed() {
  if(currentRoom !== "green") return;

  fill("#2ecc71");
  rect(greenBed.x, greenBed.y, greenBed.w, greenBed.h);

  fill("#ffffff");
  let pillowW = greenBed.w * 0.2;
  let pillowH = greenBed.h * 0.7;
  rect(greenBed.x + greenBed.w*0.05, greenBed.y + 5, pillowW, pillowH, 5);

  let px = player.x;
  let py = player.y;

  if(px + player.size > greenBed.x && px < greenBed.x + greenBed.w &&
     py + player.size > greenBed.y && py < greenBed.y + greenBed.h){
    fill(255,255,0);
    textSize(16);
    textAlign(CENTER,CENTER);
    text("Press E to interact", greenBed.x + greenBed.w/2, greenBed.y - 20);
  }
}

function collideWithGreenBed(px, py){
  return px < greenBed.x + greenBed.w &&
         px + player.size > greenBed.x &&
         py < greenBed.y + greenBed.h &&
         py + player.size > greenBed.y;
}


// TABLE COLLISION (pink + blueC + ⭐ new blueB)
function collideWithTables(px, py) {
  let tables = [];

  // PINK
  if(currentRoom === "pink") {
    const tableW = 80, tableH = 40;
    const startX = 100, startY = 100;
    const spacingX = 150, spacingY = 120;
    const rows = 2, cols = 3;

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        let tx = startX + c * spacingX;
        let ty = startY + r * spacingY;
        tables.push({x:tx, y:ty, w:tableW, h:tableH});
      }
    }
  }

  // BLUE B — NEW
  if(currentRoom === "blueB") {
    const tableW = 80, tableH = 40;
    const startX = 100, startY = 100;
    const spacingX = 150, spacingY = 120;
    const rows = 2, cols = 3;

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        let tx = startX + c * spacingX;
        let ty = startY + r * spacingY;
        tables.push({x:tx, y:ty, w:tableW, h:tableH});
      }
    }
  }

  // ⭐ NEW: BLUE B RED SQUARE COLLISION
  if(currentRoom === "blueB"){
    for(let sq of blueB_RedSquares){
      if(px < sq.x + sq.w &&
         px + player.size > sq.x &&
         py < sq.y + sq.h &&
         py + player.size > sq.y){
        return true;
      }
    }
  }

  // YELLOW ROOM — NEW
if(currentRoom === "yellow") {
  const tableW = 80, tableH = 40;
  const startX = 100, startY = 100;
  const spacingX = 150, spacingY = 120;
  const rows = 3, cols = 3;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tx = startX + c * spacingX;
      let ty = startY + r * spacingY;
      tables.push({x:tx, y:ty, w:tableW, h:tableH});
    }
  }
}

  // BLUE A — NEW
if(currentRoom === "blueA") {
  const tableW = 80, tableH = 40;
  const startX = 100, startY = 100;
  const spacingX = 150, spacingY = 120;
  const rows = 3, cols = 3;

  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tx = startX + c * spacingX;
      let ty = startY + r * spacingY;
      tables.push({x:tx, y:ty, w:tableW, h:tableH});
    }
  }
}

  // BLUE C — TABLES + BOOKSHELVES
  if(currentRoom === "blueC") {
    const tableW = 80, tableH = 40;
    const startX = 100, startY = 100;
    const spacingX = 150, spacingY = 120;
    const rows = 2, cols = 3;

    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        let tx = startX + c * spacingX;
        let ty = startY + r * spacingY;
        tables.push({x:tx, y:ty, w:tableW, h:tableH});
      }
    }

    for(let i=0; i<rooms.blueC.h; i+=120){
      tables.push({x:0, y:i, w:20, h:80});
      tables.push({x:rooms.blueC.w-20, y:i, w:20, h:80});
    }
    for(let i=50; i<rooms.blueC.w-50; i+=120){
      tables.push({x:i, y:0, w:60, h:20});
      tables.push({x:i, y:rooms.blueC.h-20, w:60, h:20});
    }
  }

  for(let t of tables){
    if(px < t.x + t.w &&
       px + player.size > t.x &&
       py < t.y + t.h &&
       py + player.size > t.y) return true;
  }
  return false;
}

// ==========================
// PLAYER MOVEMENT + SPRINT & STAMINA
// ==========================
function handleMovement(room){
  let nextX = player.x;
  let nextY = player.y;

  sprinting = keys['shift'] && stamina > 1;

  let moveSpeed = sprinting ? player.speed * 2 : player.speed;

  if(sprinting) stamina -= 1.2;
  else stamina += 0.6;

  stamina = constrain(stamina, 0, maxStamina);

  if(keys['w']) nextY -= moveSpeed;
  if(keys['s']) nextY += moveSpeed;
  if(keys['a']) nextX -= moveSpeed;
  if(keys['d']) nextX += moveSpeed;

  if(currentRoom === "orange" && collideWithBench(nextX - player.size/2, nextY - player.size/2)) {
  } else if(collideWithTables(nextX - player.size/2, nextY - player.size/2)) {
  } else if(currentRoom === "green" && (collideWithGreenRailing(nextX - player.size/2, nextY - player.size/2) ||
                                       collideWithGreenBed(nextX - player.size/2, nextY - player.size/2))) {
  } else {
    player.x = nextX;
    player.y = nextY;
  }

  player.x = constrain(player.x,20,room.w-20);
  player.y = constrain(player.y,20,room.h-20);
}

// DOOR INTERACTION
function useDoor(){
  let room = rooms[currentRoom];
  for(let d of room.doors){
    let dx = player.x - d.x;
    let dy = player.y - d.y;

    if(sqrt(dx*dx+dy*dy) < 30){
      let prevRoom = currentRoom;
      currentRoom = d.to;
      let nr = rooms[currentRoom];

      let backDoor = nr.doors.find(dd => dd.to === prevRoom);

      if(!backDoor){
        player.x = nr.w/2;
        player.y = nr.h/2;
        return;
      }

      if(backDoor.side === "left")  { player.x = backDoor.x + 15 + player.size/2; player.y = backDoor.y; }
      if(backDoor.side === "right") { player.x = backDoor.x - 15 - player.size/2; player.y = backDoor.y; }
      if(backDoor.side === "top")   { player.y = backDoor.y + 15 + player.size/2; player.x = backDoor.x; }
      if(backDoor.side === "bottom"){ player.y = backDoor.y - 15 - player.size/2; player.x = backDoor.x; }

      return;
    }
  }
}

function keyPressed(){ 
  keys[key.toLowerCase()] = true; 

  if(key === 'e' || key === 'E'){
    useDoor();

    if(currentRoom === "green"){
      let px = player.x;
      let py = player.y;

      if(px + player.size > greenBed.x && px < greenBed.x + greenBed.w &&
         py + player.size > greenBed.y && py < greenBed.y + greenBed.h){
        greenBed.interacted = true;
        window.open("https://v1ctorj05.github.io/Dream-Wake-Up/");
      }
    }

    // ⭐ NEW: BLUE B — RED SQUARE INTERACTION
    if(currentRoom === "blueB"){
      let px = player.x, py = player.y;
      for(let sq of blueB_RedSquares){
        if(px + player.size > sq.x && px < sq.x + sq.w &&
           py + player.size > sq.y && py < sq.y + sq.h){

          sq.interacted = true;
          window.open("https://v1ctorj05.github.io/Note1/");

        }
      }
    }
  }
}

function keyReleased(){ 
  keys[key.toLowerCase()] = false; 
}

// SETUP
function setup(){
  createCanvas(windowWidth, windowHeight);

  player.x = rooms.red.w/2;
  player.y = rooms.red.h/2;

  initRain();
  initGreenRailing();

  floorTextures.red = generateWoodTexture(rooms.red,'#61483e');
  floorTextures.purple = generateWoodTexture(rooms.purple,'#61483e');
  floorTextures.orange = generateWoodTexture(rooms.orange,'#dfb289');
  floorTextures.blueB = generateWoodTexture(rooms.blueB, '#877778');
  floorTextures.brown = generateWoodTexture(rooms.brown, '#473e3a');
  floorTextures.blueC = generateWoodTexture(rooms.blueC, '#4b3a2b');

  floorTextures.blueD = generateTileTexture(rooms.blueD);
  floorTextures.yellow = generateTileTexture(rooms.yellow,"#a7d8f7",true);
  floorTextures.pink = generateTileTexture(rooms.pink, "#ffffff", false);
  floorTextures.blueA = generateTileTexture(rooms.blueA, "#d8c9b5", true);
  floorTextures.green = generateTileTexture(rooms.green, "#555555", false);
}

function windowResized(){ resizeCanvas(windowWidth, windowHeight); }

// DRAW LOOP
function draw(){
  background(30);

  let room = rooms[currentRoom];
  let rx = width/2 - room.w/2;
  let ry = height/2 - room.h/2;

  drawCourtyard(room.w, room.h, room.type);
  drawRain(rx, ry, room.w, room.h);

  push(); 
  translate(rx, ry);

  if(floorTextures[currentRoom]) image(floorTextures[currentRoom],0,0);
  else fill(room.color), rect(0,0,room.w,room.h);

  drawLibraryDetails(room);
  drawPinkTables(room);
  drawBlueATables(room);   // ⭐ NEW — BLUE A TABLES
  drawBlueBTables(room);   // ⭐ NEW — BLUE B TABLES
  drawBlueBRedSquares(room); // ⭐ NEW — BLUE B RED SQUARES
  drawYellowTables(room);  // ⭐ NEW — YELLOW TABLES
  drawOrangeCourt();
  drawGreenRailing();
  drawGreenBed();


// ⭐ NEW: BLUE A TABLES (COPY OF BLUE B + THIRD ROW)
function drawBlueATables(room){
  if(currentRoom !== "blueA") return;

  const tableW = 80, tableH = 40;
  const startX = 100, startY = 100;
  const spacingX = 150, spacingY = 120;
  const rows = 3, cols = 3; // third row added

  fill("#708090");
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tx = startX + c * spacingX;
      let ty = startY + r * spacingY;
      rect(tx, ty, tableW, tableH);
    }
  }
}

// ⭐ NEW: YELLOW ROOM TABLES (3x3 layout)
function drawYellowTables(room){
  if(currentRoom !== "yellow") return;

  const tableW = 80, tableH = 40;
  const startX = 100, startY = 100;
  const spacingX = 150, spacingY = 120;
  const rows = 3, cols = 3;

  fill("#6082B6");
  for(let r=0;r<rows;r++){
    for(let c=0;c<cols;c++){
      let tx = startX + c * spacingX;
      let ty = startY + r * spacingY;
      rect(tx, ty, tableW, tableH);
    }
  }
}


  for(let d of room.doors){
    if(d.stair){
      fill("white"); rect(d.x-15, d.y-15, 30, 30);
      fill(0); textAlign(CENTER,CENTER); text("⇅", d.x, d.y);
    } else {
      fill(0); rect(d.x-10, d.y-10, 20, 20);
    }
  }

  fill("white");
  circle(player.x, player.y, player.size);

  pop();

  fill(0,180); rect(10,10,300,80);

  fill(255);
  textSize(14);
  textAlign(LEFT,TOP);
  text("Controls: WASD to move, Shift to sprint, E to use door", 20, 20);
  text("Current Room: " + currentRoom, 20, 40);

  let barW = map(stamina, 0, maxStamina, 0, 260);

  if(stamina > 60) fill(0,255,0);
  else if(stamina > 25) fill(255,255,0);
  else fill(255,0,0);

  rect(20, 65, barW, 15);

  noFill();
  stroke(255);
  rect(20, 65, 260, 15);
  noStroke();

  handleMovement(room);
}
