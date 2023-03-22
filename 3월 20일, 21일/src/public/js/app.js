alert('hi'); // frontend에서 backend랑 연결해 달라고 해야 앞에서 만든 wss.on의 connection이 작동한다!

const socket = new WebSocket(`ws://${window.location.host}`); // 이제 서버로 접속 가능! - 여기 socket을 이용해서 frontend에서 backend로 메세지 전송 가능!
// 여기 socket은 서버로의 연결