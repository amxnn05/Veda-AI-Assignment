import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, MoreVertical, Trash2, X } from 'lucide-react';
import styles from './AssignmentCard.module.css';
import { Assignment, useAssignmentStore } from '../store/assignmentStore';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface AssignmentCardProps {
  assignment: Assignment;
}

export const AssignmentCard = ({ assignment }: AssignmentCardProps) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVanishing, setIsVanishing] = useState(false);
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
    setShowDropdown(false);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setIsVanishing(true);

    window.setTimeout(async () => {
      const deleted = await deleteAssignment(assignment.id);

      if (!deleted) {
        setIsVanishing(false);
        setIsDeleting(false);
        setShowDeleteDialog(false);
      }
    }, 220);
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
    <>
      <div className={`${styles.card} ${isVanishing ? styles.vanish : ''}`} onClick={() => router.push(`/assignments/${assignment.id}`)}>
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

      {showDeleteDialog && createPortal(
        <div className={styles.deleteOverlay} onClick={() => !isDeleting && setShowDeleteDialog(false)}>
          <div className={styles.deleteDialog} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.dialogClose}
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              <X size={18} />
            </button>

            <div className={styles.deleteIcon}>
              <Trash2 size={20} />
            </div>
            <h3>Delete assignment</h3>
            <p className={styles.dialogCopy}>
              Are you sure you want to delete <span className={styles.assignmentName}>{assignment.subject}</span>? This cannot be undone.
            </p>

            <div className={styles.dialogActions}>
              <button className={styles.cancelDeleteBtn} onClick={() => setShowDeleteDialog(false)} disabled={isDeleting}>
                Cancel
              </button>
              <button className={styles.confirmDeleteBtn} onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 size={16} className={styles.spinner} /> : <Trash2 size={16} />}
                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
