import "./room-lobby.css";
import { Room } from "../libs/room";
import LobbyPlayerList, {
  EndingPlayerList,
  GamePlayerList,
} from "./PlayerList";
import SettingsPanel from "./SettingsPanel";
import { Socket } from "socket.io-client";
import { useCallback, useEffect, useState } from "react";
import RoleDisplay from "./Role";
import Canva from "./Canva";
import Theme from "./Theme";

const MAX_INK = 500;
const COLORS = [
  { name: "black", code: "#160f29" },
  { name: "red", code: "#b33951" },
  { name: "green", code: "#4f9d69" },
  { name: "blue", code: "#1446a0" },
  { name: "orange", code: "#ffb140" },
  { name: "purple", code: "#5d2e8c" },
  { name: "brown", code: "#6c4037" },
];
const WIDTHS = [2, 5, 10];

export default function RoomLobby({
  room,
  role,
  socket,
  winnerTeam,
  canPaint,
  seconds,
}: {
  room: Room;
  role: string | undefined;
  socket: Socket;
  winnerTeam: string | undefined;
  canPaint: boolean;
  seconds: number;
}) {
  const isAdmin = socket.id === room.admin_id;

  const [isActive, setActive] = useState(false);
  const [ink, setInk] = useState(MAX_INK);
  const [guess, setGuess] = useState("");
  const [color, setColor] = useState(COLORS[0].code);
  const [width, setWidth] = useState(2);

  const handleGuessChange = useCallback(
    (e: any) => {
      e.preventDefault();
      setGuess(e.target.value);
    },
    [setGuess]
  );

  const sendGuess = useCallback(() => {
    socket.emit("sendGuess", { room, socketId: socket.id, guess });
  }, [room, socket, guess]);

  const next = useCallback(() => {
    if (!isActive) {
      return;
    }
    socket.emit("nextPlayer", { room, socketId: socket.id });
    setInk(MAX_INK);
  }, [isActive, room, socket]);

  const sendDrawing = useCallback(
    (coords: any[]) => {
      if (!isActive) {
        return;
      }
      socket.emit("sendDrawing", {
        room,
        socketId: socket.id,
        coords,
        color,
        width,
      });
    },
    [isActive, room, socket, color, width]
  );

  useEffect(() => {
    if (room.activePlayer) {
      setActive(socket.id === room.activePlayer);
    }
  }, [room.activePlayer]);

  const startGame = useCallback(() => {
    socket.emit("startGame", { room });
  }, []);

  const reloadGame = useCallback(() => {
    socket.emit("reloadGame", { room });
  }, []);

  const leaveGame = useCallback(() => {
    socket.disconnect();
    window.location.reload();
  }, []);

  const ban = useCallback(
    (playerToBan: string) => {
      if (role !== "buyer") {
        return;
      }
      socket.emit("ban", { room, socketId: socket.id, playerToBan });
    },
    [role]
  );

  if (room.state === "waiting") {
    return (
      <section className="container" id="home">
        <h1>Lobby {room.code}</h1>

        <div className="room-lobby-container">
          <SettingsPanel
            playersAmount={room.players.length}
            isAdmin={isAdmin}
            socket={socket}
            settings={room.settings}
            code={room.code}
            start={startGame}
            leave={leaveGame}
          />
          <LobbyPlayerList players={room.players} admin_id={room.admin_id} />
        </div>
      </section>
    );
  }

  if (room.state === "started" && role) {
    return (
      <section className="container mt-5" id="game">
        <div className="room-lobby-container">
          <div>
            <RoleDisplay role={role} isActive={isActive} />
            {(role === "painter" || role === "scammer") && (
              <div id="theme-banner">
                <Theme
                  role={role}
                  paintersTheme={room.paintersTheme}
                  scammersTheme={room.scammersTheme}
                />
                {isActive && (
                  <div id="ink-drop">
                    <img src="/ink.svg" width="130px" alt="Courone d'admin" />
                    <p className="has-text-green">{ink / 5}%</p>
                  </div>
                )}
              </div>
            )}
            <Canva
              sendDrawing={sendDrawing}
              socket={socket}
              isActive={isActive}
              canPaint={canPaint}
              ink={ink}
              setInk={
                room.players.reduce((acc, curr) => {
                  return curr.canPaint ? acc + 1 : acc;
                }, 0) > 1
                  ? setInk
                  : () => {}
              }
              color={color}
              width={width}
            />
            {role !== "buyer" && (
              <div id="game-color-panel">
                {COLORS.map((_c) => {
                  return (
                    <div
                      id={_c.name}
                      className={_c.code === color ? "selected" : ""}
                      onClick={() => {
                        setColor(_c.code);
                      }}
                    ></div>
                  );
                })}
                {WIDTHS.map((_w) => {
                  return (
                    <div
                      id={"width-" + _w}
                      className={_w === width ? "selected" : ""}
                      onClick={() => {
                        setWidth(_w);
                      }}
                    >
                      <span>.</span>
                    </div>
                  );
                })}
              </div>
            )}
            {role === "buyer" && (
              <div>
                <input
                  type="text"
                  id="guess-input"
                  value={guess}
                  onChange={handleGuessChange}
                />
                <button
                  className="button has"
                  type="button"
                  id="guess-button"
                  onClick={sendGuess}
                >
                  Valider
                </button>
              </div>
            )}
          </div>
          <div id="game-side-panel">
            <h4>
              {parseInt("" + seconds / 60)
                .toString()
                .padStart(2, "0")}
              :{(seconds % 60).toString().padStart(2, "0")}
            </h4>
            <GamePlayerList
              players={room.players}
              isBuyer={role === "buyer"}
              playerId={socket.id}
              buyer={room.players.find((p) => p.role === "buyer")}
              activePlayer={room.activePlayer}
              ban={ban}
            />
            {isActive && (
              <button className="button mt-2" onClick={next}>
                Suivant
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container" id="home">
      <h1>Partie terminée</h1>
      <div id="final-list">
        <div>
          <div className="role is-green">
            <p>
              Le thème des peintres était{" "}
              <strong className="has-text-light-blue">
                {room.paintersTheme}
              </strong>
            </p>
          </div>
          <br />
          <div className="role is-red">
            <p>
              Le thème des arnaqueurs était{" "}
              <strong className="has-text-light-blue">
                {room.scammersTheme}
              </strong>
            </p>
          </div>
          <br />
          <div className="role is-orange">
            <p>
              Les vainqueurs de la partie sont{" "}
              <strong className="has-text-light-blue">
                {winnerTeam === "scammers"
                  ? "les arnaqueurs "
                  : "l'acheteur et les peintres "}
              </strong>
              et ont mis {parseInt("" + (room.endDate - room.startDate) / 1000)}{" "}
              secondes à gagner
            </p>
          </div>
        </div>
        <EndingPlayerList players={room.players} admin_id={room.admin_id} />
      </div>

      <div>
        <button
          className="button mt-5  is-danger"
          onClick={() => {
            window.location.reload();
          }}
        >
          Retour
        </button>
        <button
          className="button mt-5 ml-5 is-primary"
          disabled={!isAdmin}
          onClick={reloadGame}
        >
          Rejouer
        </button>
      </div>
    </section>
  );
}
