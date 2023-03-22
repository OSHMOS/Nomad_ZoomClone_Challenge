// app.js

const messageList = document.querySelector('ul');
const nickForm = document.querySelector('#nick')
const messageForm = document.querySelector('#message');

const socket = new WebSocket(`ws://${window.location.host}`); // 이제 서버로 접속 가능! - 여기 socket을 이용해서 frontend에서 backend로 메세지 전송 가능!
// 여기 socket은 서버로의 연결

socket.addEventListener("open", ()=>{ // open되면 동작
  console.log("Connected to Server ✅");
})

socket.addEventListener("message", message => {
  const li = document.createElement('li');
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server ❌");
});

// makeMessage : JSON을 String 형태로 바꿔주는 함수
// 사용하는 클라이언트가 GO일 수도 있고, JAVA일 수도 있기 때문에 Javascript Object 형태로 보내면 안되고, String 형태로 보내서 모든 언어를 대비할 수 있어야 한다!
// 우리가 사용하는 API인 websocket은 브라우저의 API이기 때문이다!!
// 백엔드에서는 다양한 프로그래밍 언어를 사용할 수 있기 때문에 API는 어떠한 판단도 하면 안된다!
function makeMessage(type, payload){
  const msg = {type, payload};
  return JSON.stringify(msg);
}

function handleSubmit(event){
  event.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(makeMessage('new_message', input.value));
  input.value = '';
}

function handleNickSubmit(event){
  event.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeMessage('nickname', input.value));
  input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);
nickForm.addEventListener('submit', handleNickSubmit);