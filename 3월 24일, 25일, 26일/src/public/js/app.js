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

let roomName;
let myPeerConnection; // 누군가 getMedia 함수를 불렀을 때와 똑같이 Stream을 공유하기 위한 변수

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

async function handleCameraChange() {
  await getMedia(camerasSelect.value);
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

// 카메라 변경 확인
camerasSelect.addEventListener("input", handleCameraChange);

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
async function getMedia(deviceId) {
  const initialConstraints = { // initialConstraints는 deviceId가 없을 때 실행
    audio: true,
    video: {facingmode: "user"}, // 카메라가 전, 후면에 달려있을 경우 전면 카메라의 정보를 받음 (후면 : 'environment')
  };
  const cameraConstraints = { // cameraConstraints는 deviceId가 있을 때 실행
    audio: true,
    video: {deviceId: {exact: deviceId}}, // exact를 쓰면 받아온 deviceId가 아니면 출력하지 않는다.
  };

  try { // 비동기라서 try - catch 문을 사용
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    myFace.srcObject = myStream;
    if (!deviceId) {
      await getCameras(); // 처음 딱 1번만 실행! 우리가 맨 처음 getMedia를 할 때만 실행됨!!
    }
  } catch (e) {
    console.log(e);
  }
}

const welcome = document.getElementById("welcome");
const call = document.getElementById("call")

call.hidden = true;

const welcomeForm = welcome.querySelector("form");

async function startMedia() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}

function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  socket.emit("join_room", input.value, startMedia); // 서버로 input value를 보내는 과정!!
  roomName = input.value; // 방에 참가했을 때 나중에 쓸 수 있도록 방 이름을 변수에 저장
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", async () => {
  const offer = await myPeerConnection.createOffer(); // 다른 사용자를 초대하기 위한 초대장!! (내가 누구인지를 알려주는 내용이 들어있음!)
  myPeerConnection.setLocalDescription(offer); // myPeerConnection에 내 초대장의 위치 정보를 연결해주는 과정
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
})

socket.on("offer", offer => {
  console.log(offer);
})

function makeConnection() {
  myPeerConnection = new RTCPeerConnection(); // peerConnection을 각각의 브라우저에 생성 ~ 참조
  myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream)); // 영상과 음성 트랙을 myPeerConnection에 추가해줌 -> Peer-to-Peer 연결!!
}