import React from 'react';
import Link from 'next/link';
import { Plus, XCircle } from 'lucide-react';
import styles from './EmptyState.module.css';

export const EmptyState = () => {
  return (
    <div className={styles.container}>
      <div className={styles.illustration}>
        <div className={styles.circle}>
          <div className={styles.paper}>
            <div className={styles.line} />
            <div className={styles.line} />
            <div className={styles.line} />
          </div>
          <div className={styles.magnifier}>
            <div className={styles.magnifierCircle}>
               <XCircle className={styles.xIcon} size={48} />
            </div>
          </div>
          <div className={styles.sparkle1}>✦</div>
          <div className={styles.sparkle2}>✦</div>
        </div>
      </div>
      
      <h2 className={styles.title}>No assignments yet</h2>
      <p className={styles.description}>
        Create your first assignment to start collecting and grading student submissions. 
        You can set up rubrics, define marking criteria, and let AI assist with grading.
      </p>

      <Link href="/assignments/create" className={styles.button}>
        <Plus size={18} />
        <span>Create Your First Assignment</span>
      </Link>
    </div>
  );
};
