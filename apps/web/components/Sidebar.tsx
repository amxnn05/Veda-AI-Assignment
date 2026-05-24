'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Users, 
  FileText, 
  Wand2, 
  Library, 
  Settings, 
  Plus,
  ChevronDown
} from 'lucide-react';
import { useAssignmentStore } from '@/store/assignmentStore';
import { useUserStore } from '@/store/userStore';
import styles from './Sidebar.module.css';
import { clsx } from 'clsx';

export const Sidebar = () => {
  const pathname = usePathname();
  const { assignments } = useAssignmentStore();
  const { user } = useUserStore();

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Users, label: 'My Groups', href: '/groups' },
    { icon: FileText, label: 'Assignments', href: '/assignments', badge: assignments.length > 0 ? assignments.length : undefined },
    { icon: Wand2, label: "AI Teacher's Toolkit", href: '/toolkit' },
    { icon: Library, label: 'My Library', href: '/library', badge: 32 },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <div className={styles.logoContainer}>
          <div className={styles.logo}>
            <span className={styles.logoV}>V</span>
          </div>
          <span className={styles.logoText}>VedaAI</span>
        </div>

        <Link href="/assignments/create" className={styles.createButton}>
          <Plus size={18} />
          <span>Create Assignment</span>
        </Link>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/assignments' && pathname.startsWith('/assignments'));
            return (
              <Link 
                key={item.label} 
                href={item.href} 
                className={clsx(styles.navItem, isActive && styles.active)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className={styles.badge}>{item.badge}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className={styles.bottom}>
        <Link href="/settings" className={clsx(styles.navItem, pathname === '/settings' && styles.active)}>
          <Settings size={20} />
          <span>Settings</span>
        </Link>

        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            <img src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=School"} alt="School Logo" />
          </div>
          <div className={styles.profileInfo}>
            <p className={styles.schoolName}>{user?.schoolName || 'Delhi Public School'}</p>
            <p className={styles.schoolLocation}>{user?.location || 'Bokaro Steel City'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
