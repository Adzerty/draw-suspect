/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { RoomSettings } from "../libs/room";

export function SettingsButton({
  label,
  amount,
  setAmount,
  color,
}: {
  label: string;
  amount: number;
  setAmount?: any;
  color: string;
}) {
  const handleClick = useCallback(
    (offset: number) => {
      if (offset < 0 && amount >= 2) {
        setAmount(amount + offset);
      }

      if (offset > 0) {
        setAmount(amount + offset);
      }
    },
    [amount, setAmount]
  );

  return (
    <div className={"settings-button mb-5 has-text-light-blue is-" + color}>
      {setAmount && (
        <button
          className="button"
          onClick={() => {
            handleClick(-1);
          }}
        >
          {" "}
          -{" "}
        </button>
      )}
      <h4>
        {amount} {label + (amount > 1 ? "s" : "")}
      </h4>
      {setAmount && (
        <button
          className="button"
          onClick={() => {
            handleClick(1);
          }}
        >
          {" "}
          +{" "}
        </button>
      )}
    </div>
  );
}
export default function SettingsPanel({
  playersAmount,
  isAdmin,
  socket,
  settings,
  code,
  start,
  leave,
}: {
  playersAmount: number;
  isAdmin: boolean;
  socket: Socket;
  settings: RoomSettings;
  code: string;
  start: any;
  leave: any;
}) {
  const [painters, setPainters] = useState(settings.painters);
  const [scammers, setScammers] = useState(settings.scammers);

  const [canStart, setCanStart] = useState(false);
  useEffect(() => {
    if (isAdmin) {
      setCanStart(painters + scammers + 1 === playersAmount);
    }
  }, [setCanStart, painters, scammers, playersAmount]);

  useEffect(() => {
    if (isAdmin && painters !== settings.painters) {
      socket.emit("setRoomSettings", { painters }, code);
    }
  }, [painters]);

  useEffect(() => {
    if (isAdmin && scammers !== settings.scammers) {
      socket.emit("setRoomSettings", { scammers }, code);
    }
  }, [scammers]);

  useEffect(() => {
    if (settings.painters !== painters) {
      setPainters(settings.painters);
    }

    if (settings.scammers !== scammers) {
      setScammers(settings.scammers);
    }
  }, [settings]);
  return (
    <div className="settings-container ">
      <h2 className="mt-1 ml-3">Paramètres</h2>
      <SettingsButton label="Acheteur" amount={1} color="green" />
      <SettingsButton
        label="Peintre"
        amount={painters}
        color="orange"
        setAmount={isAdmin ? setPainters : undefined}
      />
      <SettingsButton
        label="Arnaqueur"
        amount={scammers}
        color="red"
        setAmount={isAdmin ? setScammers : undefined}
      />
      <div>
        <button
          className="button is-primary mb-2"
          disabled={!canStart || !isAdmin}
          onClick={start}
        >
          DEMARRER
        </button>
        <button className="button is-danger mb-2 ml-5" onClick={leave}>
          QUITTER
        </button>
      </div>
    </div>
  );
}
