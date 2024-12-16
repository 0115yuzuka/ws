class FishingController {
  constructor() {
    this.init();
    this.lastUpdate = 0;
    this.updateInterval = 50;
  }

  async init() {
    try {
      await this.setupWebSocket();
      this.setupUI();
      await this.setupMotionSensor();
    } catch (error) {
      console.error("初期化エラー:", error);
      this.updateStatus("エラーが発生しました: " + error.message);
    }
  }

  async setupMotionSensor() {
    // iOSの場合
    if (
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function"
    ) {
      const button = document.createElement("button");
      button.textContent = "センサーを有効化";
      button.className = "button";
      button.onclick = async () => {
        try {
          const permission = await DeviceOrientationEvent.requestPermission();
          if (permission === "granted") {
            this.startMotionSensor();
            button.remove();
          } else {
            throw new Error("センサーの使用が許可されませんでした");
          }
        } catch (error) {
          console.error("センサー許可エラー:", error);
          this.updateStatus("センサーの許可が必要です");
        }
      };
      document.body.appendChild(button);
    } else {
      // iOS以外の場合は直接センサーを開始
      this.startMotionSensor();
    }
  }

  startMotionSensor() {
    if (window.DeviceMotionEvent) {
      window.addEventListener("devicemotion", this.handleMotion.bind(this));
      this.updateStatus("センサー準備完了");
    } else {
      this.updateStatus(
        "このデバイスはモーションセンサーをサポートしていません"
      );
    }
  }

  async setupWebSocket() {
    try {
      await window.socketService.connect("http://172.24.81.51:3000", "mobile");
      this.updateStatus("接続完了！");
    } catch (error) {
      console.error("Socket.IO接続エラー:", error);
      this.updateStatus("接続エラー");
      throw error;
    }
  }

  handleMotion(event) {
    const now = Date.now();
    if (now - this.lastUpdate < this.updateInterval) return;

    const x = event.accelerationIncludingGravity.x;
    const y = event.accelerationIncludingGravity.y;
    const z = event.accelerationIncludingGravity.z;

    if (x != null && y != null && z != null) {
      window.socketService.sendMovementData(
        this.roundToTwo(x),
        this.roundToTwo(y),
        this.roundToTwo(z)
      );
      this.updateMotionData(x, y, z);
    }

    this.lastUpdate = now;
  }

  roundToTwo(num) {
    return Math.round(num * 100) / 100;
  }

  setupUI() {
    this.statusElement = document.getElementById("status");
    this.motionDataElement = document.createElement("div");
    this.motionDataElement.id = "motionData";
    document.body.appendChild(this.motionDataElement);
  }

  updateStatus(message) {
    if (this.statusElement) {
      this.statusElement.textContent = message;
    }
  }

  updateMotionData(x, y, z) {
    if (this.motionDataElement) {
      this.motionDataElement.textContent = `
        X: ${this.roundToTwo(x)}
        Y: ${this.roundToTwo(y)}
        Z: ${this.roundToTwo(z)}
      `;
    }
  }
}

window.onload = () => {
  new FishingController();
};
