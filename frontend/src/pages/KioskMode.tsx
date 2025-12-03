import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './KioskMode.module.css';

export function KioskMode() {
    const navigate = useNavigate();
    const [highContrast, setHighContrast] = useState(false);

    return (
        <div className={`${styles.page} ${highContrast ? styles.highContrast : ''}`}>
            <header className={styles.header}>
                <img src="/src/components/images/undflogo.png" alt="UnDF" className={styles.logo} />
                <h1>Achados e Perdidos UnDF</h1>
                <button
                    onClick={() => setHighContrast(!highContrast)}
                    style={{
                        marginTop: '1rem',
                        padding: '1rem 2rem',
                        fontSize: '1.2rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        background: highContrast ? '#fff' : '#000',
                        color: highContrast ? '#000' : '#fff',
                        border: 'none'
                    }}
                >
                    👁️ Alto Contraste
                </button>
            </header>

            <main className={styles.main}>
                <div className={styles.container}>
                    <div
                        className={`${styles.actionCard} ${styles.lostCard}`}
                        onClick={() => navigate('/lost')}
                    >
                        <span className={styles.icon}>🔍</span>
                        <span className={styles.label}>Perdi Algo</span>
                        <span className={styles.subLabel}>Toque para buscar</span>
                    </div>

                    <div
                        className={`${styles.actionCard} ${styles.foundCard}`}
                        onClick={() => navigate('/found')}
                    >
                        <span className={styles.icon}>🙋‍♂️</span>
                        <span className={styles.label}>Achei Algo</span>
                        <span className={styles.subLabel}>Toque para cadastrar</span>
                    </div>
                </div>
            </main>

            <div className={styles.qrSection}>
                <p className={styles.qrTitle}>Prefere usar seu celular?</p>
                <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://apnovo-undf.vercel.app"
                    alt="QR Code para versão mobile"
                    style={{ borderRadius: '8px' }}
                />
            </div>
        </div>
    );
}
