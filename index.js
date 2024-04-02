

let userInput = document.getElementById("input");
let textOutput = document.getElementById("output");
let locationOutput = document.getElementById("location");
let basketOutput = document.getElementById('basket');
let sound = document.getElementById('ambiance');
let soundSource = document.getElementById('audioSource')
let photo = document.getElementById('environment');
let playButton = document.getElementById('play');
let muteButton = document.getElementById('muteBtn');
let itemBox = document.getElementById('inventoryBox');
let knifeStatus = 'On the floor is a knife.';
let catStatus = "They look perturbed that you've interrupted them.";
let errorGate = true;
let isPlaying = true;
let trueItem ='';
let targetItem ='';
let hints =''

let playerInventory = {
  //fun fact: the original Zork had a water bottle you could drink from that would refresh the narrator. Thats why I included it as the default inventory item.
    items: {}
}
//tidy this up later
let currentItems = [];
//document.getElementById('firstItem').textContent = `Water | Description:`+ playerInventory.items.Water;

let photoDatabase = {
  front: 'https://i.imgur.com/hHGRykT.png',
  back: 'https://i.imgur.com/MGBgcux.png',
  hole: 'https://i.imgur.com/0eRhzEs.png',
  deepHole: 'https://i.imgur.com/RwnZNNQ.png',
  playerDeath: 'blob:https://imgur.com/e8579030-8b72-4769-83d4-1381945cdcfb',
}

let soundDatabase = {
  front: 'audio/crickets.mp3',
  back: 'audio/backyard.mp3',
  hole: 'audio/empty.mp3',
  deepHole: 'audio/abandonded.mp3',
  playerDeath: 'audio.bonecrunch.mp3',
}

let lore = {

  welcomeMessage: `182 Main St.
  You are standing on Main Street between Church and South Winooski.
  There is a door here. Its boarded shut.
  On the door is a handwritten sign.`,

  readSign: `The sign is old and battered. It knocks against the door in the wind. It reads: 
  "Condemned, do not enter"
  You notice a black cat run behind the building`,

  takeSign: `You attempt to pull it off. Despite how much it flaps around in the wind,
  the sign holds fast. Bystanders look concerned.`,

  backChurch: `The back of the church is a lot occupied by a few stray cats. ${catStatus} Broken glass crunches underfoot. 
  You realize someone has smashed the window open, leaving behind a dark opening. Maybe you could squeeze in...`,

  insideHole: `Something is wrong. You can't tell if its the stale air, the ruptured pews, or the deafening silence thats taken the place of bustling traffic. 
  ${knifeStatus} You stand on the stage next to a forsaken statue of jesus. What sermon will you give the strays?
  In the darkness you see a hole in the floor.`,

  deepHole: `You approach the hole and peer over the edge. You look into the dark. The dark looks back. What will you do?`,
}

let church = {
   
    front: {
      validEntry: ['front', 'street', 'infront',],
      roomInventory: {
        water: {
          validUse: ['throw', 'drop','place','set','letgo'],
          description: 'Water. looks refreshing',
        },
        sign: 'An old sign',
      }
    },

      back:  {
        validEntry: ['around', 'back','behind','cat','out','outside'],
        roomInventory: {
          cat: {
            validUse: ['throw', 'drop','place','set','letgo'],
            description: ' It looks displeased',
          }
        }
    },

      hole: {
        validEntry: ['window', 'through', 'into','inside','in'],
        roomInventory: {
          knife:{
            validUse: ['throw', 'drop','place','set','letgo'],
            description: ' A rusty knife',
          }
        }
    },

      deepHole: {
        validEntry: ['hole', 'through', 'into','inside','in','down','deeper'],
        roomInventory: {
        }
      }

}
let validVerbs = ['move', 'walk', 'go', 'run', 'crawl','climb', 'squeeze','follow','chase','toward','move','approach','aproach','look', 'inspect'];
let validPickup = ['grab', 'pickup', 'aquire','snatch','yoink','use','take'];
let validDrop = ['throw', 'drop','place','set','letgo']
let validCat = ['throw', 'drop','place','set','letgo', 'feed', 'sacrifice','give','set'];
let validFight = ['fight','attack','stab','defend','use','knife','slash','slice'];

let area = {
  front: ['back'],
  back: ['front', 'hole'],
  hole: ['back','deepHole'],
  deepHole: ['hole']
}

let currentArea = 'front'
function movePlayer(newArea) {
  let validTransition = area[currentArea];
  if(validTransition.includes(newArea)) {
    currentArea = newArea;
    photo.src = photoDatabase[currentArea];
    soundSource.src = soundDatabase[currentArea];
    sound.load();
    muteCheck();
    locationOutput.textContent = newArea;
} else {
    throw(`Invalid State: ${currentArea} to ${newArea}`)
}
}

