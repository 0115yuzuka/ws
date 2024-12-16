class WebSocketService {
  constructor(url, clientType) {
    this.socket = io(url);
    this.clientType = clientType;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.socket.on("connect", () => {
        console.log("Connected to server");
        this.socket.emit("register", {
          clientType: this.clientType,
        });
        resolve();
      });

      this.socket.on("connect_error", (error) => {
        console.error("Connection error:", error);
        reject(error);
      });
    });
  }

  onMessage(callback) {
    this.socket.on("movement", (data) => {
      callback(data);
    });
  }
}

window.WebSocketService = WebSocketService;
