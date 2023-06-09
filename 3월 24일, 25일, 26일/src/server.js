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
const wsServer = new Server(httpServer);
wsServer.on("connection", socket => {
  socket.on("join_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome"); // 특정 룸에 이벤트 보내기
  });
  socket.on("offer", (offer, roomName) => { // offer 이벤트가 들어오면, roomName에 있는 사람들에게 offer 이벤트를 전송하면서 offer를 전송한다.
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  })
})
httpServer.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!