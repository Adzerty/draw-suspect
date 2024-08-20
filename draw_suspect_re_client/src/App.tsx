import "./App.css";
import Connection from "./front/Connection";
import Rules from "./front/Rules";
import React, { useState, useEffect, useCallback } from "react";
import { socket } from "./socket";
import RoomLobby from "./game/RoomLobby";
import { Room, RoomSettings, RoomState } from "./libs/room";
import { Player } from "./libs/player";

function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [room, setRoom] = useState<Room | undefined>(undefined);
  const [winnerTeam, setWinnerTeam] = useState<string | undefined>(undefined);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [canPaint, setCanPaint] = useState<boolean>(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const updateSeconds = (sec: number) => {
      setSeconds(sec);
    };

    const onPlayerRoleUpdate = (
      role: string,
      paintersTheme: string,
      scammersTheme: string
    ) => {
      if (!room) return;
      setRole(role);
      setRoom((oldRoom: any) => {
        return {
          ...oldRoom,
          paintersTheme: paintersTheme,
          scammersTheme: scammersTheme,
        };
      });
    };

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onPlayerConnect = (user: Player) => {
      if (!room) return;
      const oldRoom = { ...room };
      if (oldRoom.players.indexOf(user) === -1) oldRoom.players.push(user);
      setRoom(oldRoom);
    };

    const onPlayerDisconnect = (id: string, newAdmin: string) => {
      if (!room) return;
      const oldRoom = { ...room };
      const i = oldRoom.players.findIndex((p) => p.id === id);
      if (i >= 0) {
        oldRoom.players.splice(i, 1);
        oldRoom.admin_id = newAdmin;
        setRoom(oldRoom);
      }
    };
    const onRoomSettingsUpdate = (settings: RoomSettings) => {
      if (!room) return;
      const oldRoom = { ...room };
      oldRoom.settings = settings;
      setRoom(oldRoom);
    };

    const onRoomUpdate = (
      state: RoomState,
      buyer: Player,
      activePlayer: string
    ) => {
      if (!room) {
        return;
      }
      const oldRoom = { ...room };
      oldRoom.state = state;
      oldRoom.players = oldRoom.players.map((p) => {
        return p.id === buyer.id ? buyer : p;
      });
      oldRoom.activePlayer = activePlayer;
      setRoom({ ...oldRoom });
    };

    const onPlayerList = (pList: Player[]) => {
      if (!room) return;
      setRoom((_room: any) => {
        return { ..._room, players: pList };
      });
    };

    const onRoomEnd = (newRoom: Room, winnerTeam: string) => {
      if (!room) return;
      setRoom(newRoom);
      setWinnerTeam(winnerTeam);
    };

    const onBanned = (bannedPlayerId: string) => {
      if (!room) return;
      const playerToBan = room.players.find((p) => p.id === bannedPlayerId);
      if (playerToBan) {
        playerToBan.canPaint = false;
        if (playerToBan.id === socket.id) {
          setCanPaint(false);
        }
      }
      setRoom({ ...room });
    };

    //events handling
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("playerDisconnection", onPlayerDisconnect);
    socket.on("playerConnection", onPlayerConnect);
    socket.on("roomSettingsUpdate", onRoomSettingsUpdate);
    socket.on("roomUpdate", onRoomUpdate);
    socket.on("playerList", onPlayerList);
    socket.on("roomEnd", onRoomEnd);
    socket.on("banned", onBanned);
    socket.on("playerRoleUpdate", onPlayerRoleUpdate);
    socket.on("tick", updateSeconds);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("playerDisconnection");
      socket.off("playerConnection");
      socket.off("roomSettingsUpdate");
      socket.off("roomUpdate");
      socket.off("playerList");
      socket.off("roomEnd");
      socket.off("banned");
      socket.off("playerRoleUpdate");
      socket.off("tick");
    };
  }, [room]);

  return (
    <>
      {!room ? (
        <>
          <Connection socket={socket} setRoom={setRoom} />
          <Rules />
        </>
      ) : (
        <RoomLobby
          room={room}
          winnerTeam={winnerTeam}
          role={role}
          socket={socket}
          canPaint={canPaint}
          seconds={seconds}
        />
      )}
    </>
  );
}

export default App;
