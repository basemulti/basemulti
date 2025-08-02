import { Hono } from 'hono';
import { isAdmin } from '@/lib/server';
import Setting from '@/database/models/setting';
import { z } from 'zod';

const settings = new Hono();

settings.get('/', async (c) => {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return c.json({
      message: 'Unauthorized'
    }, 401);
  }

  const settings = await Setting.query().first();
  return c.json(settings);
});

const updateSettingsBody = z.object({
  allow_registration: z.boolean().optional(),
  allow_create_workspace: z.boolean().optional(),
  storage_driver: z.string().optional(),
  storage_s3_config: z.object({
    endpoint: z.string(),
    region: z.string(),
    bucket: z.string(),
    accessKeyId: z.string(),
    secretAccessKey: z.string(),
    storage_prefix: z.string(),
  }).optional(),
  storage_webhook_config: z.object({
    url: z.string(),
    method: z.string(),
    headers: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    ),
    timeout: z.number(),
    retries: z.number(),
  }).optional(),
});

type UpdateSettingsBody = z.infer<typeof updateSettingsBody>;

settings.put('/', async (c) => {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    return c.json({
      message: 'Unauthorized'
    }, 401);
  }

  const data = await c.req.json();
  const settings = await Setting.query().firstOrFail();

  for (let key in data) {
    settings.setAttribute(key, data[key]);
  }

  await settings.save();
  return c.json(settings);
});

export default settings;