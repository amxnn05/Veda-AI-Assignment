import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Bell, 
  ChevronDown,
  Sparkles,
  Menu
} from 'lucide-react';
import styles from './Header.module.css';
import { clsx } from 'clsx';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  compactSidebar?: boolean;
}

export const Header = ({ title = 'Assignment', showBack = true, compactSidebar = false }: HeaderProps) => {
  const router = useRouter();

  return (
    <header className={clsx(styles.header, compactSidebar && styles.compactSidebarOffset)}>
      <div className={styles.mobileBrand}>
        <div className={styles.mobileLogo}>
          <Image src="/veda-logo.svg" alt="VedaAI logo" width={26} height={26} priority />
        </div>
        <span>VedaAI</span>
      </div>

      <div className={styles.left}>
        {showBack && (
          <button onClick={() => router.back()} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
        )}
        <div className={styles.breadcrumbs}>
          <Sparkles size={18} className={styles.breadcrumbIcon} />
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

        <button className={styles.menuButton} aria-label="Open menu">
          <Menu size={19} />
        </button>
      </div>
    </header>
  );
};
