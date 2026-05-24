'use client';

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  X, 
  Plus, 
  Minus, 
  Mic, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  Clock3
} from 'lucide-react';
import styles from './CreateAssignment.module.css';
import { useRouter } from 'next/navigation';
import { useAssignmentStore, QuestionType } from '@/store/assignmentStore';
import { useUserStore } from '@/store/userStore';
import { v4 as uuid } from 'uuid';
import { clsx } from 'clsx';

const QUESTION_TYPES = [
  'Multiple Choice Questions',
  'Short Questions',
  'Long Questions',
  'Diagram/Graph-Based Questions',
  'Numerical Problems',
  'True/False'
];

const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
]);

export default function CreateAssignmentPage() {
  const router = useRouter();
  const { addAssignment } = useAssignmentStore();
  const { user } = useUserStore();
  
  const [subject, setSubject] = useState(''); 
  const [schoolName, setSchoolName] = useState('');
  const [className, setClassName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [maxTime, setMaxTime] = useState(45);
  const [maxTimeUnit, setMaxTimeUnit] = useState<'minutes' | 'hours'>('minutes');
  const [instructions, setInstructions] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.schoolName) {
      setSchoolName(user.schoolName);
    }
  }, [user]);

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

  const handleSelectedFile = (selectedFile?: File) => {
    if (!selectedFile) return;

    if (!ACCEPTED_FILE_TYPES.has(selectedFile.type)) {
      setFile(null);
      setFileError('Upload a PDF, JPEG, PNG, or WEBP file.');
      return;
    }

    if (selectedFile.size > MAX_UPLOAD_SIZE) {
      setFile(null);
      setFileError('File size must be 10MB or less.');
      return;
    }

    setFile(selectedFile);
    setFileError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSelectedFile(e.target.files?.[0]);
  };

  const totalQuestions = questionTypes.reduce((acc, q) => acc + (q.count || 0), 0);
  const totalMarks = questionTypes.reduce((acc, q) => acc + ((q.count || 0) * (q.marks || 0)), 0);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validation
    const newErrors: Record<string, boolean> = {
      subject: !subject.trim(),
      schoolName: !schoolName.trim(),
      className: !className.trim(),
      dueDate: !dueDate,
      maxTime: maxTime < 1,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(Boolean)) {
      return;
    }

    const formData = new FormData();
    formData.append('subject', subject);
    formData.append('schoolName', schoolName);
    formData.append('className', className);
    formData.append('location', user?.location || '');
    formData.append('instructions', instructions);
    formData.append('dueDate', dueDate);
    formData.append('maxTime', String(maxTimeUnit === 'hours' ? maxTime * 60 : maxTime));
    formData.append('maxTimeUnit', maxTimeUnit);
    formData.append('questionTypes', JSON.stringify(questionTypes));
    if (file) {
      formData.append('file', file);
    }

    try {
      setIsSubmitting(true);
      const response = await fetch('http://localhost:5000/api/assignments', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to create assignment');
      }

      if (data.success) {
        const createdAssignment = {
          ...data.assignment,
          id: data.assignment._id
        };

        addAssignment({
          ...createdAssignment,
          status: createdAssignment.status || 'pending'
        });
        router.push(`/assignments/${createdAssignment.id}`);
      }
    } catch (error) {
      console.error('Failed to create assignment:', error);
      setFileError(error instanceof Error ? error.message : 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button type="button" className={styles.mobileBackButton} onClick={() => router.back()} aria-label="Go back">
          <ChevronLeft size={18} />
        </button>
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
          <label
            className={clsx(styles.uploadBox, isDraggingFile && styles.uploadBoxActive, file && styles.uploadBoxReady)}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingFile(true);
            }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingFile(false);
              handleSelectedFile(e.dataTransfer.files?.[0]);
            }}
          >
            <input 
              type="file" 
              className={styles.fileInput} 
              onChange={handleFileChange}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              style={{ display: 'none' }}
            />
            <Upload className={styles.uploadIcon} size={32} />
            <p className={styles.uploadText}>
              {file ? file.name : (
                <>Choose a file or <span>drag & drop it here</span></>
              )}
            </p>
            <p className={styles.uploadHint}>PDF, JPEG, PNG, WEBP up to 10MB. Text will be extracted and used by AI.</p>
            <div className={styles.browseButton}>Browse Files</div>
          </label>
          {file ? (
            <div className={styles.fileSummary}>
              <div>
                <p>{file.name}</p>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB • Ready for text extraction</span>
              </div>
              <button
                type="button"
                className={styles.clearFileBtn}
                onClick={() => {
                  setFile(null);
                  setFileError('');
                }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <p className={styles.uploadFooterText}>Upload a source PDF or image. The server extracts its text before generation.</p>
          )}
          {fileError && <span className={styles.errorText}>{fileError}</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>School Name</label>
          <input 
            type="text" 
            placeholder="e.g. Delhi Public School..." 
            className={clsx(styles.input, errors.schoolName && styles.errorInput)}
            value={schoolName}
            onChange={(e) => {
              setSchoolName(e.target.value);
              if (errors.schoolName) setErrors({ ...errors, schoolName: false });
            }}
          />
          {errors.schoolName && <span className={styles.errorText}>School name is required</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Class</label>
          <input 
            type="text" 
            placeholder="e.g. 5th, 8th..." 
            className={clsx(styles.input, errors.className && styles.errorInput)}
            value={className}
            onChange={(e) => {
              setClassName(e.target.value);
              if (errors.className) setErrors({ ...errors, className: false });
            }}
          />
          {errors.className && <span className={styles.errorText}>Class is required</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Subject</label>
          <input 
            type="text" 
            placeholder="e.g. Science, Mathematics..." 
            className={clsx(styles.input, errors.subject && styles.errorInput)}
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              if (errors.subject) setErrors({ ...errors, subject: false });
            }}
            required
          />
          {errors.subject && <span className={styles.errorText}>Subject is required</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Due Date</label>
          <div className={styles.dateInputWrapper}>
            <input 
              type="date" 
              className={clsx(styles.input, errors.dueDate && styles.errorInput)}
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                if (errors.dueDate) setErrors({ ...errors, dueDate: false });
              }}
            />
          </div>
          {errors.dueDate && <span className={styles.errorText}>Due date is required</span>}
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.label}>Maximum Paper Time</label>
          <div className={styles.timeInputWrapper}>
            <Clock3 className={styles.timeIcon} size={18} />
            <input
              type="number"
              min={1}
              step={maxTimeUnit === 'hours' ? 0.5 : 5}
              placeholder={maxTimeUnit === 'hours' ? '1.5' : '45'}
              className={clsx(styles.input, styles.timeInput, errors.maxTime && styles.errorInput)}
              value={maxTime}
              onChange={(e) => {
                setMaxTime(Number(e.target.value));
                if (errors.maxTime) setErrors({ ...errors, maxTime: false });
              }}
            />
            <select
              className={styles.timeUnitSelect}
              value={maxTimeUnit}
              onChange={(e) => {
                const nextUnit = e.target.value as 'minutes' | 'hours';
                setMaxTimeUnit(nextUnit);
                setMaxTime((current) => {
                  if (nextUnit === 'hours' && maxTimeUnit === 'minutes') {
                    return Math.max(1, Number((current / 60).toFixed(1)));
                  }

                  if (nextUnit === 'minutes' && maxTimeUnit === 'hours') {
                    return Math.max(1, Math.round(current * 60));
                  }

                  return current;
                });
              }}
            >
              <option value="minutes">minutes</option>
              <option value="hours">hours</option>
            </select>
          </div>
          {errors.maxTime && <span className={styles.errorText}>Maximum time must be at least 1 minute</span>}
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
        <button onClick={handleSubmit} className={styles.nextButton} disabled={isSubmitting}>
          <span>{isSubmitting ? 'Extracting & Creating...' : 'Next'}</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