function addInventory(item){
  //conditional to prevent duplicates. 
  if(currentItems.includes(item)){
    feedback('You already have that item.');
    return
  }
  let divItem = document.createElement('div');
    divItem.classList.add('item');
    divItem.setAttribute('id',`${item}`);
  let capitalItem = capitalize(item);
    divItem.textContent = `${capitalItem} | Description:`+ playerInventory.items[item].description;
    itemBox.appendChild(divItem);
    currentItems.push(item);
    feedback(`You've aquired: ${item}`);
}

function dropItem(object){
  church[currentArea].roomInventory[object] = playerInventory.items[object];
  delete playerInventory.items[object];
  itemForDelete = document.getElementById(`${object}`);
  itemForDelete.remove();
  let spliceIndex = currentItems.indexOf(object);
  currentItems.splice(spliceIndex,1);
  console.log(currentItems);

  feedback(`You drop the ${object} `);
  console.log(church[currentArea].roomInventory);
}

function drop() {
  if(answer.some(dropCheck)){
    if(answer.some(currentItemCheck)){
      console.log('true item aquired');
      dropItem(trueItem);
      return
    }
    feedback("You don't have that item to drop");
    return
  }
}

function roomInventory(object, room){
//creates the key value pair in player inventory
playerInventory.items[object] = church[room].roomInventory[object];
//displays inventory to player
addInventory(`${object}`);
//removes item from room inventory
delete church[room].roomInventory[object];
//this makes the text referring to the knife disapear when you revisit the room.
}
function toggleAudio(){
  if(isPlaying === true){
   sound.pause();
   return
  }
  sound.play();
 }
 sound.onplaying = function() {
   isPlaying = true;
 };
 sound.onpause = function() {
   isPlaying = false;
 };

// displays quesiton in textOutput element. Accepts questionText parameter
function ask(questionText) {
  let i = 0;
  let txt = questionText; /* The text */
  let speed = 10; /* The speed/duration of the effect in milliseconds */

function typeWriter() {
  if (i < txt.length) {
    textOutput.textContent += txt.charAt(i);
    i++;
    setTimeout(typeWriter, speed);
  }
}
typeWriter();
}

function verbCheck(verb){
    return validVerbs.includes(verb);
}
function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
function pickupCheck(verb){
  return validPickup.includes(verb);
}
function dropCheck(verb){
  return validDrop.includes(verb);
}
function catCheck(cat){
  return validCat.includes(cat);
}
function fightCheck(fight){
  return validFight.includes(fight);
}
function roomItems(item){
  //Looks at answer array, stores matching value in targetItem variable
  console.log(currentArea);
    if(Object.keys(church[currentArea].roomInventory).includes(item)){
      targetItem = item;
      return true;
    }
}
function currentItemCheck(item){
  if(currentItems.includes(item)){
    trueItem = item;
    return true
  }
}

function validEntryCheck(noun){
 let availableMoves = area[currentArea];
 //logic: if x location is available, and you answer includes entry phrases for x, return a truthy value.
 if(availableMoves.includes('back') && church.back.validEntry.includes(noun)){
        movePlayer('back');
        ask(lore.backChurch);
        errorGate = false;
        answer='';
        return
 }
 if(availableMoves.includes('front') && church.front.validEntry.includes(noun)){
        movePlayer('front');
        ask(lore.welcomeMessage);
        errorGate = false;
        answer='';
        return
 }  
 if(availableMoves.includes('hole') && church.hole.validEntry.includes(noun)){
        movePlayer('hole');
        ask(lore.insideHole);
        errorGate = false;
        answer = '';
        return
 }
 if(availableMoves.includes('deepHole') && church.deepHole.validEntry.includes(noun)){
        movePlayer('deepHole');
        ask(lore.deepHole);
        errorGate = false;
        answer = '';
        return
 }
}

function playAudio() {
  sound.loop = true;
  sound.volume = .1;
  sound.play();
}

function muteCheck(){
  if(isPlaying === true){
    sound.play();
    console.log('sound is playing');
  }
}
function printError(){
    basketOutput.textContent = `You need a valid verb!`
    setTimeout(() => {
    basketOutput.textContent = ``
    }, 3000);
}

function playGame(){
  let text = document.getElementById("popup");
  text.classList.toggle("show");
  playButton.addEventListener('click', function (){
    text.classList.toggle("show");
    ask(lore.welcomeMessage);
    playAudio();
    roomInventory('water', 'front');
    });
}

function feedback(words){
  basketOutput.textContent = words
      setTimeout(() => {
      basketOutput.textContent = ``
      }, 5000);

}

function checkRoomItems() {
  if(answer.some(pickupCheck) && answer.some(roomItems)){
    console.log('passed check');
    //dynamically changes the text based on what you've picked up.
   // catStatus = 'The cats seem to have scattered.'
    roomInventory(`${targetItem}`, currentArea);
    answer='';
    return;
}
}

function playerAction(){
  if(answer.some(verbCheck)){
    answer.some(validEntryCheck);
    if(errorGate){
      let validTransition = area[currentArea];
      hints = '';
      for (let i = 0; i < validTransition.length; i++){
        let newRoom = validTransition[i];
        hints = hints + " ..." + church[newRoom].validEntry[0];
      }
      // gives first item of valid nouns array for valid destinations
      feedback(`You need a valid noun, something like: ${hints}`);
    }
    errorGate = true;
  }
  if(answer.some(dropCheck) !== true){
    feedback('You need a valid verb');
    }
  
}

