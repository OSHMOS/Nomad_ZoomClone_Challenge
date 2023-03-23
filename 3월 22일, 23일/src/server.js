import http from "http";
import express from "express";
// npm i @socket.io/admin-ui
import { instrument } from "@socket.io/admin-ui";
import { Server } from "socket.io";

const app = express();

app.set("view engine", "pug"); // 뷰 엔진을 pug로 하겠다
app.set("views", __dirname + "/views"); // 디렉토리 설정
app.use("/public", express.static(__dirname + "/public")); // public 폴더를 유저에게 공개 (유저가 볼 수 있는 폴더 지정)
app.get("/", (req, res) => res.render("home")); // 홈페이지로 이동할 때 사용될 템플릿을 렌더
app.get("/*", (req, res) => res.redirect("/")) // 홈페이지 내 어느 페이지에 접근해도 홈으로 연결되도록 리다이렉트 (다른 url 사용 안할거라)

const handleListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, handleListen);

const httpServer = http.createServer(app); // app은 requestlistener 경로 - express application으로부터 서버 생성
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"], // 이 URL에서 localhost:3000에 액세스할 것이기 때문에! - 온라인에서 Admin UI를 실제로 테스트할 수 있는 데모 사용을 위한 환경설정!
    credentials: true
  }
}); // localhost:3000/socket.io/socket.io.js로 연결 가능 (socketIO는 websocket의 부가기능이 아니다!!)

instrument(wsServer, {
  auth: false, // 실제 비밀번호를 쓰도록 바꿀 수 있음!
  mode: "development",
});

function publicRooms(){
    const {
      sockets: {
        adapter: {
          sids, rooms
        }
      }
    } = wsServer; // wsServer에서 sids와 rooms 가져오기
  
    // public room list 만들기
    const publicRooms = [];
    rooms.forEach((_, key) => {
      if (sids.get(key) === undefined){
        publicRooms.push(key);
      }
    });
    
    return publicRooms;
}

function countRoom(roomName){ // 방에 사람 몇 명이 있는지 계산하는 함수 (set의 size를 이용)
  return wsServer.sockets.adapter.rooms.get(roomName)?.size; // roomName을 찾을 수도 있지만 못 찾을 수도 있기 때문에 ?를 붙여준다.
}

// websocket에 비해 개선점 : 1. 어떤 이벤트든지 전달 가능 2. JS Object를 보낼 수 있음
wsServer.on("connection", socket => {
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => { // 미들웨어같은 존재! 어느 이벤트에서든지 console.log를 할 수 있다.
        console.log(`Socket Event:${event}`)
    });
    socket.on("enter_room", (roomName, done) => {
        // console.log(socket.rooms); // 현재 들어가져 있는 방을 표시 (기본적으로 User와 Server 사이에 private room이 있다!)
        socket.join(roomName);
        // console.log(socket.rooms); // 앞은 id, 뒤는 현재 들어가져 있는 방
        done();
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // welcome 이벤트를 roomname에 있는 모든 사람들에게 emit한 것
        wsServer.sockets.emit("room_change", publicRooms()); // roomchange 이벤트와 payload는 publicRooms 함수의 결과 (우리 서버 안에 있는 모든 방의 array = 서버의 모든 socket)
    });
    socket.on("disconnecting", () => { // 클라이언트가 서버와 연결이 끊어지기 전에 마지막 굿바이 메시지를 보낼 수 있다!
        socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)); // 방 안에 있는 모든 사람에게 보내기 위해 forEach 사용! 나가면 사람 수가 바뀌므로 사람 수 count! 
    });
    socket.on('disconnect', () => {
        wsServer.sockets.emit("room_change", publicRooms()); // 클라이언트가 종료메시지를 모두에게 보내고 room이 변경되었다고 모두에게 알림!
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done(); // done은 프론트엔드에서 코드를 실행할 것!! (백엔드에서 작업)
    });
    socket.on("nickname", nickname => socket["nickname"] = nickname);
})

httpServer.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!