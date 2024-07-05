import React, { useState } from 'react';
import styles from './CollapsableSection.module.css';

const CollapsibleSection = ({ title, children, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && onToggle) {
      onToggle();
    }
  };

  return (
    <div className={styles.collapsibleSection}>
      <div className={styles.header} onClick={toggleSection}>
        {title} {isOpen ? '▲' : '▼'}
      </div>
      {isOpen && <div className={styles.content}>{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
