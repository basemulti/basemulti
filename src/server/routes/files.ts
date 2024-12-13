import { Hono } from 'hono';
import path from 'path';
import fs from "fs";
import AWS from 'aws-sdk';
import { env } from 'hono/adapter';

const files = new Hono();
const UPLOAD_DIR = path.resolve(process.env.ROOT_PATH ?? "", "public/storage");

// local
files.post('/storage', async (c) => {
  const file = (await c.req.formData()).get('file') as Blob;

  if (file) {
    const buffer = Buffer.from(await file.arrayBuffer());
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR);
    }

    fs.writeFileSync(
      path.resolve(UPLOAD_DIR, file.name),
      buffer as any
    );
  } else {
    return c.json({
      success: false,
    });
  }

  return c.json({
    success: true,
    name: file.name,
  });
});

// s3
files.post('/s3', async (c) => {
  const { AWS_ENDPOINT, AWS_REGION, AWS_AK, AWS_SK, AWS_BUCKET, AWS_DIRECTORY } = env<{
    AWS_ENDPOINT: string;
    AWS_REGION: string;
    AWS_AK: string;
    AWS_SK: string;
    AWS_BUCKET: string;
    AWS_DIRECTORY: string;
  }>(c);
  
  const s3 = new AWS.S3({
    endpoint: AWS_ENDPOINT,
    region: AWS_REGION || 'us-east-1',
    accessKeyId: AWS_AK,
    secretAccessKey: AWS_SK,
  });
  
  const getUploadURL = async (type: string, name: string) => {
    const file = parseInt(String(Math.random() * 10000000));
    const params = {
      Bucket: AWS_BUCKET,
      Key: AWS_DIRECTORY ? AWS_DIRECTORY + '/' + name : name,
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