import { Socket } from "socket.io-client";
import {
  generateRoomCode,
  isCodeComplete,
  isCodeValid,
} from "../libs/roomCodes";
import { useCallback, useState } from "react";

export default function Connection({
  socket,
  setRoom,
}: {
  socket: Socket;
  setRoom: any;
}) {
  const [roomCodeJoin, setRoomCodeJoin] = useState("");
  const [errorJoin, setErrorJoin] = useState("");
  const [processingJoin, setProcessingJoin] = useState(false);

  const [roomCodeCreate, setRoomCodeCreate] = useState(generateRoomCode());
  const [errorCreate, setErrorCreate] = useState("");
  const [processingCreate, setProcessingCreate] = useState(false);

  const [pseudo, setPseudo] = useState("");

  const handleRoomCodeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      const v = e.target.value.toUpperCase();
      if (isCodeValid(v)) {
        setRoomCodeJoin(v);
      }
    },
    [setRoomCodeJoin]
  );

  const handlePseudoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault();

      const v = e.target.value.toUpperCase();

      if (v.length <= 10) {
        setPseudo(v);
      }
    },
    [setPseudo]
  );

  const handleJoin = useCallback(() => {
    setErrorJoin("");
    setProcessingJoin(true);
    socket.emit("roomRequest", roomCodeJoin, { username: pseudo });

    socket.on("roomRequestResponse", (res) => {
      if (res === "none") {
        setErrorJoin("Aucun lobby n'existe avec ce code !");
        setProcessingJoin(false);
      } else if (res === "error") {
        setErrorJoin("Une erreur est survenue.");
        setProcessingJoin(false);
      } else {
        setRoom(res);
        setProcessingJoin(false);
      }
    });
  }, [socket, roomCodeJoin, setRoom, setProcessingJoin, pseudo]);

  const handleCreate = useCallback(() => {
    setErrorCreate("");
    setProcessingCreate(true);
    socket.emit("roomCreate", roomCodeCreate, { username: pseudo });

    socket.on("roomCreateResponse", (res) => {
      console.log("roomCreated");
      console.log(res);
      if (res.error) {
        setErrorCreate(res.error);
        setProcessingCreate(false);
      } else {
        setRoom(res);
        setProcessingCreate(false);
      }
    });
  }, [
    setErrorCreate,
    setProcessingCreate,
    roomCodeCreate,
    pseudo,
    setRoom,
    socket,
  ]);
  return (
    <section className="container" id="home">
      <img
        className="mt-2 mb-5"
        src="/Logo.png"
        alt="Logo de Draw Suspect"
        width={700}
      />

      <div className="party-container">
        <div id="join-party" className="is-green">
          <h4 className="mb-3 mt-1">Rejoindre via un code</h4>
          <p className="has-text-red">{errorJoin}</p>
          <input
            className="input is-larger is-light-blue mb-3"
            type="text"
            placeholder="PSEUDO"
            value={pseudo}
            onChange={handlePseudoChange}
          />
          <input
            className="input is-larger is-light-blue mb-3"
            type="text"
            placeholder="ABCDEF"
            value={roomCodeJoin}
            onChange={handleRoomCodeChange}
            maxLength={6}
          />
          <button
            className={
              "button is-light-blue mb-2 " +
              (processingJoin ? "is-loading" : "")
            }
            onClick={handleJoin}
            disabled={pseudo === "" || !isCodeComplete(roomCodeJoin)}
          >
            REJOINDRE
          </button>
        </div>
        <div id="create-party" className="is-orange">
          <h4 className="mb-3 mt-1">Créer une partie</h4>
          <p className="has-text-red">{errorCreate}</p>
          <input
            className="input is-larger is-light-blue mb-3"
            type="text"
            placeholder="PSEUDO"
            value={pseudo}
            onChange={handlePseudoChange}
          />
          <input
            className="input is-larger is-light-blue mb-3"
            type="text"
            disabled={true}
            value={roomCodeCreate}
            maxLength={6}
          />
          <button
            className={
              "button is-light-blue mb-2" +
              (processingCreate ? "is-loading" : "")
            }
            onClick={handleCreate}
            disabled={pseudo === "" || !isCodeComplete(roomCodeCreate)}
          >
            CREER
          </button>
        </div>
      </div>
      <a href="#rules">
        <h4 className="mt-5">Comment jouer ?</h4>
      </a>
    </section>
  );
}
