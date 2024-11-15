'use client'

import axios from 'axios';
import Uploady, { useRequestPreSend, useItemProgressListener } from '@rpldy/uploady';
import UploadDropZone from "@rpldy/upload-drop-zone";
import UploadButton from '@rpldy/upload-button';
import { Check, CheckCircle2, FilePlusIcon, PlusIcon, X, XCircle } from "lucide-react";
import { Dialog, DialogImage, DialogOverlay, DialogPortal, DialogTrigger } from "@/components/ui/dialog";

// import './Upload.css';

const UploadProgress = () => {
  const progressData = useItemProgressListener() || { completed: 0 };
  const { completed } = progressData;

  return (<div className={completed === 0 ? 'invisible flex flex-row-reverse mb-2 h-25' : "flex flex-row-reverse mb-2 h-25"}>
    <div>{completed}%</div>
    <span className="px-2 py-2 text-sm text-gray-700">{completed === 100 ? "All done!" : "Uploading..."}</span>
  </div>);
};

const SignedUploadDragAndDrop = ({
  files, isMultiple, onChange, onDelete
}: {
  files: string[], isMultiple: boolean, onChange: Function | undefined, onDelete: Function | undefined
}) => {
  const progressData = useItemProgressListener() || { completed: 0 };
  const { completed } = progressData;

  const handleDelete = (index: number) => {
    onChange && onChange(files.filter((item: any) => item.index !== index));
  }

  useRequestPreSend(async ({ items, options }: any) => {
    const files = items.length > 0 ? items[0] : {};

    let { file } = files;
    let { name, type } = file;
    let gateway = '/api/files';
    
    const response = await axios(
      `${gateway}?` +
      new URLSearchParams({
        name,
        type,
      })
    );

    let { data } = response;
    let uploadUrl = data.upload_url;

    return {
      options: {
        sendWithFormData: false,
        destination: {
          url: uploadUrl,
          method: 'PUT',
          headers: {
            'Content-Type': type,
          },
        },
      },
    };
  });

  console.log('files', files);

  return (
    <div className="flex flex-row flex-wrap gap-2">
      {files.map((file, index) => (
        <div key={index} className="image-item bg-gray-100 rounded-lg group cursor-pointer relative text-transparent group">
          <Dialog>
            <DialogTrigger asChild>
              <img 
                src={file} 
                className="w-[50px] h-[50px] group-hover sticky object-cover rounded-md bg-fixed" 
                title={file} 
              />
            </DialogTrigger>
            <DialogImage>
              <img className="max-w-[425px]" src={file} />
            </DialogImage>
          </Dialog>
          <div className="ml-auto focus:outline-none absolute -right-[6px] -top-[6px] rounded-full bg-red-500 hidden group-hover:block" onClick={() => handleDelete(index)}>
            <X className="m-1 w-2 h-2 text-white" strokeWidth="3" />
          </div>
        </div>
      ))}
      {(isMultiple || files.length == 0) && <UploadDropZone
        className="w-[50px] h-[50px] rounded-lg text-gray-400 border border-gray-400 border-dashed flex flex-col items-center justify-center cursor-pointer text-xs font-"
        onDragOverClassName="drag-over"
      >
        {/* <PlusIcon className='text-gray-400 h-6 w-6' /> */}
        <span>78%</span>
      </UploadDropZone>}
    </div>
  );
};

export default function Upload({
  files,
  isMultiple = false,
  onChange,
  onDelete,
}: {
  files: string[],
  isMultiple?: boolean,
  onChange?: Function,
  onDelete?: Function,
}) {
  return (
    <div className="w-3/5 upload-container">
      <Uploady destination={{}}>
        <SignedUploadDragAndDrop
          files={files}
          isMultiple={isMultiple}
          onChange={onChange}
          onDelete={onDelete}
        />
      </Uploady>
    </div>
  );
}