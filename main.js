document.addEventListener("DOMContentLoaded", function () {
  const popoverTrigger = document.getElementById('myPopover');
  new bootstrap.Popover(popoverTrigger);
});

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

const NodeClicked = (number) => {
  let nd = node.find(e=>{
    return e.number === number
  })
  if(nd.bolcked) return;
  let elem = getElement(nd.clas);
  elem.id = 'blocked'
  nd.bolcked = true

}

const mainAlgorithm = () => {

}


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

const generateMap = (arr) =>{
  arr.forEach((e,idx)=>{
    let clas = `.inItem-${idx+1}`;
    
    node[idx].number = e;
    node[idx].clas = clas;

    let elem = getElement(clas);
    
    elem.innerHTML = `<span class='nodeText'>${e}</span>`

    elem.addEventListener('click',(event)=>{
      event.preventDefault()
      NodeClicked(e)
    })
  })
}

isUserConnected = false;
areYouInTheGame = false;
isItYourTurn = false;

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

window.onload = function() {
  let arr = generateRandomArray();
  generateMap(arr)

  getAudioData()
  getElement('#musicNumber').innerHTML = `<b>1</b>`

  setConnectionStatus()
  setPlayingStatus()
  
}
