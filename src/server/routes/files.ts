import { Hono } from 'hono';
import path from 'path';
import fs from "fs";
import AWS from 'aws-sdk';
import { env } from 'hono/adapter';
import { getCurrentUser, getSettings } from '@/lib/server';
import { S3Client, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { User } from '@/database';
import axios from 'axios';

type UserVariables = { user: User };

const files = new Hono<{ Variables: UserVariables }>();
const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/storage");

files.use('/storage/*', async (c, next) => {
  let user = await getCurrentUser();

  if (!user) {
    const token = c.req.header('x-bm-token');
    if (token) {
      user = await User.findAuth(token);
    }
  }

  if (!user) {
    return c.json({
      message: 'Unauthorized'
    }, 401);
  }

  c.set('user', user);
  await next();
});

// local
files.post('/storage', async (c) => {
  const file = (await c.req.formData()).get('file') as Blob;
  const settings = await getSettings();

  try {
    if (file) {
      if (settings.storage_driver === 'local') {
        const buffer = Buffer.from(await file.arrayBuffer());
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR);
        }
    
        fs.writeFileSync(
          path.resolve(UPLOAD_DIR, file.name),
          buffer as any
        );

        return c.json({
          success: true,
          name: file.name,
        });
      } else if (settings.storage_driver === 's3') {
        const s3 = new S3Client({
          region: settings.storage_s3_config.region || undefined,
          endpoint: settings.storage_s3_config.endpoint,
          credentials: {
            accessKeyId: settings.storage_s3_config.access_key,
            secretAccessKey: settings.storage_s3_config.secret_key,
          },
        });

        const buffer = Buffer.from(await file.arrayBuffer());
        const command = new PutObjectCommand({
          Bucket: settings.storage_s3_config.bucket,
          Key: file.name,
          Body: buffer,
        });
        await s3.send(command);

        return c.json({
          success: true,
          name: `${settings.storage_s3_config.storage_prefix}/${file.name}`,
        });
      } else if (settings.storage_driver === 'webhook') {
        const { url, headers } = settings.storage_webhook_config;
        const formData = new FormData();
        formData.append('file', file);

        const response = await axios({
          method: 'POST',
          url,
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data'
          },
          data: formData
        });

        return c.json({
          success: true,
          name: response.data.name || file.name,
          ...response.data
        });
      }
    } else {
      return c.json({
        success: false,
      });
    }
  } catch (e) {
    console.log('xxxxxxxxxxxx', e);
    return c.json({
      success: false,
      error: (e as Error).message,
    });
  }
});

// s3
files.post('/s3', async (c) => {
  const settings = await getSettings();

  const s3 = new AWS.S3({
    endpoint: settings.storage_s3_config.endpoint,
    region: settings.storage_s3_config.region,
    accessKeyId: settings.storage_s3_config.access_key,
    secretAccessKey: settings.storage_s3_config.secret_key,
  });
  
  const getUploadURL = async (type: string, name: string) => {
    const file = parseInt(String(Math.random() * 10000000));
    const params = {
      Bucket: settings.storage_s3_config.bucket,
      Key: name,
      ContentType: type,
    };
    
    let signed = await s3.getSignedUrl('putObject', params);
  
    return { signed, file: name };
  };

  const { type, name } = c.req.query();
  const { signed, file: fileName } = await getUploadURL(type, name);

  return c.json({
    upload_url: signed,
    filename: fileName
  });
});

export default files;