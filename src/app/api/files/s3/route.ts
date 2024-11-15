import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_AK,
  secretAccessKey: process.env.AWS_SK,
});

const getUploadURL = async (type: string, name: string) => {
  const file = parseInt(String(Math.random() * 10000000));
  const params = {
    Bucket: 'tg-games.com',
    Key: 'static/' + name,
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
