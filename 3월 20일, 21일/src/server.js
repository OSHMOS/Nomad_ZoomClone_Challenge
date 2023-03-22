import http from "http";
import WebSocket from "ws"; // npm i ws
import express from "express";

const app = express();

app.set("view engine", "pug"); // 뷰 엔진을 pug로 하겠다
app.set("views", __dirname + "/views"); // 디렉토리 설정
app.use("/public", express.static(__dirname + "/public")); // public 폴더를 유저에게 공개 (유저가 볼 수 있는 폴더 지정)
app.get("/", (req, res) => res.render("home")); // 홈페이지로 이동할 때 사용될 템플릿을 렌더
app.get("/*", (req, res) => res.redirect("/")) // 홈페이지 내 어느 페이지에 접근해도 홈으로 연결되도록 리다이렉트 (다른 url 사용 안할거라)

const handleListen = () => console.log(`Listening on http://localhost:3000`)
// app.listen(3000, handleListen);

const server = http.createServer(app); // app은 requestlistener 경로 - express application으로부터 서버 생성

const wss = new WebSocket.Server({ server }); // http 서버 위에 webSocket서버 생성, 위의 http로 만든 server는 필수 X - 이렇게 하면 http / ws 서버 모두 같은 3000번 포트를 이용해서 돌릴 수 있다!

// 임시로 만든 함수
function handleConnection(socket) { // 여기서 socket은 연결된 브라우저
    console.log(socket) // 여기 있는 소켓이 frontend와 real-time으로 소통할 수 있다!
};

// on method에서는 event가 발동되는 것을 기다린다
// event가 connection / 뒤에 오는 함수는 event가 일어나면 작동
// 그리고 on method는 backend에 연결된 사람의 정보를 제공 - 그게 socket에서 옴
wss.on("connection", handleConnection) // socket을 callback으로 받는다! webSocket은 서버와 브라우저 사이의 연결!!!


server.listen(3000, handleListen); // 서버는 ws, http 프로토콜 모두 이해할 수 있게 된다!