// app.js

const socket = io(); // io function은 알아서 socket.io를 실행하고 있는 서버를 찾을 것이다!

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
// stream 받기 : stream은 비디오와 오디오가 결합된 것

let muted = false; // 처음에는 음성을 받음
let cameraOff = false; // 처음에는 영상을 받음

function handleMuteClick() {
  myStream.getAudioTracks().forEach(tracks => tracks.enabled = !tracks.enabled);
  if(!muted) {
    muteBtn.innerText = "Unmute";
    muted = true;
  }
  else {
    muteBtn.innerText = "Mute";
    muted = false;
  }
}

function handleCameraClick() {
  myStream.getVideoTracks().forEach(tracks => tracks.enabled = !tracks.enabled);
  if(cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  }
  else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices(); // 장치 리스트 가져오기
    const cameras = devices.filter(device => device.kind === "videoinput"); // 비디오 인풋만 가져오기
    cameras.forEach(camera => {
      const option = document.createElement("option"); // 새로운 옵션 생성
      option.value = camera.deviceId; // 카메라의 고유 값을 value에 넣기
      option.innerText = camera.label; // 사용자가 선택할 때는 label을 보고 선택할 수 있게 만들기
      camerasSelect.appendChild(option); // 카메라의 정보들을 option 항목에 넣어주기
    })
  } catch (e) {
    console.log(e);
  }
}

// https://developer.mozilla.org/ko/docs/Web/API/MediaDevices/getUserMedia 사용 : 유저의 유저미디어 string을 받기위함
async function getMedia() {
  try { // 비동기라서 try - catch 문을 사용
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    myFace.srcObject = myStream;
    await getCameras();
  } catch (e) {
    console.log(e);
  }
}

getMedia();