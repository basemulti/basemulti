'use server';

import { Webhook } from "@/database";
import SchemaServer from "@/lib/schema-server";
import { getCurrentUser } from "@/lib/server";
import { WebhookType } from "@/lib/types";
import { denies, sleep } from "@/lib/utils";
import axios from "axios";
import { revalidatePath } from "next/cache";

export default async function createWebhook({
  baseId,
  tableName,
  label,
  method,
  endpoint,
  type,
}: {
  baseId: string;
  tableName: string;
  label: string;
  method: string;
  endpoint: string;
  type: WebhookType;
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser();
  const schema = await SchemaServer.load(baseId);
  if (!schema) {
    return {
      error: "Base not found",
    };
  }

  if (denies(schema.getRole(), 'webhook:create')) {
    return {
      error: "You don't have permission to create a webhook",
    };
  }

  if (!schema.hasTable(tableName)) {
    return {
      error: "Table not found",
    };
  }

  const webhook = new Webhook;
  webhook.base_id = baseId;
  webhook.table_name = tableName;
  webhook.label = label;
  webhook.method = method;
  webhook.endpoint = endpoint;
  webhook.type = type;
  await webhook.save();

  options?.originalPath && revalidatePath(options.originalPath);

  return {};
}

export async function touchWebhook({
  baseId,
  tableName,
  webhookId,
  params,
}: {
  baseId: string;
  tableName: string;
  webhookId: string;
  params: any;
}) {
  const user = await getCurrentUser();
  const schema = await SchemaServer.load(baseId);
  if (!schema) {
    return {
      error: "Base not found",
    };
  }

  if (denies(schema.getRole(), 'webhook:touch')) {
    return {
      error: "You don't have permission to touch a webhook",
    };
  }

  await schema.loadWebhooks(['action', 'bulk-action']);
  const records = await schema.relationQuery(tableName).find(params.recordIds as string[]);

  try {
    const response = await schema.touchWebhook(tableName, webhookId, records.toData());
    return {};
  } catch (error: any) {
    return {
      error: error.message,
    };
  }
}

export async function updateWebhook({
  baseId,
  webhookId,
  label,
  method,
  endpoint,
  type,
  active,
}: {
  baseId: string;
  webhookId: string;
  label?: string;
  method?: string;
  endpoint?: string;
  type?: WebhookType;
  active?: boolean;
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser();
  const schema = await SchemaServer.load(baseId);
  if (!schema) {
    return {
      error: "Base not found",
    };
  }

  if (denies(schema.getRole(), 'webhook:update')) {
    return {
      error: "You don't have permission to update a webhook",
    };
  }

  const webhook = await Webhook.query().find(webhookId);
  if (!webhook) {
    return {
      error: "Webhook not found",
    };
  }

  if (label !== undefined) {
    webhook.label = label;
  }

  if (method !== undefined) {
    webhook.method = method;
  }

  if (endpoint !== undefined) {
    webhook.endpoint = endpoint;
  }

  if (type !== undefined) {
    webhook.type = type;
  }

  if (active !== undefined) {
    webhook.active = active;
  }

  await webhook.save();
  options?.originalPath && revalidatePath(options.originalPath);

  return {};
}

export async function deleteWebhook({
  baseId,
  webhookId,
}: {
  baseId: string;
  webhookId: string;
}, options?: {
  originalPath?: string;
}) {
  const user = await getCurrentUser();
  const schema = await SchemaServer.load(baseId);
  if (!schema) {
    return {
      error: "Base not found",
    };
  }

  if (denies(schema.getRole(), 'webhook:delete')) {
    return {
      error: "You don't have permission to delete a webhook",
    };
  }

  await Webhook.query().where({
    id: webhookId
  }).delete();

  options?.originalPath && revalidatePath(options.originalPath);

  return {};
}