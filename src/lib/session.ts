import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { appString } from "./utils";

export const sessionOptions: SessionOptions = {
  password: process.env.BASEMULTI_KEY as string,
  cookieName: appString("cookie"),
  cookieOptions: {
    httpOnly: true,
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === "production",
  },
};

type SessionData = {
  id: string;
  isLoggedIn: boolean;
}

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
    session.id = '';
  }

  return session;
}