function validFlee(noun){
  let availableMoves = area[currentArea];
  if(availableMoves.includes('hole') && church.hole.validEntry.includes(noun)){
   return true
}
}
//
function finalMessage(endMessage) {
  let text = document.getElementById("popup");
  text.textContent = endMessage;
}

function youWin(endMessage){
  errorGate = false;
  photo.src = photoDatabase.playerDeath;
  soundSource.src = soundDatabase.playerDeath;
  sound.load();
  muteCheck();
  finalMessage(endMessage);
  let againBtn= document.createElement('button');
  againBtn.classList.add('playAgain');
  againBtn.textContent = 'Play Again?';
  againBtn.setAttribute('id','again');
  let text = document.getElementById("popup");
  text.appendChild(againBtn);
  text.classList.toggle("show");
  let play = document.getElementById('again');
  play.addEventListener('click', e => {
  e.preventDefault();
  window.location.reload();
  })
}

function gameOver() {
  if(answer.some(catCheck) && answer.includes('cat') && currentItems.includes('cat')){
    dropItem('cat');
    youWin('The Beast was hungry. You fed it, but at what cost? You leave with your life.');
  }
  if(answer.some(fightCheck) && currentItems.includes('knife')){
    youWin('You stab at its waxy skin and brittle bones. It fights with suprising strength. You wound it, and leave this place alive');
  }
  if(answer.some(fightCheck) && currentItems.includes('knife') !==true){
    youDied(true,false);
  }
  if(answer.some(verbCheck)){
    if(answer.some(validFlee)|| answer.includes('run') || answer.includes('away')){
      console.log('you died');
      youDied(false,true);
      answer=''
      return
    }
    if(errorGate){
      feedback('You need a valid noun, try "back" or "around"');
    }
    errorGate = true;
  }
  if(answer.some(dropCheck) !== true){
  feedback('You need a valid verb');
  }
}

function deathScreen(){
  
  let againBtn= document.createElement('button');
  againBtn.classList.add('playAgain');
  againBtn.textContent = 'Play Again?';
  againBtn.setAttribute('id','again');
  let text = document.getElementById("popup");
  text.textContent = 'The Beast was hungry. You died';
  text.appendChild(againBtn);
  text.classList.toggle("show");
  let play = document.getElementById('again');
  play.addEventListener('click', e => {
  e.preventDefault();
  window.location.reload();
  })
}

function deathScreen2(){
 
  let againBtn= document.createElement('button');
  againBtn.classList.add('playAgain');
  againBtn.textContent = 'Play Again?';
  againBtn.setAttribute('id','again');
  let text = document.getElementById("popup");
  text.textContent = 'Its stronger than you imagined. You scratch and writhe, but without a weapon you have no hope. The last thing you think about is cats.';
  text.appendChild(againBtn);
  text.classList.toggle("show");
  let play = document.getElementById('again');
  play.addEventListener('click', e => {
  e.preventDefault();
  window.location.reload();
  })
}

function youDied(knife, cat) {
  errorGate = false;
  photo.src = photoDatabase.playerDeath;
  soundSource.src = soundDatabase.playerDeath;
  sound.load();
  muteCheck();
  if(knife){
    setTimeout(deathScreen2,5000);
  }
  if(cat){
    setTimeout(deathScreen,5000);
  }
  
}

function start() {
  console.log("function initialized")
  //sterilizes input, splits into an array of strings, and assigns to variable
  answer = userInput.value.toLowerCase().split(" ");
//The some method really saved me here. Checks array against array for inclusion, returns bolean value
  if(answer.includes('drink'|| answer.includes('use'))){
    feedback('You drink the water. Its actually just diet coke you put in a Dasani bottle. Mmm crispy');
    return
  }
  
if(currentArea === 'front'){
  drop();
    if(answer.includes('read') && answer.includes('sign')){
      ask(lore.readSign);
      return
    }
    if(answer.includes('take') && answer.includes('sign')){
      ask(lore.takeSign);
      return
    }
  checkRoomItems();
  playerAction();
}
if(currentArea === 'back'){
    drop();
    checkRoomItems();
    playerAction();
}
if (currentArea === 'hole'){
    drop();
    checkRoomItems();
    playerAction();
 }
 if (currentArea === 'deepHole'){
    drop();    
    checkRoomItems();
    gameOver();
 }
}
muteButton.addEventListener('click', e => {
  e.preventDefault();
  toggleAudio();
})
// activates function on click
btn.addEventListener('click', e => {
  e.preventDefault();
  console.log('button clicked');
  start();
})

playGame();
// church https://i.imgur.com/hHGRykT.png
// window https://i.imgur.com/MGBgcux.png
// inside https://i.imgur.com/0eRhzEs.png
//