import { io } from "socket.io-client";
import http from 'http';

console.log("Connecting to socket...");
const socket = io("http://localhost:4000", { transports: ['websocket'] });

socket.on("connect", () => {
  console.log("Socket connected! ID:", socket.id);
  
  console.log("Joining channel workspace-proj-101-general...");
  socket.emit("join_channel", { channelId: "workspace-proj-101-general" });
  
  setTimeout(() => {
    console.log("Sending HTTP POST request...");
    const data = JSON.stringify({ content: 'hello from script' });
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: '/api/messages/channel/workspace-proj-101-general',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      console.log(`API Status: ${res.statusCode}`);
    });
    req.write(data);
    req.end();
  }, 1000);
});

socket.on("receive_message", (msg) => {
  console.log("Socket received message:", msg.content);
  process.exit(0);
});

setTimeout(() => {
  console.error("Timeout! Did not receive message via socket.");
  process.exit(1);
}, 5000);
