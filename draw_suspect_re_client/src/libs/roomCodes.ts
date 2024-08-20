export function generateRoomCode() {
  const list = "ABCDEFGHJKLMNPRSTUVWXYZ23456789";
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += list.charAt(Math.floor(Math.random() * list.length));
  }
  return res;
}

export function isCodeValid(code: string) {
  if (code.length > 6) return false;
  const list = "ABCDEFGHJKLMNPRSTUVWXYZ23456789";
  for (let c of code) {
    if (!list.includes(c)) return false;
  }
  return true;
}

export function isCodeComplete(code: string) {
  if (!isCodeValid(code)) return false;
  if (code.length === 6) return true;
  return false;
}
