// app.js

const socket = io(); // io function은 알아서 socket.io를 실행하고 있는 서버를 찾을 것이다!

// 방을 만들것!! (socket IO에는 이미 방기능이 있다!)

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true; // 처음에는 방 안에서 할 수 있는 것들 안보이게!

function showRoom(){ // 방에 들어가면 방 내용이 보이게
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room${roomName}` // 저장된 방 이름을 pug의 요소에 전달해서 띄움!
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleRoomSubmit);
  nameForm.addEventListener("submit", handleRoomSubmit);
}

function handleRoomSubmit(event){
    event.preventDefault();
    const input = form.querySelector("input");
    // argument 보내기 가능 (socketIO는 Object 전달가능)
    // 첫 번째는 이벤트명(아무거나 상관없음), 두 번째는 front-end에서 전송하는 object(보내고 싶은 payload), 세 번째는 서버에서 호출하는 function
    socket.emit( // emit의 마지막 요소가 function이면 가능
        "enter_room",
        input.value,
        showRoom // 백엔드에서 끝났다는 사실을 알리기 위해 function을 넣고 싶다면 맨 마지막에 넣자!
    ); // 1. socketIO를 이용하면 모든 것이 메세지일 필요가 없다! / 2. client는 어떠한 이벤트든 모두 emit 가능 / 아무거나 전송할 수 있다(text가 아니어도 되고 여러개 전송 가능!)
    roomName = input.value; // roomname에 입력한 방 이름 저장
    input.value = "";
}

// 서버는 back-end에서 function을 호출하지만 function은 front-end에서 실행됨!!

form.addEventListener("submit", handleRoomSubmit);