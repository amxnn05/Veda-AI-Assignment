'use client';

import React from 'react';
import { Construction } from 'lucide-react';
import styles from './ComingSoon.module.css';

export default function ComingSoon({ title }: { title: string }) {
  return (
    <div className={styles.container}>
      <Construction size={64} className={styles.icon} />
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>This section is coming soon. We're working hard to bring you the best experience!</p>
    </div>
  );
}
