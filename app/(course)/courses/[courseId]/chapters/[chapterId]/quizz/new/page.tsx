"use client";

import { useParams } from "next/navigation";
import QuizzUploadDocument from "../_components/quizz-upload-document";

const NewQuizzUpload = () => {
  const params = useParams();
  const courseId = params.courseId as string;
  const chapterId = params.chapterId as string;

  return (
    <div className="flex flex-col flex-1">
      <main className="py-11 flex flex-col text-center gap-4 items-center flex-1 mt-24">
        <h2 className="text-3xl font-bold mb-4">
          What do you want to be quizzed about today?
        </h2>
        <QuizzUploadDocument
          courseId={courseId}
          chapterId={chapterId}
          initialData={null} 
        />
      </main>
    </div>
  );
};

export default NewQuizzUpload;
