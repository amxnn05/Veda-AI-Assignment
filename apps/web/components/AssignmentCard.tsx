import React from 'react';
import { MoreVertical, Calendar } from 'lucide-react';
import styles from './AssignmentCard.module.css';
import { Assignment } from '../store/assignmentStore';
import { format } from 'date-fns';
import Link from 'next/link';

interface AssignmentCardProps {
  assignment: Assignment;
}

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const safeDateFormat = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Not set';
      return format(date, 'dd-MM-yyyy');
    } catch (e) {
      return 'Not set';
    }
  };

  return (
    <Link href={`/assignments/${assignment.id}`} className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{assignment.subject}</h3>
        <button className={styles.moreButton}>
          <MoreVertical size={18} />
        </button>
      </div>
      
      <div className={styles.footer}>
        <div className={styles.info}>
          <span className={styles.label}>Assigned on :</span>
          <span className={styles.value}>{safeDateFormat(assignment.createdAt)}</span>
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Due :</span>
          <span className={styles.value}>{safeDateFormat(assignment.dueDate)}</span>
        </div>
      </div>
    </Link>
  );
};
