'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Plus, Loader2, X } from 'lucide-react';
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

  const normalizedSearch = search.trim().toLowerCase();

  const filteredAssignments = useMemo(() => {
    if (!normalizedSearch) {
      return assignments;
    }

    return assignments.filter((assignment) => {
      const paper = assignment.generatedPaper;
      const searchableFields = [
        assignment.subject,
        assignment.className,
        assignment.schoolName,
        assignment.location,
        assignment.status,
        assignment.dueDate,
        assignment.createdAt,
        assignment.fileName,
        assignment.instructions,
        paper?.title,
        paper?.subject,
        paper?.className,
        ...(assignment.questionTypes || []).map((questionType) => questionType.type),
      ];

      return searchableFields
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedSearch));
    });
  }, [assignments, normalizedSearch]);

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
                placeholder="Search by subject, class, status, file..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={styles.searchInput}
              />
              {search && (
                <button
                  type="button"
                  className={styles.clearSearchButton}
                  onClick={() => setSearch('')}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>

          {filteredAssignments.length > 0 ? (
            <div className={styles.grid}>
              {filteredAssignments.map((assignment) => (
                <AssignmentCard key={assignment.id} assignment={assignment} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>
                <Search size={22} />
              </div>
              <h2>No assignments found</h2>
              <p>No saved assignment matches “{search.trim()}”.</p>
              <button type="button" onClick={() => setSearch('')}>
                Clear search
              </button>
            </div>
          )}

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
