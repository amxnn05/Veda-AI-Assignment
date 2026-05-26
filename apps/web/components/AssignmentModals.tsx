'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ReactLenis, useLenis } from 'lenis/react';
import { ArrowRight, BarChart3, CheckCircle2, Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
import AnimatedButton from './ui/animated-button';
import styles from '../app/assignments/[id]/AssignmentOutput.module.css';

type StudentDifficultyInsights = {
  highRiskTopics?: string[];
  predictedChallenges?: string[];
  prerequisiteGaps?: string[];
  recommendedPreparation?: string[];
  estimatedDifficulty?: string;
};

type Analysis = {
  mainFocus?: string;
  strongTopics?: string[];
  weakTopics?: string[];
  syllabusCoverage?: {
    topic?: string;
    percentage?: number;
  }[];
  teacherSuggestion?: string;
  studentDifficultyInsights?: StudentDifficultyInsights;
};

type AssignmentWithAnalysis = {
  instructions?: string;
  generatedPaper?: {
    analysis?: Analysis;
  };
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, eyebrow, icon, children }: ModalProps) => {
  if (!isOpen) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrap}>
            <span className={styles.modalIcon}>{icon}</span>
            <div>
              <p className={styles.modalEyebrow}>{eyebrow}</p>
              <h2 className={styles.modalTitle}>{title}</h2>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className={styles.modalScrollArea} data-lenis-prevent>
          <div className={styles.modalBody}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

interface AssignmentModalsProps {
  assignment: AssignmentWithAnalysis;
  onRegenerate: (instructions: string) => Promise<void>;
}

