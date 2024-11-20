'use server'

import { User, Workspace } from "@/database";
import bcrypt from "bcrypt";
import { getCurrentUser, getSession } from "@/lib/server";
import { redirect } from "next/navigation";

export async function signUp(email: string, password: string) {
  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  
  if (email && (
    (await User.query().where('email', email).count()) > 0
  )) {
    return { error: "This email is already in use." };
  }

  const user = new User;
  user.name = email.split('@')[0];
  user.email = email;
  user.password = await bcrypt.hash(password, 10);
  await user.save();

  const workspace = new Workspace;
  workspace.label = `${user.name}'s Workspace`;
  await workspace.save();

  await user?.related('workspaces').attach(workspace.id, {
    role: 'owner',
    collaboratorable_type: 'workspace'
  });

  return user.toData();
}

export async function login({
  email,
  password,
  callbackUrl = 'workspaces'
}: {
  email: string;
  password: string;
  callbackUrl?: string;
}) {
  try {
    if (!email || !password) {
      return { error: "Incorrect username or password." };
    }

    let user;
    user = await User.query()
      .where('email', email)
      .first();
  
    if (!user) {
      return { error: "Incorrect username or password." };
    }
  
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid) {
      return { error: "Incorrect username or password." };
    }
  
    const session = await getSession();
    session.id = user.id;
    session.isLoggedIn = true;
    await session.save();
  } catch (error) {
    return { error: "Please try again later." };
  }
  
  redirect(callbackUrl);
}

export async function logout() {
  const session = await getSession();
  session.destroy();

  redirect('/login');
}

export async function updateName({
  name
}: {
  name: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  user.name = name;
  await user.save();
}

export async function updatePassword({
  oldPassword,
  newPassword
}: {
  oldPassword: string;
  newPassword: string;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

  if (!isPasswordValid) {
    return { error: "Incorrect password." };
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return {};
}