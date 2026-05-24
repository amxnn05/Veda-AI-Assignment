import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import styles from './AssignmentCard.module.css';
import { Assignment, useAssignmentStore } from '../store/assignmentStore';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface AssignmentCardProps {
  assignment: Assignment;
}

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { deleteAssignment } = useAssignmentStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeDateFormat = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Not set';
      return format(date, 'dd-MM-yyyy');
    } catch {
      return 'Not set';
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assignment?')) {
      await deleteAssignment(assignment.id);
    }
    setShowDropdown(false);
  };

  const handleView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/assignments/${assignment.id}`);
  };

  const toggleDropdown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  return (
    <div className={styles.card} onClick={() => router.push(`/assignments/${assignment.id}`)}>
      <div className={styles.header}>
        <h3 className={styles.title}>{assignment.subject}</h3>
        <div className={styles.dropdownContainer} ref={dropdownRef}>
          <button className={styles.moreButton} onClick={toggleDropdown}>
            <MoreVertical size={18} />
          </button>

          {showDropdown && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem} onClick={handleView}>
                View Assignment
              </button>
              <button className={`${styles.dropdownItem} ${styles.deleteItem}`} onClick={handleDelete}>
                Delete
              </button>
            </div>
          )}
        </div>
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
    </div>
  );
};
