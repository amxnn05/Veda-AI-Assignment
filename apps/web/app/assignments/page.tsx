'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, Loader2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { AssignmentCard } from '@/components/AssignmentCard';
import { useAssignmentStore } from '@/store/assignmentStore';
import styles from './AssignmentsPage.module.css';
import Link from 'next/link';

export default function AssignmentsPage() {
  const { assignments, fetchAssignments, loading, error } = useAssignmentStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const filteredAssignments = assignments.filter(a => 
    a.subject.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && assignments.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={48} />
        <p>Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.statusDot} />
          <div>
            <h1 className={styles.title}>Assignments</h1>
            <p className={styles.subtitle}>Manage and create assignments for your classes.</p>
          </div>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      {assignments.length > 0 ? (
        <div className={styles.content}>
          <div className={styles.toolbar}>
            <button className={styles.filterButton}>
              <Filter size={18} />
              <span>Filter By</span>
            </button>
            <div className={styles.searchBar}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search Assignment" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.grid}>
            {filteredAssignments.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>

          <Link href="/assignments/create" className={styles.fab}>
            <Plus size={24} />
            <span>Create Assignment</span>
          </Link>
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
