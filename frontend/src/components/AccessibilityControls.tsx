import { useState, useEffect } from 'react';
import styles from './AccessibilityControls.module.css';

export function AccessibilityControls() {
    const [isOpen, setIsOpen] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState(100);

    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
        document.documentElement.style.fontSize = `${fontSize}%`;
    }, [highContrast, fontSize]);

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.toggleBtn}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Opções de Acessibilidade"
            >
                ♿
            </button>

            {isOpen && (
                <div className={styles.panel}>
                    <h3>Acessibilidade</h3>

                    <div className={styles.control}>
                        <label>Alto Contraste</label>
                        <button
                            className={`${styles.switch} ${highContrast ? styles.active : ''}`}
                            onClick={() => setHighContrast(!highContrast)}
                        >
                            {highContrast ? 'ON' : 'OFF'}
                        </button>
                    </div>

                    <div className={styles.control}>
                        <label>Tamanho da Fonte</label>
                        <div className={styles.fontControls}>
                            <button onClick={() => setFontSize(Math.max(80, fontSize - 10))}>A-</button>
                            <span>{fontSize}%</span>
                            <button onClick={() => setFontSize(Math.min(150, fontSize + 10))}>A+</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
