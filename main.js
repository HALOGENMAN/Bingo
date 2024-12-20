"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const popoverTrigger = document.getElementById('myPopover');
  new bootstrap.Popover(popoverTrigger);
});

// not in use
function compressString(input) {
  const compressed = new TextEncoder().encode(input);
  const base64String = btoa(String.fromCharCode(...compressed));
  return base64String;
}

// notin use
function decompressString(input) {
  const decoded = atob(input);
  const decompressed = new TextDecoder().decode(Uint8Array.from(decoded, c => c.charCodeAt(0)));
  return decompressed;
}


const getElement = (clas) => {
  return document.querySelector(clas)
}

const toastAction = (message) => {
  const toastLiveExample = document.getElementById('liveToast')
  const toastMessage = getElement('#toastMessage');
  const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
  toastMessage.innerHTML = message
  toastBootstrap.show()
}



// window.onbeforeunload =  (event) => {
//   if(isUserConnected){
//     event.preventDefault(); 
//     event.returnValue = "You will be disconnected if you refresh this page..";
//     return "You will be disconnected if you refresh this page.."; 
//   }
//   return false
// }


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

//========================================================= connection shit =================================================

const configuration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' }
  ]
};



let offerGeneratedValue = false;

const peerConnection = new RTCPeerConnection(configuration);
let sendChannel = {}
function generateOffer(){
  if(offerGeneratedValue){
    showOverlay('overlay')
    return
  }
  peerConnection.onicecandidate = e =>  {
    let qrData = JSON.stringify(peerConnection.localDescription)
    generateQr(qrData)
  }
  sendChannel = peerConnection.createDataChannel("sendChannel");
  sendChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
  sendChannel.onopen = e => console.log("open!!!!");
  sendChannel.onclose =e => console.log("closed!!!!!!");
  peerConnection.createOffer().then(o => peerConnection.setLocalDescription(o) )
}

const connectWithRemote = (answer) =>{
  console.log(answer)
  peerConnection.setRemoteDescription (answer).then(a=>console.log("done",a)).catch(error=>{
    console.log(error)
  })
}



const generateQr = (data) =>{
  document.getElementById("qrcode").innerHTML = ""
  var qrcode = new QRCode(document.getElementById("qrcode"), {
    text: "",
    width: 350,
    height: 350,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L
  });
  // qrcode.clear(); // clear the code./
  // let encodedData = compressString(data)
  setEncodedOffer(data)
  showOverlay('overlay')
  qrcode.makeCode(data);
  offerGeneratedValue = true
}



const setEncodedOffer = (offer) =>{
  console.log()
  getElement('#encodedAnswer').value = offer
}
const showOverlay = (overlayId,delay=10) =>{
  if(overlayId=='overlay'){
    shoeOfferQr()
  }else{
    OfferScanar()
  }
  let overlay = getElement(`#${overlayId}`)
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.opacity = 1;
  }, delay); // Small delay for the animation to trigger
}

const closeOverlay = (overlayId) =>{
  let overlay = getElement(`#${overlayId}`)
  overlay.style.display = 'none';
  setTimeout(() => {
    overlay.style.opacity = 1;
  }, 10); // Small delay for the animation to trigger
}

const copyOffer = (type='Offer') => {
  // Select the input field

  const textToCopy = type==='Offer'?getElement('#encodedAnswer'):getElement('#encodedOfferAnswer')
  copyButtonClicked()
  textToCopy.select();
  textToCopy.setSelectionRange(0, 99999); // For mobile devices

  // Copy the text inside the input
  navigator.clipboard.writeText(textToCopy.value)
    .then(() => {
      toastAction(`${type} copied...`)
    })
    .catch(err => {
      console.error("Failed to copy text: ", err);
    });
}

const copyButtonClicked = () =>{
  let id = getElement('.copyBtn')
  let id2 = getElement('.copyBtn-1')
  id.innerHTML = `<i class="fa-solid fa-check"></i>`
  id2.innerHTML = `<i class="fa-solid fa-check"></i>`
  setTimeout(()=>{
    id.innerHTML = `<i class="fa-solid fa-copy"></i>`
    id2.innerHTML = `<i class="fa-solid fa-copy"></i>`
  },500)
}

const connectUsingOfferToGenerateAnswer  = async (offer) =>{

  const remoteConnection = new RTCPeerConnection()
  remoteConnection.onicecandidate = e =>  {
  console.log(" NEW ice candidnat!! on localconnection reprinting SDP " )
  console.log(JSON.stringify(remoteConnection.localDescription) )
  }

  
  remoteConnection.ondatachannel= e => {
        const receiveChannel = e.channel;
        receiveChannel.onmessage =e =>  console.log("messsage received!!!"  + e.data )
        receiveChannel.onopen = e => console.log("open!!!!");
        receiveChannel.onclose =e => console.log("closed!!!!!!");
        remoteConnection.channel = receiveChannel;

  }


  remoteConnection.setRemoteDescription(offer).then(a=>console.log("done"))

  //create answer
  await remoteConnection.createAnswer().then(a => remoteConnection.setLocalDescription(a)).then(a=>{
    showAnswerQr(JSON.stringify(remoteConnection.localDescription))
  }
  )
}

