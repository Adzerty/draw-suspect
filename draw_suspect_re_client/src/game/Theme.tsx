export default function Theme({
  role,
  paintersTheme,
  scammersTheme,
}: Readonly<{ role: string; paintersTheme: string; scammersTheme: string }>) {
  if (role === "painter") {
    return (
      <p className="mb-3">
        Vous devez faire deviner le mot suivant :{" "}
        <strong className="has-text-green">{paintersTheme}</strong>
      </p>
    );
  } else {
    return (
      <p className="mb-3">
        Les peintres doivent faire deviner le mot :{" "}
        <strong className="has-text-red">{paintersTheme}</strong>.<br />
        En tant qu'arnaqueur vous devez faire deviner le mot :{" "}
        <strong className="has-text-green">{scammersTheme}</strong>
      </p>
    );
  }
}
