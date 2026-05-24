'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  X, 
  Plus, 
  Minus, 
  Mic, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon
} from 'lucide-react';
import styles from './CreateAssignment.module.css';
import { useRouter } from 'next/navigation';
import { useAssignmentStore, QuestionType } from '@/store/assignmentStore';
import { v4 as uuid } from 'uuid';

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False'
];

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { addAssignment } = useAssignmentStore();
  
  const [subject, setSubject] = useState('Science'); 
  const [dueDate, setDueDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>([
    { id: uuid(), type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: uuid(), type: 'Short Questions', count: 3, marks: 2 },
    { id: uuid(), type: 'Diagram/Graph-Based Questions', count: 5, marks: 5 },
    { id: uuid(), type: 'Numerical Problems', count: 5, marks: 5 },
  ]);

  const handleAddQuestionType = () => {
    setQuestionTypes([...questionTypes, { id: uuid(), type: '', count: 1, marks: 1 }]);
  };

  const handleRemoveQuestionType = (id: string) => {
    setQuestionTypes(questionTypes.filter(q => q.id !== id));
  };

  const handleUpdateQuestionType = (id: string, updates: Partial<QuestionType>) => {
    setQuestionTypes(questionTypes.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const totalQuestions = questionTypes.reduce((acc, q) => acc + (q.count || 0), 0);
  const totalMarks = questionTypes.reduce((acc, q) => acc + ((q.count || 0) * (q.marks || 0)), 0);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('instructions', instructions);
    formData.append('dueDate', dueDate);
    if (file) {
      formData.append('file', file);
    }
    
    // Also include question types if the backend supports it
    // formData.append('questionTypes', JSON.stringify(questionTypes));

    try {
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        addAssignment({
          ...data.assignment,
          id: data.assignment._id
        });
        router.push('/assignments');
      }
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.statusDot} />
        <div>
          <h1 className={styles.title}>Create Assignment</h1>
          <p className={styles.subtitle}>Set up a new assignment for your students</p>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: '40%' }} />
      </div>

      <div className={styles.formCard}>
        <h2 className={styles.sectionTitle}>Assignment Details</h2>
        <p className={styles.sectionSubtitle}>Basic information about your assignment</p>

        <div className={styles.uploadArea}>
          <label className={styles.uploadBox}>
            <input 
              type="file" 
              className={styles.fileInput} 
              onChange={handleFileChange}
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
            />
            <Upload className={styles.uploadIcon} size={32} />
            <p className={styles.uploadText}>
              {file ? file.name : (
                <>Choose a file or <span>drag & drop it here</span></>
              )}
            </p>
            <p className={styles.uploadHint}>JPEG, PNG, PDF upto 10MB</p>
            <div className={styles.browseButton}>Browse Files</div>
          </label>
          <p className={styles.uploadFooterText}>Upload images or PDF of your preferred document</p>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Subject</label>
          <input 
            type="text" 
            placeholder="e.g. Science, Mathematics..." 
            className={styles.input}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Due Date</label>
          <div className={styles.dateInputWrapper}>
            <input 
              type="date" 
              className={styles.input}
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.questionTypesSection}>
          <div className={styles.questionTypesHeader}>
            <span className={styles.headerLabel}>Question Type</span>
            <span className={styles.headerLabel}>No. of Questions</span>
            <span className={styles.headerLabel}>Marks</span>
          </div>

          {questionTypes.map((qt) => (
            <div key={qt.id} className={styles.questionTypeRow}>
              <div className={styles.selectWrapper}>
                <select 
                  value={qt.type} 
                  onChange={(e) => handleUpdateQuestionType(qt.id, { type: e.target.value })}
                  className={styles.select}
                >
                  <option value="" disabled>Select Type</option>
                  {QUESTION_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <ChevronDown className={styles.selectIcon} size={16} />
              </div>

              <div className={styles.counter}>
                <button 
                  onClick={() => handleUpdateQuestionType(qt.id, { count: Math.max(1, qt.count - 1) })}
                  className={styles.counterBtn}
                >
                  <Minus size={14} />
                </button>
                <span className={styles.counterValue}>{qt.count}</span>
                <button 
                  onClick={() => handleUpdateQuestionType(qt.id, { count: qt.count + 1 })}
                  className={styles.counterBtn}
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className={styles.counter}>
                <button 
                  onClick={() => handleUpdateQuestionType(qt.id, { marks: Math.max(1, qt.marks - 1) })}
                  className={styles.counterBtn}
                >
                  <Minus size={14} />
                </button>
                <span className={styles.counterValue}>{qt.marks}</span>
                <button 
                  onClick={() => handleUpdateQuestionType(qt.id, { marks: qt.marks + 1 })}
                  className={styles.counterBtn}
                >
                  <Plus size={14} />
                </button>
              </div>

              <button 
                onClick={() => handleRemoveQuestionType(qt.id)}
                className={styles.removeBtn}
              >
                <X size={16} />
              </button>
            </div>
          ))}

          <button onClick={handleAddQuestionType} className={styles.addButton}>
            <Plus size={16} />
            <span>Add Question Type</span>
          </button>
        </div>

        <div className={styles.totals}>
          <p>Total Questions : <span>{totalQuestions}</span></p>
          <p>Total Marks : <span>{totalMarks}</span></p>
        </div>

        <div className={styles.additionalInfo}>
          <label className={styles.label}>Additional Information (For better output)</label>
          <div className={styles.textareaWrapper}>
            <textarea 
              placeholder="e.g Generate a question paper for 3 hour exam duration..." 
              className={styles.textarea}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <button className={styles.micButton}>
              <Mic size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={styles.footerActions}>
        <button onClick={() => router.back()} className={styles.prevButton}>
          <ChevronLeft size={18} />
          <span>Previous</span>
        </button>
        <button onClick={handleSubmit} className={styles.nextButton}>
          <span>Next</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
