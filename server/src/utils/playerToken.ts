import jwt from "jsonwebtoken";

export interface PlayerTokenInfo {
    roomName: string;
    playerName: string;
}

export function buildToken(info: PlayerTokenInfo): string {
    const secret = process.env.JWT_SECRET;
    if (typeof secret !== "string")
        throw new Error("Could not find a secret to sign a jwt.");

    const resp = jwt.sign(
        info,
        secret,
        { noTimestamp: true }
    );
    return resp;
}

export function verifyDecodeToken(token: string): PlayerTokenInfo {
    const secret = process.env.JWT_SECRET;
    if (typeof secret !== "string")
        throw new Error("Could not find a secret to verify/decode a jwt.");

    const decoded = jwt.verify(token, secret) as PlayerTokenInfo;
    return decoded;
}
