"use client";

import { useState } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  BlobProvider,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { FileDown, Eye, X, ChevronLeft } from "lucide-react";
import { Quiz, Question, Answer } from "@prisma/client";

interface QuizPDFViewerProps {
  quiz: Quiz & {
    questions: (Question & {
      answers: Answer[];
    })[];
  };
  onClose?: () => void;
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#FFFFFF",
    padding: 40,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E5E7EB",
  },
  title: {
    fontSize: 24,
    color: "#111827",
    marginBottom: 8,
    fontWeight: "bold",
  },
  description: {
    fontSize: 11,
    color: "#6B7280",
  },
  questionSection: {
    marginVertical: 15,
  },
  questionText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "bold",
  },
  answer: {
    marginLeft: 16,
    marginBottom: 6,
    fontSize: 11,
    color: "#374151",
  },
  answerCorrect: {
    fontSize: 11,
    color: "#059669",
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 6,
  },
  footer: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 9,
    marginTop: 20,
    borderTopWidth: 0.5,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

const QuizDocument = ({ quiz }: { quiz: QuizPDFViewerProps["quiz"] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{quiz.name}</Text>
        <Text style={styles.description}>
          Total Questions: {quiz.questions.length} | Duration: Unlimited
        </Text>
      </View>

      {quiz.questions.map((question, index) => (
        <View key={question.id} style={styles.questionSection}>
          <Text style={styles.questionText}>
            Question {index + 1}: {question.questionText}
          </Text>
          {question.answers.map((answer, ansIndex) => (
            <Text
              key={answer.id}
              style={answer.isCorrect ? styles.answerCorrect : styles.answer}
            >
              {String.fromCharCode(65 + ansIndex)}. {answer.answerText}
              {answer.isCorrect ? " ✓" : ""}
            </Text>
          ))}
        </View>
      ))}

      <Text style={styles.footer}>
        Generated on {new Date().toLocaleDateString()} • {quiz.name}
      </Text>
    </Page>
  </Document>
);

const DownloadButton = ({
  url,
  loading,
}: {
  url: string | null;
  loading: boolean;
}) => (
  <Button
    variant="secondary"
    className="bg-white/10 text-white hover:bg-white/20 transition-colors rounded-md px-4 py-2 flex items-center"
    disabled={loading || !url}
    onClick={() => url && window.open(url)}
  >
    <FileDown className="h-4 w-4 mr-2" />
    {loading ? "Preparing PDF..." : "Download"}
  </Button>
);

const QuizPDFViewer = ({ quiz, onClose }: QuizPDFViewerProps) => {
  const [isViewing, setIsViewing] = useState(false);

  return (
    <div className="fixed inset-0 bg-neutral-900/95 backdrop-blur-md z-50 flex flex-col items-center justify-center">
      <div className="fixed top-0 left-0 right-0 bg-neutral-900/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="text-white flex flex-col">
            <h3 className="font-medium">{quiz.name}</h3>
            <p className="text-xs text-white/60">PDF Preview & Download</p>
          </div>
          <div className="flex items-center gap-x-2">
            <BlobProvider document={<QuizDocument quiz={quiz} />}>
              {({ url, loading }) => (
                <DownloadButton url={url} loading={loading} />
              )}
            </BlobProvider>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 flex items-center"
              onClick={() => setIsViewing(!isViewing)}
            >
              {isViewing ? (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {isViewing ? (
        <PDFViewer className="w-full h-full mt-16">
          <QuizDocument quiz={quiz} />
        </PDFViewer>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center text-white space-y-4 max-w-lg px-4">
          <h2 className="text-2xl font-semibold">Quiz PDF Generator</h2>
          <p className="text-sm text-white/70">
            Preview or download a beautifully formatted PDF version of your
            quiz.
          </p>
          <div className="flex gap-4">
            <Button
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 flex items-center px-4 py-2 rounded-md"
              onClick={() => setIsViewing(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview PDF
            </Button>
            <BlobProvider document={<QuizDocument quiz={quiz} />}>
              {({ url, loading }) => (
                <DownloadButton url={url} loading={loading} />
              )}
            </BlobProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizPDFViewer;

//NEW CODE
