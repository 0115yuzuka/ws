const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // 本番環境では適切なオリジンに制限してください
    methods: ["GET", "POST"],
  },
});

// 静的ファイルを配信するディレクトリを設定
const pcClientPath = path.join(__dirname, "..", "PC_client");
const mobileClientPath = path.join(__dirname, "..", "Mobile_Client");

// クライアント管理用の変数
let pcClient = null;
let mobileClient = null;

// モバイルタイプを判定する関数
function getClientDirectory(userAgent) {
  if (/Mobi|Android|iPhone|iPad|iPod/i.test(userAgent)) {
    return mobileClientPath;
  }
  return pcClientPath;
}

// 静的ファイルを提供するミドルウェア
app.use((req, res, next) => {
  const clientDirectory = getClientDirectory(req.get("User-Agent"));
  console.log(`Serving files from: ${clientDirectory}`);
  express.static(clientDirectory)(req, res, next);
});

// Socket.IO接続の処理
io.on("connection", (socket) => {
  console.log("新しい接続:", socket.id);

  // クライアントタイプの登録を処理
  socket.on("register", (data) => {
    console.log("クライアント登録:", data.clientType);

    if (data.clientType === "pc") {
      pcClient = socket;
      console.log("PCクライアント接続完了");
    } else if (data.clientType === "mobile") {
      mobileClient = socket;
      console.log("モバイルクライアント接続完了");
    }
  });

  // 切断時の処理
  socket.on("disconnect", () => {
    if (socket === pcClient) {
      pcClient = null;
      console.log("PCクライアント切断");
    } else if (socket === mobileClient) {
      mobileClient = null;
      console.log("モバイルクライアント切断");
    }
  });

  // 動作確認用：接続状態をログ出力
  console.log("現在の接続状態:");
  console.log("PC:", pcClient ? "接続中" : "未接続");
  console.log("Mobile:", mobileClient ? "接続中" : "未接続");
});

const IP_ADDRESS = "0.0.0.0";
const PORT = process.env.PORT || 3000;

server.listen(PORT, IP_ADDRESS, () => {
  console.log(`-------------------------`);
  console.log(`Server running at http://172.24.81.51:${PORT}`);
  console.log(`-------------------------`);
});
