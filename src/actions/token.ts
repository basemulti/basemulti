'use server'

import { getCurrentUser } from "@/lib/server";
import { redirect } from "next/navigation";

export async function getTokens() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const tokens = await user.related('tokens').get();
  return tokens.makeVisible(['id', 'token', 'name']).toData();
}

export async function createToken({
  name,
}: {
  name: string
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }
  
  const token = await user.createToken(name);
  return {
    id: token.accessToken.id,
    name: name,
    token: token.plainTextToken
  };
}

export async function deleteToken({ id }: { id: string }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  await user.related('tokens').where({
    id
  }).delete();

  return {};
}