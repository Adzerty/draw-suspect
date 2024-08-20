function getRoleInfoByName(role: string) {
  if (role === "buyer") return { name: "Acheteur", color: "green" };
  if (role === "painter") return { name: "Peintre", color: "orange" };
  if (role === "scammer") return { name: "Arnaqueur", color: "red" };
  return { name: "inconnu", color: "unknown" };
}

export default function RoleDisplay({
  role,
  isActive,
}: Readonly<{ role: string; isActive: boolean }>) {
  const roleInfo = getRoleInfoByName(role);
  return (
    <h2>
      Vous êtes un{" "}
      <span className={"has-text-" + roleInfo.color}>{roleInfo.name}</span>
      {isActive && " & c'est à vous de jouer"}
    </h2>
  );
}
