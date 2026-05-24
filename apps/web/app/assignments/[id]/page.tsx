'use client';

import React, { useState, useEffect } from 'react';
import { Download, Share2, Printer, ChevronLeft, RefreshCw, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import styles from './AssignmentOutput.module.css';
import { clsx } from 'clsx';
import { useAssignmentStore } from '@/store/assignmentStore';

export default function AssignmentOutputPage() {
  const params = useParams();
  const router = useRouter();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { assignments, fetchAssignmentById, regenerateQuestion, loading } = useAssignmentStore();
  
  const assignmentId = params.id as string;
  const assignment = assignments.find(a => a.id === assignmentId);

  useEffect(() => {
    if (assignmentId && !assignment) {
      fetchAssignmentById(assignmentId);
    }
  }, [assignmentId, assignment, fetchAssignmentById]);

  const handleRegenerate = async (questionId?: string) => {
    if (!assignmentId) return;
    
    setIsRegenerating(true);
    if (questionId) {
      await regenerateQuestion(assignmentId, questionId);
    } else {
      // In a real app, you might have a regenerate all API
      // For now, let's just show the animation
      setTimeout(() => setIsRegenerating(false), 2000);
      return;
    }
    setIsRegenerating(false);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading assignment...</p>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className={styles.errorContainer}>
        <h2>Assignment not found</h2>
        <button onClick={() => router.push('/assignments')} className={styles.backBtn}>
          Back to Assignments
        </button>
      </div>
    );
  }

  // Use generatedPaper from assignment if it exists, otherwise use mock for UI demonstration
  const paper = assignment.generatedPaper || {
    schoolName: 'Delhi Public School, Sector-4, Bokaro',
    subject: assignment.subject,
    class: '5th',
    timeAllowed: '45 minutes',
    maxMarks: 20,
    sections: [
      {
        title: 'Section A',
        instruction: 'Short Answer Questions',
        subInstruction: 'Attempt all questions. Each question carries 2 marks',
        questions: [
          { id: '1', text: 'Define electroplating. Explain its purpose.', difficulty: 'Easy', marks: 2 },
          // ... other mock questions
        ]
      }
    ],
    answerKey: []
  };

  return (
    <div className={styles.container}>
      <div className={styles.aiHeader}>
        <div className={styles.aiProfile}>
          <div className={styles.aiAvatar}>
            <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Veda" alt="AI Avatar" />
          </div>
          <div className={styles.aiMessage}>
            <p>Certainly, Lakshya! Here are customized Question Paper for your CBSE Grade 8 Science classes on the NCERT chapters:</p>
            <div className={styles.aiActions}>
              <button className={styles.downloadBtn}>
                <Download size={18} />
                <span>Download as PDF</span>
              </button>
              <button
                className={clsx(styles.regenerateBtn, isRegenerating && styles.spinning)}
                onClick={() => handleRegenerate()}
              >
                <RefreshCw size={18} />
                <span>Regenerate All</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.paperCard}>
        <div className={styles.paperHeader}>
          <h1 className={styles.schoolName}>{paper.schoolName}</h1>
          <h2 className={styles.subjectHeader}>Subject: {paper.subject}</h2>
          <h2 className={styles.classHeader}>Class: {paper.class}</h2>
        </div>

        <div className={styles.paperMeta}>
          <p>Time Allowed: {paper.timeAllowed}</p>
          <p>Maximum Marks: {paper.maxMarks}</p>
        </div>

        <p className={styles.generalInstruction}>All questions are compulsory unless stated otherwise.</p>

        <div className={styles.studentInfo}>
          <div className={styles.infoLine}>
            <span>Name:</span>
            <div className={styles.inputLine} />
          </div>
          <div className={styles.infoLine}>
            <span>Roll Number:</span>
            <div className={styles.inputLine} />
          </div>
          <div className={styles.infoLine}>
            <span>Section:</span>
            <div className={styles.inputLine} />
          </div>
        </div>

        {paper.sections && paper.sections.map((section: any, sIdx: number) => (
          <div key={sIdx} className={styles.section}>
            <h3 className={styles.sectionTitle}>{section.title}</h3>
            <div className={styles.sectionHeader}>
              <h4 className={styles.questionTypeTitle}>{section.instruction}</h4>
              <p className={styles.questionTypeSub}>{section.subInstruction}</p>
            </div>

            <div className={styles.questionsList}>
              {section.questions && section.questions.map((q: any, qIdx: number) => (
                <div key={q.id || qIdx} className={styles.questionItem}>
                  <div className={styles.questionMain}>
                    <div className={styles.questionText}>
                      <span className={styles.qNumber}>{qIdx + 1}.</span>
                      <span className={styles.text}>{q.text || q.question}</span>
                    </div>
                    <div className={styles.qMeta}>
                      <span className={clsx(styles.tag, styles[(q.difficulty || 'easy').toLowerCase()])}>
                        {q.difficulty || 'Easy'}
                      </span>
                      <span className={styles.qMarks}>{q.marks} Marks</span>
                    </div>
                  </div>
                  <button
                    className={styles.qRegenerate}
                    onClick={() => handleRegenerate(q.id)}
                    title="Regenerate this question"
                  >
                    <RefreshCw size={14} />
                  </button>
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

      <div className={styles.actions}>
        <button onClick={() => router.back()} className={styles.backFab}>
          <ChevronLeft size={24} />
        </button>
      </div>
    </div>
  );
}
