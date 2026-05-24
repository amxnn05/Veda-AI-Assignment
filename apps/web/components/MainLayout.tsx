'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSocketStore } from '@/store/socketStore';
import styles from './MainLayout.module.css';
import { clsx } from 'clsx';

export const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { connect, disconnect } = useSocketStore();
  const pathname = usePathname();
  const useCompactSidebar = false;

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return (
    <div className={styles.container}>
      <Sidebar compact={useCompactSidebar} />
      <div className={clsx(styles.mainContent, useCompactSidebar && styles.compactMainContent)}>
        <Header compactSidebar={useCompactSidebar} />
        <main key={pathname} className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};
