import { useState } from "react";
import styles from "./Header.module.css";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
            <rect width="100" height="100" fill="white" rx="8"/>
            <path d="M30 20 L30 80 L50 65 L70 80 L70 20 Z" fill="currentColor"/>
            <path d="M40 35 L60 35 M40 50 L60 50" stroke="white" strokeWidth="4"/>
          </svg>
          <div>
            <div className={styles.logoText}>UNDF</div>
            <div className={styles.subtitle}>ACHADOS E PERDIDOS</div>
          </div>
        </div>
        
        {onMenuClick && (
          <button className={styles.menuButton} onClick={onMenuClick} aria-label="Menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
