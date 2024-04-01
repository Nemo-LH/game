

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

function playAudio() {
  sound.loop = true;
  sound.volume = .1;
  sound.play();
}

function printError(){
    basketOutput.textContent = `You need a valid verb!`
    setTimeout(() => {
    basketOutput.textContent = ``
    }, 3000);
}

function pickupCheck(verb){
    return validPickup.includes(verb);
}

function playGame(){
  let text = document.getElementById("popup");
  text.classList.toggle("show");
  playButton.addEventListener('click', function (){
    text.classList.toggle("show");
    ask(lore.welcomeMessage);
    playAudio();
    });
}

function feedback(words){
  basketOutput.textContent = words
      setTimeout(() => {
      basketOutput.textContent = ``
      }, 3000);

}

function start() {
  console.log("function initialized")
  //sterilizes input, splits into an array of strings, and assigns to variable
  answer = userInput.value.toLowerCase().split(" ");
//The some method really saved me here. Checks array against array for inclusion, returns bolean value
 
 
if(currentArea === 'front'){

    if(answer.includes('read') && answer.includes('sign')){
      ask(lore.readSign);
      return
    }
    if(answer.includes('take') && answer.includes('sign')){
      ask(lore.takeSign);
      return
    }
    if(answer.some(verbCheck)){
    if(answer.includes('back') || answer.includes('around') || answer.includes('behind') || answer.includes('cat')){
        movePlayer('back');
        soundSource.src="audio/backyard.mp3";
        sound.load();
        //prevents audio from starting back up between scenes if you have it muted 
        if(isPlaying === true){
          sound.play();
        }
        ask(lore.backChurch);
        return
    }
  }
  feedback('You need a valid verb');
}

if(currentArea === 'back'){

  photo.src = 'https://i.imgur.com/MGBgcux.png'

  if(answer.some(verbCheck)){
    if(answer.includes('front')){
        movePlayer('front');
        soundSource.src="audio/crickets.mp3";
        sound.load();
        if(isPlaying === true){
          sound.play();
        }
        ask(lore.welcomeMessage);
        return
    }
    if(answer.includes('window') || answer.includes('through') || answer.includes('into') && answer.includes('climb') || answer.includes('inside') && answer.includes('crawl') || 
      answer.includes('into') && answer.includes('climb') || answer.includes('in')){
        movePlayer('hole');
        ask(lore.insideHole);
        answer = '';
    }
    return
  }
  feedback('You need a valid verb');
}

if (currentArea === 'hole'){
    if(answer.some(pickupCheck) && answer.includes('knife')){
      playerInventory.items.Knife = 'a rusty knife';
      addInventory('Knife');
      //this makes the text referring to the knife disapear when you revisit the room.
      knifeStatus = `There is a dusty outline where the knife used to be.`
     answer='';
     return;
    }
    if(answer.some(verbCheck)){
      if(answer.includes('window') || answer.includes('through') || answer.includes('into') && answer.includes('climb') || answer.includes('outside') && answer.includes('crawl') || 
      answer.includes('into') && answer.includes('climb') || answer.includes('out')) {
        movePlayer('back');
        ask(lore.backChurch);
        answer='';
      }
      return
    }
    feedback('You need a valid verb');
  }
 }

let validVerbs = ['move', 'walk', 'go', 'run', 'crawl','climb', 'squeeze','follow','chase'];
let validPickup = ['grab', 'pickup', 'aquire','snatch','yoink','use','take'];
let knifeStatus = `On the floor is a knife.`
let isPlaying = true

let area = {
  front: ['back'],
  back: ['front', 'hole'],
  hole: ['back','deepHole'],
  deepHole: []
}

let currentArea = 'front'
function movePlayer(newArea) {

  let validTransition = area[currentArea];
  if(validTransition.includes(newArea)) {
    currentArea = newArea;
    locationOutput.textContent = newArea;
} else {
    throw(`Invalid State: ${currentArea} to ${newArea}`)
}
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

  backChurch: `The back of the church is a lot occupied by a few stray cats. They look perturbed that you've interrupted them. Broken glass crunches underfoot. 
  You realize someone has smashed the window open, leaving behind a dark opening. Maybe you could squeeze in...`,

  insideHole: `Something is wrong. You can't tell if its the stale air, the ruptured pews, or the deafening silence thats taken the place of bustling traffic. 
  ${knifeStatus} You stand on the stage next to a forsaken statue of jesus. What sermon will you give the strays?
  In the darkness you see a hole in the floor.`,
}

let playerInventory = {
  //fun fact: the original Zork had a water bottle you could drink from that would refresh the narrator. Thats why I included it as the default inventory item.
    items: {
      Water: 'Water. looks refreshing',
}}
document.getElementById('firstItem').textContent = `Water | Description:`+ playerInventory.items.Water;
console.log(playerInventory.items['Knife']);

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
let currentItems = ['Water'];

function addInventory(item){
  //conditional to prevent duplicates. 
  if(currentItems.includes(item)){
    feedback('You already have that item.');
    return
  }
  let divItem = document.createElement('div');
    divItem.classList.add('item');
    divItem.textContent = `${item} | Description:`+ playerInventory.items[item];
    itemBox.appendChild(divItem);
    currentItems.push(item);
    feedback(`You've aquired: ${item}`);
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

playGame();

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


// church https://i.imgur.com/hHGRykT.png
// window https://i.imgur.com/MGBgcux.png
// inside https://i.imgur.com/0eRhzEs.png
//