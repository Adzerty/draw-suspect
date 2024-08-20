import { Player } from "../libs/player";

function PlayerListElement({
  player,
  isAdmin,
  showAdmin,
  ban,
  isPlaying,
}: {
  player: Player;
  isAdmin: boolean;
  showAdmin?: boolean;
  ban?: any;
  isPlaying?: boolean;
}) {
  return (
    <li
      className={
        "player-list-element mb-1 " +
        (player.canPaint ? "is-light-blue" : "is-red")
      }
      key={"key-" + player.username.toLowerCase()}
    >
      <p>{player.username}</p>
      <p>{player.score} pts</p>
      {isPlaying && (
        <img
          className="icon is-pulled-right"
          src="/brush.svg"
          alt="Courone d'admin"
        />
      )}
      {showAdmin &&
        (isAdmin ? (
          <img
            className="icon is-pulled-right"
            src="/crown.svg"
            alt="Courone d'admin"
          />
        ) : (
          <img
            className="icon is-pulled-right"
            src="/brush.svg"
            alt="Courone d'admin"
          />
        ))}
      {player.canPaint && ban && (
        <button className="button" onClick={ban}>
          <img
            className="icon is-pulled-right"
            src="/fired.svg"
            alt="Icon de ban"
          />
        </button>
      )}
    </li>
  );
}
export function GamePlayerList({
  players,
  isBuyer,
  playerId,
  buyer,
  activePlayer,
  ban,
}: {
  players: Player[];
  isBuyer: boolean;
  playerId: string;
  buyer: Player;
  activePlayer: string;
  ban: any;
}) {
  //Async socket event handling
  if (!buyer) {
    return <></>;
  }

  return (
    <div className="is-green player-list-container">
      <ul className="player-list">
        <h4>Acheteur</h4>
        {buyer && (
          <PlayerListElement
            key={"key-ple-" + buyer.id}
            player={buyer}
            isAdmin={false}
            isPlaying={false}
          />
        )}
        <h4>Peintres</h4>
        {players
          .filter((p) => p.id !== buyer.id)
          .map((player, i) => {
            return (
              <PlayerListElement
                key={"key-ple-" + player.id}
                player={player}
                isAdmin={false}
                ban={
                  isBuyer &&
                  player.id !== playerId &&
                  players.reduce((acc, curr) => {
                    return curr.canPaint ? acc + 1 : acc;
                  }, 0) > 1
                    ? () => {
                        ban(player.id);
                      }
                    : undefined
                }
                isPlaying={player.id === activePlayer}
              />
            );
          })}
      </ul>
    </div>
  );
}

export function EndingPlayerList({
  players,
  admin_id,
}: {
  players: Player[];
  admin_id: string;
}) {
  return (
    <div className="is-green player-list-container">
      <ul className="player-list">
        <h4>Acheteur</h4>
        {players
          .filter((p) => p.role === "buyer")
          .map((player, i) => {
            return (
              <PlayerListElement
                key={"key-ple-" + player.id}
                player={player}
                isAdmin={player.id === admin_id}
              />
            );
          })}
        <h4>
          Peintre
          {players.reduce((acc, curr) => {
            return curr.role === "painter" ? acc + 1 : acc;
          }, 0) > 1
            ? "s"
            : ""}
        </h4>
        {players
          .filter((p) => p.role === "painter")
          .map((player, i) => {
            return (
              <PlayerListElement
                key={"key-ple-" + player.id}
                player={player}
                isAdmin={player.id === admin_id}
              />
            );
          })}
        <h4>
          Arnaqueur
          {players.reduce((acc, curr) => {
            return curr.role === "scammer" ? acc + 1 : acc;
          }, 0) > 1
            ? "s"
            : ""}
        </h4>
        {players
          .filter((p) => p.role === "scammer")
          .map((player, i) => {
            return (
              <PlayerListElement
                key={"key-ple-" + player.id}
                player={player}
                isAdmin={player.id === admin_id}
              />
            );
          })}
      </ul>
    </div>
  );
}

export default function LobbyPlayerList({
  players,
  admin_id,
}: {
  players: Player[];
  admin_id: string;
}) {
  return (
    <div className="is-green player-list-container">
      <ul className="player-list">
        <h4>Joueurs</h4>
        {players.map((player) => {
          return (
            <PlayerListElement
              key={"key-ple-" + player.id}
              player={player}
              isAdmin={player.id === admin_id}
            />
          );
        })}
      </ul>
    </div>
  );
}
