// app.js

const messageList = document.querySelector('ul');
const messageForm = document.querySelector('form');

const socket = new WebSocket(`ws://${window.location.host}`); // 이제 서버로 접속 가능! - 여기 socket을 이용해서 frontend에서 backend로 메세지 전송 가능!
// 여기 socket은 서버로의 연결

socket.addEventListener("open", ()=>{ // open되면 동작
  console.log("Connected to Server ✅");
})

socket.addEventListener("message", message => {
  console.log("New message: ", message.data);
});

socket.addEventListener("close", () => {
  console.log("Disconnected to Server ❌");
});

// setTimeout(() => {
//   socket.send("hello from the browser!"); // backend로 메시지 보내기!
// }, 10000); // 10초 후에 작동

function handleSubmit(event){
  event.preventDefault();
  const input = messageForm.querySelector('input');
  socket.send(input.value);
  input.value = '';
}

messageForm.addEventListener('submit', handleSubmit);