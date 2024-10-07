"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

interface PreviewProps {
  value: string;
}


const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export const Preview = ({ value }: PreviewProps) => {
  return (
    <div className="bg-white">
      <ReactQuill
        theme="bubble"
        value={value}
        readOnly
        modules={{ toolbar: false }}
      />
    </div>
  );
};

export default Preview;
