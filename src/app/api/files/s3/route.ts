import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';
import { env } from '@/lib/env';

const s3 = new AWS.S3({
  endpoint: env.AWS_ENDPOINT,
  region: env.AWS_REGION || 'us-east-1',
  accessKeyId: env.AWS_AK,
  secretAccessKey: env.AWS_SK,
});

const getUploadURL = async (type: string, name: string) => {
  const file = parseInt(String(Math.random() * 10000000));
  const params = {
    Bucket: env.AWS_BUCKET,
    Key: env.AWS_DIRECTORY ? env.AWS_DIRECTORY + '/' + name : name,
    ContentType: type,
  };
  
  let signed = await s3.getSignedUrl('putObject', params);

  return { signed, file: name };
};

export async function GET(
  req: Request,
  { params }: any
) {
  const { searchParams } = new URL(req.url);
  let type = searchParams.get('type') as string;
  let name = searchParams.get('name') as string;

  const { signed, file } = await getUploadURL(type, name);

  return NextResponse.json({
    upload_url: signed,
    filename: file
  });
}
