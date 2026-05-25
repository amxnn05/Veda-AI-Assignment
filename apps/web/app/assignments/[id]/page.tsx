'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import styles from './AssignmentOutput.module.css';
import { useAssignmentStore } from '@/store/assignmentStore';
import dynamic from 'next/dynamic';

const AssignmentExportActions = dynamic(
  () => import('@/components/AssignmentExportActions'),
  { ssr: false }
);

const AssignmentModals = dynamic(
  () => import('@/components/AssignmentModals'),
  { ssr: false }
);

type GeneratedQuestion = {
  id?: string;
  text?: string;
  question?: string;
  options?: string[];
  difficulty?: string;
  marks?: number;
};

type GeneratedSection = {
  title?: string;
  instruction?: string;
  subInstruction?: string;
  questions?: GeneratedQuestion[];
};

type GeneratedPaper = {
  schoolName?: string;
  subject?: string;
  class?: string;
  timeAllowed?: string;
  maxMarks?: number;
  sections: GeneratedSection[];
  answerKey: string[];
};

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const { assignments, fetchAssignmentById, regenerateQuestion, regenerateFullAssignment } = useAssignmentStore();
  const paperRef = useRef<HTMLDivElement>(null);
  
  const assignmentId = params.id as string;
  const assignment = assignments.find(a => a.id === assignmentId);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    const getAssignment = async () => {
      const updatedAssignment = await fetchAssignmentById(assignmentId);
      
      // If still processing, poll again
      if (updatedAssignment && (updatedAssignment.status === 'pending' || updatedAssignment.status === 'processing')) {
        pollInterval = setTimeout(getAssignment, 3000);
      }
    };

    if (assignmentId) {
      getAssignment();
    }

    return () => {
      if (pollInterval) clearTimeout(pollInterval);
    };
  }, [assignmentId, fetchAssignmentById]);

  const handleRegenerate = async (questionId?: string) => {
    if (!assignmentId) return;
    
    if (questionId) {
      setRegeneratingId(questionId);
      await regenerateQuestion(assignmentId, questionId);
      setRegeneratingId(null);
    }
  };

  const handleFullRegenerate = async (instructions: string) => {
    await regenerateFullAssignment(assignmentId, instructions);
  };

  if (!assignment) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinning} size={48} />
        <p>Loading assignment...</p>
      </div>
    );
  }

  if (assignment.status === 'pending' || assignment.status === 'processing') {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinning} size={80} />
        <h2 className={styles.generatingTitle}>Generating your assignment...</h2>
        <p className={styles.generatingSub}>Our AI is crafting the perfect questions for you.</p>
        <div className={styles.progressContainer}>
           <div className={styles.progressBarFill} />
        </div>
      </div>
    );
  }

  if (assignment.status === 'failed') {
    return (
      <div className={styles.errorContainer}>
        <h2>Generation Failed</h2>
        <p>Something went wrong while generating the paper. Please try again.</p>
        <button onClick={() => router.push('/assignments')} className={styles.backBtn}>
          Back to Assignments
        </button>
      </div>
    );
  }

  // Use generatedPaper from assignment if it exists
  const paper: GeneratedPaper = assignment.generatedPaper || {
    sections: [],
    answerKey: []
  };

  const displaySchoolName = assignment.schoolName 
    ? (assignment.location ? `${assignment.schoolName}, ${assignment.location}` : assignment.schoolName)
    : (paper.schoolName || 'Delhi Public School, Bokaro');
  const displaySubject = assignment.subject || paper.subject || 'Subject Not Specified';
  const displayClass = assignment.className || paper.class || 'N/A';

  return (
    <div className={styles.container}>
      <div className={styles.aiHeader} data-html2canvas-ignore>
        <div className={styles.aiProfile}>
          <div className={styles.aiMessage}>
            <p>Certainly, Lakshya! Here is the customized Question Paper for your class:</p>
            <div className={styles.aiActions}>
              <AssignmentExportActions assignment={assignment} paperRef={paperRef} />
              <AssignmentModals 
                assignment={assignment} 
                onRegenerate={handleFullRegenerate} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.paperCard} ref={paperRef}>
        <div className={styles.paperHeader}>
          <h1 className={styles.schoolName}>{displaySchoolName}</h1>
          <h2 className={styles.subjectHeader}>SUBJECT: {displaySubject.toUpperCase()}</h2>
          <h2 className={styles.classHeader}>CLASS: {displayClass.toUpperCase()}</h2>
        </div>

        <div className={styles.paperMeta}>
          <p>TIME ALLOWED: {paper.timeAllowed || '45 MINUTES'}</p>
          <p>MAXIMUM MARKS: {assignment.totalMarks || paper.maxMarks || 20}</p>
        </div>

        <div className={styles.instructionsSection}>
          <h3 className={styles.instructionsTitle}>GENERAL INSTRUCTIONS:</h3>
          <p className={styles.generalInstruction}>All questions are compulsory unless stated otherwise.</p>
          {assignment.instructions && (
            <>
              <h3 className={styles.instructionsTitle} style={{ marginTop: '15px' }}>SPECIFIC INSTRUCTIONS:</h3>
              <p className={styles.generalInstruction}>{assignment.instructions}</p>
            </>
          )}
        </div>

        <div className={styles.studentInfo}>
          <div className={styles.infoLine}>
            <span>NAME:</span>
            <div className={styles.inputLine} />
          </div>
          <div className={styles.infoLine}>
            <span>ROLL NUMBER:</span>
            <div className={styles.inputLine} />
          </div>
          <div className={styles.infoLine}>
            <span>DATE:</span>
            <div className={styles.inputLine} />
          </div>
        </div>

        {paper.sections && paper.sections.map((section, sIdx) => (
          <div key={sIdx} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <div className={styles.sectionHeader}>
              <h4 className={styles.questionTypeTitle}>{section.instruction}</h4>
              <p className={styles.questionTypeSub}>{section.subInstruction}</p>
            </div>

            <div className={styles.questionsList}>
              {section.questions && section.questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className={styles.questionItem}>
                  <div className={styles.questionMain}>
                    <div className={styles.questionText}>
                      <span className={styles.qNumber}>{qIdx + 1}.</span>
                      <span className={styles.text}>{q.text || q.question}</span>
                      <button
                        className={styles.qRegenerate}
                        onClick={() => handleRegenerate(q.id)}
                        title="Regenerate this question"
                        disabled={regeneratingId === q.id}
                        data-html2canvas-ignore
                      >
                        {regeneratingId === q.id ? (
                          <Loader2 size={14} className={styles.spinning} />
                        ) : (
                          <RefreshCw size={14} />
                        )}
                      </button>
                    </div>
                    
                    {q.options && q.options.length > 0 && (
                      <div className={styles.optionsGrid}>
                        {q.options.map((option: string, oIdx: number) => (
                          <div key={oIdx} className={styles.optionItem}>
                            <span className={styles.optionLetter}>
                              {String.fromCharCode(97 + oIdx)}.
                            </span>
                            <span className={styles.optionText}>{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={styles.qMetaBottom}>
                      <span className={styles.difficultyBold}>{(q.difficulty || 'Easy').toUpperCase()}</span>
                      <span className={styles.marksParen}>({q.marks} Marks)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {paper.answerKey && paper.answerKey.length > 0 && (
          <div className={styles.answerKeySection}>
            <h3 className={styles.answerKeyTitle}>Answer Key:</h3>
            <div className={styles.answersList}>
              {paper.answerKey.map((answer: string, aIdx: number) => (
                <div key={aIdx} className={styles.answerItem}>
                  <span className={styles.aNumber}>{aIdx + 1}.</span>
                  <p className={styles.answerText}>{answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.actions} data-html2canvas-ignore>
        <button onClick={() => router.back()} className={styles.backFab}>
          <ChevronLeft size={24} />
        </button>
      </div>
    </div>
  );
}
