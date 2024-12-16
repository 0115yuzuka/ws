class WebSocketService {
  constructor(url, clientType) {
    this.socket = io(url);
    this.clientType = clientType;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket.on("connect", () => {
        this.socket.emit("register", {
          type: "register",
          clientType: this.clientType,
        });
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        reject(`Socket.IO Error: ${error}`);
      });
    });
  }

  onMessage(callback) {
    this.socket.on("message", (data) => {
      callback(data);
    });
  }

  sendMovementData(x, y, z) {
    if (this.socket && this.socket.connected) {
      this.socket.emit("movement", {
        type: "movement",
        x: x,
        y: y,
        z: z,
      });
    }
  }
}

// windowオブジェクトにアタッチ
window.WebSocketService = WebSocketService;
