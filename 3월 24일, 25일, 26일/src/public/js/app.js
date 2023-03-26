// app.js

const socket = io(); // io function은 알아서 socket.io를 실행하고 있는 서버를 찾을 것이다!

const myFace = document.getElementById("myFace");

let myStream;
// stream 받기 : stream은 비디오와 오디오가 결합된 것

// https://developer.mozilla.org/ko/docs/Web/API/MediaDevices/getUserMedia 사용 : 유저의 유저미디어 string을 받기위함
async function getMedia() {
  try { // 비동기라서 try - catch 문을 사용
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true
    })
    myFace.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}

getMedia();