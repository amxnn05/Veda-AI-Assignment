import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bell, 
  ChevronDown,
  LayoutGrid
} from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export const Header = ({ title = 'Assignment', showBack = true }: HeaderProps) => {
  const router = useRouter();

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack && (
          <button onClick={() => router.back()} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
        )}
        <div className={styles.breadcrumbs}>
          <LayoutGrid size={16} className={styles.breadcrumbIcon} />
          <span className={styles.breadcrumbText}>{title}</span>
        </div>
      </div>

      <div className={styles.right}>
        <button className={styles.iconButton}>
          <Bell size={20} />
          <span className={styles.notificationDot} />
        </button>
        
        <div className={styles.userProfile}>
          <div className={styles.userAvatar}>
            <Image src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" alt="User Avatar" width={32} height={32} unoptimized />
          </div>
          <span className={styles.userName}>John Doe</span>
          <ChevronDown size={16} />
        </div>
      </div>
    </header>
  );
};
