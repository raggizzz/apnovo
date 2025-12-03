import { Item } from '../lib/supabase';
import styles from './SmartMatchModal.module.css';

interface SmartMatchModalProps {
    matches: Item[];
    onClose: () => void;
    onConfirmMatch: (item: Item) => void;
}

export function SmartMatchModal({ matches, onClose, onConfirmMatch }: SmartMatchModalProps) {
    if (matches.length === 0) return null;

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2>🎉 Encontramos itens parecidos!</h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </div>

                <p className={styles.description}>
                    Antes de cadastrar, veja se o seu item já não está aqui:
                </p>

                <div className={styles.list}>
                    {matches.map(item => (
                        <div key={item.id} className={styles.itemCard}>
                            <div className={styles.itemImage}>
                                {item.item_photos?.[0]?.url ? (
                                    <img src={item.item_photos[0].url} alt={item.title} />
                                ) : (
                                    <span className={styles.placeholder}>📦</span>
                                )}
                            </div>
                            <div className={styles.itemInfo}>
                                <h3>{item.title}</h3>
                                <p>{item.description}</p>
                                <span className={styles.location}>📍 {item.building_name || item.building}</span>
                            </div>
                            <button
                                className={styles.matchBtn}
                                onClick={() => onConfirmMatch(item)}
                            >
                                É esse!
                            </button>
                        </div>
                    ))}
                </div>

                <div className={styles.footer}>
                    <button className={styles.continueBtn} onClick={onClose}>
                        Não é nenhum desses, continuar cadastro
                    </button>
                </div>
            </div>
        </div>
    );
}