export default function AssignmentModals({ assignment, onRegenerate }: AssignmentModalsProps) {
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false);
  const [isRegenerateOpen, setIsRegenerateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAdaptiveAction, setActiveAdaptiveAction] = useState<string | null>(null);
  const [newInstructions, setNewInstructions] = useState(assignment?.instructions || '');

  const analysis = assignment?.generatedPaper?.analysis || {};
  const difficultyInsights = analysis.studentDifficultyInsights || {};
  const syllabusCoverage = analysis.syllabusCoverage || [];

  const handleRegenerateSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onRegenerate(newInstructions);
      setIsRegenerateOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdaptiveRegenerate = async (mode: 'reduce' | 'deepen') => {
    const adaptiveInstruction = mode === 'reduce'
      ? `Reduce student difficulty for this paper. Simplify the highest-risk topics, reduce analytical load, add more conceptual scaffolding, and keep the paper aligned to the original marks and question-type distribution. Current teacher instruction: ${assignment?.instructions || 'None'}`
      : `Increase analytical depth for this paper. Add more application, reasoning, and conceptual transfer questions while keeping the original marks and question-type distribution. Current teacher instruction: ${assignment?.instructions || 'None'}`;

    setActiveAdaptiveAction(mode);
    try {
      await onRegenerate(adaptiveInstruction);
      setIsAnalysisOpen(false);
    } finally {
      setActiveAdaptiveAction(null);
    }
  };

  const renderInsightList = (items: string[] | undefined, emptyText: string) => (
    items?.length ? (
      <ul className={styles.insightList}>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    ) : (
      <p className={styles.mutedText}>{emptyText}</p>
    )
  );

  return (
    <>
      <AnimatedButton 
        className={styles.analysisBtn} 
        onClick={() => setIsAnalysisOpen(true)} 
        data-html2canvas-ignore
        showCenterShine={false}
      >
        <BarChart3 size={18} />
        <span>View Analysis</span>
      </AnimatedButton>
      <AnimatedButton 
        className={styles.regenerateBtn} 
        onClick={() => setIsRegenerateOpen(true)} 
        data-html2canvas-ignore
        showCenterShine={false}
      >
        <RefreshCw size={18} />
        <span>Regenerate All</span>
      </AnimatedButton>

      <Modal 
        isOpen={isAnalysisOpen} 
        onClose={() => setIsAnalysisOpen(false)} 
        title="Educational Analysis"
        eyebrow="Paper insight"
        icon={<BarChart3 size={20} />}
      >
        <div className={styles.analysisGrid}>
          <div className={styles.analysisHero}>
            <div>
              <label>Main Focus</label>
              <p>{analysis.mainFocus || 'No focus summary is available yet.'}</p>
            </div>
          </div>

          <div className={styles.coverageMeter}>
            <div className={styles.coverageHeader}>
              <div>
                <h3>Topic Balance</h3>
              </div>
            </div>
            <div className={styles.coverageList}>
              {syllabusCoverage.length > 0 ? (
                syllabusCoverage.map((item) => {
                  const percentage = Math.max(0, Math.min(100, item.percentage || 0));
                  const topic = item.topic || 'Unnamed Topic';

                  return (
                    <div className={styles.coverageRow} key={topic}>
                      <div className={styles.coverageMeta}>
                        <span>{topic}</span>
                        <strong>{percentage}%</strong>
                      </div>
                      <div className={styles.coverageTrack}>
                        <div className={styles.coverageFill} style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className={styles.mutedText}>No syllabus coverage estimate is available for this paper.</p>
              )}
            </div>
          </div>
          
          <div className={styles.analysisRow}>
            <div className={styles.analysisItem}>
              <label>Strong Topics</label>
              <div className={styles.tagCloud}>
                {analysis.strongTopics?.length
                  ? analysis.strongTopics.map((topic) => <span key={topic} className={styles.tag}>{topic}</span>)
                  : <span className={styles.emptyTag}>No strong topics listed</span>}
              </div>
            </div>
            <div className={styles.analysisItem}>
              <label>Weak Coverage</label>
              <div className={styles.tagCloud}>
                {analysis.weakTopics?.length
                  ? analysis.weakTopics.map((topic) => <span key={topic} className={`${styles.tag} ${styles.weakTag}`}>{topic}</span>)
                  : <span className={styles.emptyTag}>No weak coverage listed</span>}
              </div>
            </div>
          </div>

          <div className={styles.analysisItem}>
            <label>Teacher&apos;s Suggestion</label>
            <p className={styles.suggestion}><CheckCircle2 size={18} />{analysis.teacherSuggestion || 'No suggestions available.'}</p>
          </div>

          <div className={styles.predictorPanel}>
            <div className={styles.predictorHeader}>
              <div>
                <h3>Student Performance Insights</h3>
              </div>
              <span className={styles.difficultyPill}>{difficultyInsights.estimatedDifficulty || 'Not estimated'}</span>
            </div>

            <div className={styles.predictorGrid}>
              <div className={styles.predictorCard}>
                <label>High Risk Areas</label>
                <div className={styles.tagCloud}>
                  {difficultyInsights.highRiskTopics?.length
                    ? difficultyInsights.highRiskTopics.map((topic) => <span key={topic} className={`${styles.tag} ${styles.riskTag}`}>{topic}</span>)
                    : <span className={styles.emptyTag}>No high-risk topics predicted</span>}
                </div>
              </div>

              <div className={styles.predictorCard}>
                <label>Expected Student Mistakes</label>
                {renderInsightList(difficultyInsights.predictedChallenges, 'No predicted challenges available.')}
              </div>

              <div className={styles.predictorCard}>
                <label>Prerequisite Gaps</label>
                {renderInsightList(difficultyInsights.prerequisiteGaps, 'No prerequisite gaps detected.')}
              </div>

              <div className={styles.predictorCard}>
                <label>Preparation Recommendations</label>
                {renderInsightList(difficultyInsights.recommendedPreparation, 'No preparation recommendations available.')}
              </div>
            </div>

            <div className={styles.adaptiveActions}>
              <button
                className={styles.adaptiveSecondaryBtn}
                onClick={() => handleAdaptiveRegenerate('reduce')}
                disabled={activeAdaptiveAction !== null}
              >
                {activeAdaptiveAction === 'reduce' ? <Loader2 size={17} className={styles.buttonSpinner} /> : <RefreshCw size={17} />}
                <span>{activeAdaptiveAction === 'reduce' ? 'Adjusting...' : 'Reduce Student Difficulty'}</span>
              </button>
              <button
                className={styles.adaptivePrimaryBtn}
                onClick={() => handleAdaptiveRegenerate('deepen')}
                disabled={activeAdaptiveAction !== null}
              >
                {activeAdaptiveAction === 'deepen' ? <Loader2 size={17} className={styles.buttonSpinner} /> : <Sparkles size={17} />}
                <span>{activeAdaptiveAction === 'deepen' ? 'Deepening...' : 'Increase Analytical Depth'}</span>
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isRegenerateOpen} 
        onClose={() => setIsRegenerateOpen(false)} 
        title="Regenerate Question Paper"
        eyebrow="New version"
        icon={<RefreshCw size={20} />}
      >
        <div className={styles.regenerateForm}>
          <div className={styles.regeneratePrompt}>
            <span><Sparkles size={18} /></span>
            <p>Tell Veda what should change. Keep the instruction short and specific for the best result.</p>
          </div>
          <div className={styles.textareaWrapper}>
            <textarea 
              className={styles.textarea}
              placeholder="e.g. Make it more challenging, focus more on Section B..."
              value={newInstructions}
              onChange={(e) => setNewInstructions(e.target.value)}
              rows={5}
            />
          </div>
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={() => setIsRegenerateOpen(false)} disabled={isSubmitting}>Cancel</button>
            <button className={styles.submitBtn} onClick={handleRegenerateSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={18} className={styles.buttonSpinner} /> : <ArrowRight size={18} />}
              <span>{isSubmitting ? 'Regenerating...' : 'Start Regeneration'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
