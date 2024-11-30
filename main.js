document.addEventListener("DOMContentLoaded", function () {
  const popoverTrigger = document.getElementById('myPopover');
  new bootstrap.Popover(popoverTrigger);
});

// ============================= music shit =========================================

let musicPlayVolume = 0;
let totalAudioFiles = 0;
let currentAudioFile = 0;
let audioFileNames = []

const  getMusicEle = () => {
  return  document.getElementById("backgroundMusic");
}

const getAudioData = () =>{
  fetch('data/audio.json')
  .then(raw=>raw.json())
  .then(data=>{
    audioFileNames = data;
    totalAudioFiles = data.length
    getMusicEle().src = data[0];
  })
  .catch(err=>{
    console.log("error in fetching audio data")
  })
}

const changeMusicNumber = () =>{
  currentAudioFile = (currentAudioFile+1)%totalAudioFiles;
  getElement('#musicNumber').innerHTML = `<b>${currentAudioFile+1}</b>`
  getMusicEle().src = audioFileNames[currentAudioFile]; 
  getMusicEle().play()
  let speaker = getElement('#music');
  if(musicPlayVolume === 0){
    speaker.className = 'fa fa-volume-off';
    getMusicEle().volume = 0.2;
    getMusicEle().play()
    musicPlayVolume = 1;
  }
}

const toggleMusic = () =>{
  let speaker = getElement('#music');
  if(musicPlayVolume === 0){
    speaker.className = 'fa fa-volume-off';
    getMusicEle().volume = 0.2;
    getMusicEle().play()
    musicPlayVolume = 1;
  }else if(musicPlayVolume === 1){
    speaker.className = 'fa-solid fa-volume-low';
    getMusicEle().volume = 0.5;
    musicPlayVolume = 2;
  }else if(musicPlayVolume === 2){
    speaker.className = 'fa-solid fa-volume-high';
    getMusicEle().volume = 1;
    musicPlayVolume = 3;
  }else{
    speaker.className = 'fa fa-volume-xmark';
    getMusicEle().pause()
    musicPlayVolume = 0;
  }
}
//------------------------------------------end music shit----------------------------------------



const node = Array.from({ length: 25 }, (_, i) => ({ number:-1, clas:"", bolcked:false}));

const generateRandomArray = () => {
  const array = Array.from({ length: 25 }, (_, i) => i + 1);
  for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]]; // Swap
  }
  return array;
}

const getElement = (clas) => {
  return document.querySelector(clas)
}

let isUserConnected = true;
let areYouInTheGame = true;
let isItYourTurn = true;

const resetTheGame = () =>{
  isUserConnected = false;
  areYouInTheGame = false;
  isItYourTurn = false;
  setConnectionStatus()
  setPlayingStatus()
}

const NodeClicked = (number) => {
  if(!isItYourTurn && isUserConnected) return

  let nd = node.find(e=>{
    return e.number === number
  })
  if(nd.bolcked) return;
  let elem = getElement(nd.clas);
  elem.id = `blocked`
  nd.bolcked = true
  mainAlgorithm()
}


const generateMap = (arr) =>{
  arr.forEach((e,idx)=>{
    let clas = `.inItem-${idx+1}`;
    
    node[idx].number = e;
    node[idx].clas = clas;
    node[idx].bolcked = false;

    let elem = getElement(clas);
    elem.id = ''
    elem.innerHTML = `<span class='nodeText'>${e}</span>`
    elem.onclick = (event) =>{
      event.preventDefault()
      NodeClicked(e)
    }
    // elem.addEventListener('click',(event)=>{
      
    // })
  })
}

const startTheGame = () =>{
  if(!isUserConnected){
    return alert('First you need to connect with the another player, then you can start the game..')
  }
  if(areYouInTheGame){
    return alert('First finishi this game then start new game..')
  }

  // send playing request

}

const setConnectionStatus = (connId) =>{
  let connStatus = getElement('#connectionStatus');
  if(!isUserConnected){
    connStatus.innerHTML = 'You Are Not Connected..'
    connStatus.className = 'textCenter notConnected'
  }else{
    connStatus.innerHTML = `Connected with: ${connId}`
    connStatus.className = 'textCenter connected'
  }
}

const setPlayingStatus = () =>{
  let palyingStatus = getElement('#playingStatus');
  if(!areYouInTheGame){
    palyingStatus.innerHTML = 'Playing Status'
    palyingStatus.className = 'textCenter_payingStatus'
  }else{
    if(isItYourTurn){
      palyingStatus.innerHTML = 'Your Turn'
      palyingStatus.className = 'textCenter_payingStatus yourTurn'
    }else{
      palyingStatus.innerHTML = 'Not Your Turn'
      palyingStatus.className = 'textCenter_payingStatus notYourTurn'
    }
  }
}
const resetBoard = () =>{
  let arr = generateRandomArray();
  generateMap(arr)
}
const resetBoardAction = () =>{
  if(areYouInTheGame){
    if(confirm('You are currently in the game if you Reset the board you will "lose" and get "disconnected"....')){
      resetTheGame()
      resetBoard()
    }
  }else{
    resetBoard()
  }
} 
const calculateNodeIndex = (r,c) => {
  return (r*5)+c;
}
const mainAlgorithm = () => {
  if(!areYouInTheGame) return;
  let count=0;
  // top left diagonal
  let check = true;
  for(let i=0;i<5;i++){
    if(!node[calculateNodeIndex(i,i)].bolcked){
      check=false;
      break;
    }
  }
  if(check){
    count++;
    for(let i=0;i<5;i++){
      getElement(node[calculateNodeIndex(i,i)].clas).id='cooked'
    }
  } 
  // top right diagonal
  check = true;
  for(let i=0;i<5;i++){
    if(!node[calculateNodeIndex(i,4-i)].bolcked){
      check=false;
      break;
    }
  }
  if(check){
    count++;
    for(let i=0;i<5;i++){
      getElement(node[calculateNodeIndex(i,4-i)].clas).id='cooked'
    }
  } 

  // calculate rows
  for(let r=0;r<5;r++){
    check = true;
    for(let c=0;c<5;c++){
      if(!node[calculateNodeIndex(r,c)].bolcked){
        check=false;
        break;
      }
    }
    if(check){
      count++;
      for(let c=0;c<5;c++){
        getElement(node[calculateNodeIndex(r,c)].clas).id='cooked'
      }
    } 
    if(count>=5){
      console.log("you won the game")
      areYouInTheGame = false
      return;
    }
  }

  // calculate columns
  for(let c=0;c<5;c++){
    check = true;
    for(let r=0;r<5;r++){
      if(!node[calculateNodeIndex(r,c)].bolcked){
        check=false;
        break;
      }
    }
    if(check){
      count++;
      for(let r=0;r<5;r++){
        getElement(node[calculateNodeIndex(r,c)].clas).id='cooked'
      }
    } 
    if(count>=5){
      console.log("you won the game")
      areYouInTheGame = false
      return;
    }
  }
  
}

window.onload = function() {
  resetBoard()
  getAudioData()
  getElement('#musicNumber').innerHTML = `<b>1</b>`

  setConnectionStatus()
  setPlayingStatus()
  
}
