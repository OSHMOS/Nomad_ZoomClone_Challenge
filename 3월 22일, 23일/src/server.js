import http from "http";
import WebSocket from "ws"; // npm i ws
import express from "express";
import SocketIO from "socket.io";
import { doesNotMatch } from 'assert';

const app = express();

app.set("view engine", "pug"); // 뷰 엔진을 pug로 하겠다
app.set("views", __dirname + "/views"); // 디렉토리 설정
app.use("/public", express.static(__dirname + "/public")); // public 폴더를 유저에게 공개 (유저가 볼 수 있는 폴더 지정)
app.get("/", (req, res) => res.render("home")); // 홈페이지로 이동할 때 사용될 템플릿을 렌더
app.get("/*", (req, res) => res.redirect("/")) // 홈페이지 내 어느 페이지에 접근해도 홈으로 연결되도록 리다이렉트 (다른 url 사용 안할거라)

const handleListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, handleListen);

const httpServer = http.createServer(app); // app은 requestlistener 경로 - express application으로부터 서버 생성
const wsServer = SocketIO(httpServer); // localhost:3000/socket.io/socket.io.js로 연결 가능 (socketIO는 websocket의 부가기능이 아니다!!)

// websocket에 비해 개선점 : 1. 어떤 이벤트든지 전달 가능 2. JS Object를 보낼 수 있음
wsServer.on("connection", socket => {
    socket["nickname"] = "Anonymous";
    socket.onAny((event) => { // 미들웨어같은 존재! 어느 이벤트에서든지 console.log를 할 수 있다.
        console.log(`Socket Event:${event}`)
    })
    socket.on("enter_room", (roomName, done) => {
        // console.log(socket.rooms); // 현재 들어가져 있는 방을 표시 (기본적으로 User와 Server 사이에 private room이 있다!)
        socket.join(roomName);
        // console.log(socket.rooms); // 앞은 id, 뒤는 현재 들어가져 있는 방
        done();
        socket.to(roomName).emit("welcome", socket.nickname) // welcome 이벤트를 roomname에 있는 모든 사람들에게 emit한 것
    });
})

httpServer.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!