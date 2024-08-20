import express from "express";
import { toShuffle } from "./lib.js";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { THEMES } from "./themes.js";

const states = { WAITING: "waiting", STARTED: "started", FINISHED: "finished" };
const port = 3030;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

//ROOMS
const activeRooms = [];
//

app.get("/", (req, res) => {
  res.sendFile(new URL("../client/index.html", import.meta.url).pathname);
});

io.on("connection", async (socket) => {
  function getTheme() {
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const randomPaintersThemeIdx = Math.floor(
      Math.random() * randomTheme.length
    );

    let randomScammersThemeIdx = -1;

    do {
      randomScammersThemeIdx = Math.floor(Math.random() * randomTheme.length);
    } while (randomScammersThemeIdx == randomPaintersThemeIdx);

    return [randomTheme, randomPaintersThemeIdx, randomScammersThemeIdx];
  }

  console.log("Bonjour ", socket.id);
  socket.on("roomRequest", (requestedRoomCode, user) => {
    console.log("Received request for room :", requestedRoomCode);
    const requestedRoom = activeRooms.find(
      (room) => room.code === requestedRoomCode
    );
    if (!requestedRoom) {
      socket.emit("roomRequestResponse", "none");
    } else {
      if (requestedRoom.players.find((p) => p.id === socket.id)) {
        socket.emit("roomRequestResponse", "error");
      } else {
        const _user = { ...user, id: socket.id, canPaint: true, score: 0 };
        io.to(requestedRoomCode).emit("playerConnection", _user);
        socket.join(requestedRoomCode);
        requestedRoom.players.push(_user);
        socket.emit("roomRequestResponse", requestedRoom);
      }
    }
  });

  socket.on("roomCreate", (requestedRoomCode, user) => {
    const requestedRoom = activeRooms.find(
      (room) => room.code === requestedRoomCode
    );
    if (!requestedRoom) {
      const _user = { ...user, id: socket.id, canPaint: true, score: 0 };
      socket.join(requestedRoomCode);
      const [randomTheme, randomPaintersThemeIdx, randomScammersThemeIdx] =
        getTheme();

      const _room = {
        code: requestedRoomCode,
        players: [_user],
        admin_id: socket.id,
        settings: { painters: 1, scammers: 1 },
        state: states.WAITING,
        paintersTheme: randomTheme[randomPaintersThemeIdx],
        scammersTheme: randomTheme[randomScammersThemeIdx],
      };

      activeRooms.push(_room);
      socket.emit("roomCreateResponse", {
        ..._room,
        paintersTheme: "",
        scammersTheme: "",
      });
    } else {
      socket.emit("roomCreateResponse", { error: "Ce lobby existe déjà !" });
    }
  });

  socket.on("setRoomSettings", (data, roomCode) => {
    const room = activeRooms.find((r) => r.code === roomCode);
    if (room) {
      console.log(data);
      if (socket.id === room.admin_id) {
        if (data.painters) room.settings.painters = data.painters;
        if (data.scammers) room.settings.scammers = data.scammers;

        io.to(roomCode).emit("roomSettingsUpdate", room.settings);
      }
    }
  });

  socket.on("reloadGame", (data) => {
    console.log("Relance de ", data);
    const room = activeRooms.find((r) => r.code === data.room.code);

    if (room.state == states.FINISHED) {
      const [randomTheme, randomPaintersThemeIdx, randomScammersThemeIdx] =
        getTheme();

      room.players.forEach((p) => {
        p.role = "";
        p.canPaint = true;
      });

      io.to(room.code).emit("playerList", room.players);

      const shuffled = toShuffle(room.players);
      //Roles attribution
      shuffled[0].role = "buyer";
      shuffled[0].canPaint = false;
      for (let i = 0; i < room.settings.painters; i++) {
        shuffled[i + 1].role = "painter";
      }
      for (let i = 0; i < room.settings.scammers; i++) {
        shuffled[i + 1 + room.settings.painters].role = "scammer";
      }

      room.players = shuffled;
      room.activePlayer = 0;
      //We can get rid of buyer in the players order
      room.playersOrder = toShuffle(room.players.slice(1));
      room.paintersTheme = randomTheme[randomPaintersThemeIdx];
      room.scammersTheme = randomTheme[randomScammersThemeIdx];
      room.state = states.STARTED;
      room.startDate = new Date().getTime();

      console.log("emit roomupdate from reloadGame");
      io.to(room.code).emit(
        "roomUpdate",
        room.state,
        room.players[0],
        room.playersOrder[room.activePlayer].id
      );
      room.players.forEach((p) => {
        io.to(p.id).emit(
          "playerRoleUpdate",
          p.role,
          p.role !== "buyer" ? room.paintersTheme : "",
          p.role === "scammer" ? room.scammersTheme : ""
        );
      });

      room.interval = setInterval(() => {
        io.to(room.code).emit(
          "tick",
          parseInt("" + (new Date().getTime() - room.startDate) / 1000)
        );
      }, [1000]);
    }
  });

  socket.on("startGame", (data) => {
    console.log("Lancement de ", data);
    const room = activeRooms.find((r) => r.code === data.room.code);

    if (room.state == states.WAITING) {
      const shuffled = toShuffle(room.players);
      //Roles attribution
      shuffled[0].role = "buyer";
      shuffled[0].canPaint = false;
      for (let i = 0; i < room.settings.painters; i++) {
        shuffled[i + 1].role = "painter";
      }
      for (let i = 0; i < room.settings.scammers; i++) {
        shuffled[i + 1 + room.settings.painters].role = "scammer";
      }

      room.players = shuffled;
      room.activePlayer = 0;
      //We can get rid of buyer in the players order
      room.playersOrder = toShuffle(room.players.slice(1));
      room.state = states.STARTED;
      room.startDate = new Date().getTime();

      console.log("emit roomupdate from startGame");
      io.to(room.code).emit(
        "roomUpdate",
        room.state,
        room.players[0],
        room.playersOrder[room.activePlayer].id
      );
      room.players.forEach((p) => {
        io.to(p.id).emit(
          "playerRoleUpdate",
          p.role,
          p.role !== "buyer" ? room.paintersTheme : "",
          p.role === "scammer" ? room.scammersTheme : ""
        );
      });

      room.interval = setInterval(() => {
        io.to(room.code).emit(
          "tick",
          parseInt("" + (new Date().getTime() - room.startDate) / 1000)
        );
      }, [1000]);
    }
  });

  socket.on("nextPlayer", (data) => {
    const room = activeRooms.find((r) => r.code === data.room.code);
    if (!room) {
      return;
    }

    if (room.state == states.STARTED) {
      const activePlayer = room.playersOrder[room.activePlayer];
      if (activePlayer.id === data.socketId) {
        room.activePlayer = (room.activePlayer + 1) % room.playersOrder.length;

        while (!room.playersOrder[room.activePlayer].canPaint) {
          room.activePlayer =
            (room.activePlayer + 1) % room.playersOrder.length;
        }

        console.log("emit roomupdate from nextPlayer");
        io.to(room.code).emit(
          "roomUpdate",
          room.state,
          room.players[0],
          room.playersOrder[room.activePlayer].id
        );
      }
    }
  });

  socket.on("sendDrawing", (data) => {
    const room = activeRooms.find((r) => r.code === data.room.code);
    if (!room) {
      return;
    }

    if (room.state == states.STARTED) {
      const activePlayer = room.playersOrder[room.activePlayer];
      if (activePlayer.id === data.socketId) {
        io.to(room.code).emit("draw", data.coords, data.color, data.width);
      }
    }
  });

  socket.on("sendGuess", (data) => {
    const room = activeRooms.find((r) => r.code === data.room.code);
    if (!room) {
      return;
    }

    if (room.state == states.STARTED) {
      const reg = /[^a-zA-Z\d:]/g;
      const pGuess = ("" + data.guess).toLowerCase().replaceAll(reg, "");
      const pTheme = room.paintersTheme.toLowerCase().replaceAll(reg, "");
      const sTheme = room.scammersTheme.toLowerCase().replaceAll(reg, "");
      if (pGuess == pTheme) {
        //handle painters/buyer win
        room.state = states.FINISHED;
        clearInterval(room.interval);
        room.endDate = new Date().getTime();

        room.players.forEach((p) => {
          if (p.role === "buyer" || p.role === "painter") {
            p.score += 1;
          }
        });

        io.to(room.code).emit("roomEnd", room, "painters");
      }

      if (pGuess == sTheme) {
        //handle scammers win
        room.state = states.FINISHED;
        clearInterval(room.interval);
        room.endDate = new Date().getTime();
        room.players.forEach((p) => {
          if (p.role === "scammer") {
            p.score += 1;
          }
        });

        io.to(room.code).emit("roomEnd", room, "scammers");
      }
    }
  });

  socket.on("ban", (data) => {
    const room = activeRooms.find((r) => r.code === data.room.code);
    if (room) {
      if (room.state == states.STARTED) {
        const buyer = room.players[0];
        console.log("buyerid", buyer.id);
        console.log("socket", data.socketId);
        if (buyer.id === data.socketId) {
          const bannedPlayer = room.players.find(
            (p) => p.id === data.playerToBan
          );
          if (bannedPlayer) {
            bannedPlayer.canPaint = false;
            io.to(room.code).emit("banned", bannedPlayer.id);
          }
        }
      }
    }
  });

  socket.once("disconnect", function () {
    console.log("DECONNEXION DE ", socket.id);
    const playerRoom = activeRooms.find((r) =>
      r.players.find((p) => {
        return p.id === socket.id;
      })
    );

    if (playerRoom) {
      const i = playerRoom.players.findIndex((p) => p.id === socket.id);
      const oldId = playerRoom.players[i].id;
      console.log("Deconnexion de " + playerRoom.players[i].username);
      playerRoom.players.splice(i, 1);

      if (playerRoom.players.length <= 0) {
        activeRooms.splice(activeRooms.indexOf(playerRoom), 1);
      } else {
        if (oldId === playerRoom.admin_id) {
          playerRoom.admin_id = playerRoom.players[0].id;
        }
        io.to(playerRoom.code).emit(
          "playerDisconnection",
          socket.id,
          playerRoom.admin_id
        );
      }
    }
  });
});

server.listen(port, () => {
  console.log(`server running at http://localhost:${port}`);
});

const DEBUG = false;
if (DEBUG) {
  setInterval(() => {
    for (let aR of activeRooms) {
      console.log("- " + aR.code);
      for (let p of aR.players) {
        console.log("\t" + p.username + p.id);
      }
    }
  }, 3000);
}