const generateQrForAnswer = (data) =>{
  document.getElementById("qrcodeAnswer").innerHTML = ""
  var qrcode = new QRCode(document.getElementById("qrcodeAnswer"), {
    text: "",
    width: 350,
    height: 350,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.L
  });
  setEncodedOffer(data)
  qrcode.makeCode(data);
}

const showAnswerQr = (answerQr) =>{
  console.log("showing answer QQQRRRR")
  getElement('#offerHeading').innerHTML = 'Please Tell Other Player to scan the Answer..';
  let qrcode = getElement('#qrcodeAnswer')
  qrcode.style.display = 'block'
  let reader = getElement('#readerAnswer')
  reader.style.display = 'none'
  getElement('#answerIdAnswer').style.display = 'block'
  getElement('#offerIdAnswer').style.display = 'none'
  getElement('#encodedOfferAnswer').value = answerQr;
  generateQrForAnswer(answerQr)
}

const getScannedData = (readerId,type) =>{
  function onScanSuccess(decodedText, decodedResult) {
    // Handle on success condition with the decoded text or result.
    if(type=='offer'){
      
      connectUsingOfferToGenerateAnswer(JSON.parse(decodedText))
    } 
    // ...
    html5QrcodeScanner.clear();
    // ^ this will stop the scanner (video feed) and clear the scan area.
  }
  function onScanError(errorMessage) {
    // handle on error condition, with error message
    console.log(errorMessage)
  }
  var html5QrcodeScanner = new Html5QrcodeScanner(
    readerId, { fps: 10, qrbox: 350 });
  html5QrcodeScanner.render(onScanSuccess,onScanError);
} 

const scanAnswer = () =>{
  getElement('#offerHeading').innerHTML = 'Please Scan the Answer..';
  let qrcode = getElement('#qrcode')
  qrcode.style.display = 'none'
  let reader = getElement('#reader')
  reader.style.display = 'block'
  getElement('#offerId').style.display = 'none'
  getElement('#scanAnswerButton').style.display = 'none'
  getElement('#shoeOfferQrButton').style.display = ''
  getElement('#answerIdBlock').style.display = ''
  getScannedData('readerAnswerr','answer')
}



const gerAnswer = () =>{
  let answerId = getElement('#ancerId');
  let answer = answerId.value;
  if(answer=='') return;
  answerId.value = "";
  connectWithRemote(JSON.parse(answer))
}

const gerOffer = () =>{
  let offer = getElement('#encodedAnswerxx');
  if(offer.value == "") return; 
  let ofr = JSON.parse(offer.value);
  offer.value = "";

  connectUsingOfferToGenerateAnswer(ofr)
  
  
}


function scanOffer(){
  showOverlay('answer')
}

const shoeOfferQr = () =>{
  getElement('#offerHeading').innerHTML = 'Please tell other player to scan the offer.';
  let qrcode = getElement('#qrcode')
  qrcode.style.display = 'block'
  let reader = getElement('#reader')
  reader.style.display = 'none'

  getElement('#offerId').style.display = 'block'
  getElement('#scanAnswerButton').style.display = ''
  getElement('#shoeOfferQrButton').style.display = 'none'
  getElement('#answerIdBlock').style.display = 'none'

}

const OfferScanar = () =>{
  getElement('#offerHeading').innerHTML = 'Please Scan The Offer';
  let qrcode = getElement('#qrcodeAnswer')
  qrcode.style.display = 'none'
  let reader = getElement('#readerAnswer')
  reader.style.display = 'block'
  getElement('#answerIdAnswer').style.display = 'none'
  getElement('#offerIdAnswer').style.display = 'block'
  getScannedData('readerOfferr','offer')

}


// scanAnswerButton

// function domReady(fn) {
//   if (
//       document.readyState === "complete" ||
//       document.readyState === "interactive"
//   ) {
//       setTimeout(fn, 1000);
//   } else {
//       document.addEventListener("DOMContentLoaded", fn);
//   }
// }

// domReady(function () {
  
//   // If found you qr code
//   function onScanSuccess(decodeText, decodeResult) {
//       return alert("You Qr is : " + decodeText, decodeResult);
//   }

//   let htmlscanner = new Html5QrcodeScanner(
//       "my-qr-reader",
//       { fps: 10, qrbos: 250 }
//   );
//   htmlscanner.render(onScanSuccess);
// });



const generateAnswer = () =>{

}



//----------------------------------------------------------end connection shit -----------------------------------------------------

// =========================================game shit============================================================
const node = Array.from({ length: 25 }, (_, i) => ({ number:-1, clas:"", bolcked:false}));

const generateRandomArray = () => {
  const array = Array.from({ length: 25 }, (_, i) => i + 1);
  for (let i = array.length - 1; i > 0; i--) {
      const randomIndex = Math.floor(Math.random() * (i + 1));
      [array[i], array[randomIndex]] = [array[randomIndex], array[i]]; // Swap
  }
  return array;
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

//--------------------------------------------------end game shit---------------------------------------------------



window.onload = function() {
  resetBoard()
  getAudioData()
  getElement('#musicNumber').innerHTML = `<b>1</b>`

  setConnectionStatus()
  setPlayingStatus()
  
}
