import { useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from './ItemDetailsModal.module.css';

interface Item {
    id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    created_at: string;
    type: 'LOST' | 'FOUND';
    status: 'OPEN' | 'RESOLVED' | 'EXPIRED';
    image_url?: string;
    building_name?: string;
    campus_name?: string;
    claim_code?: string;
}

interface ItemDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    item: Item | null;
}

export function ItemDetailsModal({ isOpen, onClose, item }: ItemDetailsModalProps) {
    const [loading, setLoading] = useState(false);
    const [generatedCode, setGeneratedCode] = useState<string | null>(null);

    if (!isOpen || !item) return null;

    const cleanDescription = (desc: string) => {
        return desc.replace(/Data: \d{2}\/\d{2}\/\d{4}\n\n/, '').trim();
    };

    const getFormattedDate = () => {
        const dateMatch = item.description.match(/Data: (\d{2}\/\d{2}\/\d{4})/);
        if (dateMatch) return dateMatch[1];
        return new Date(item.created_at).toLocaleDateString();
    };

    const handleClaim = async () => {
        if (!confirm("Tem certeza que este item é seu? Um código será gerado para você apresentar na secretaria.")) return;

        setLoading(true);
        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { error } = await supabase
                .from('items')
                .update({
                    claim_code: code,
                    claim_status: 'PENDING'
                })
                .eq('id', item.id);

            if (error) throw error;
            setGeneratedCode(code);
        } catch (error) {
            console.error('Error claiming item:', error);
            alert('Erro ao gerar código. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const locationText = item.location || item.building_name || 'Local não informado';
    const descriptionText = cleanDescription(item.description);
    const dateText = getFormattedDate();
    const displayCode = generatedCode || item.claim_code;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Detalhes do Item</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <div className={styles.imageSection}>
                        <img
                            src={item.image_url || "https://placehold.co/600x400/f1f5f9/94a3b8?text=Sem+Foto"}
                            alt={item.title}
                            className={styles.image}
                        />
                    </div>

                    <div className={styles.contentSection}>
                        <div className={styles.mainInfo}>
                            <span className={styles.categoryBadge}>{item.category}</span>
                            <h3 className={styles.itemTitle}>{item.title}</h3>
                        </div>

                        <div className={styles.detailsGrid}>
                            <div className={styles.detailItem}>
                                <strong>📅 Data</strong>
                                <span>{dateText}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <strong>📍 Local</strong>
                                <span>{locationText}</span>
                            </div>

                            <div className={styles.detailItem}>
                                <strong>🏫 Campus</strong>
                                <span>{item.campus_name || 'Não especificado'}</span>
                            </div>
                        </div>

                        <div className={styles.descriptionSection}>
                            <strong style={{ display: 'block', marginBottom: '8px', color: '#334155' }}>Descrição</strong>
                            <p className={styles.descriptionText}>{descriptionText}</p>
                        </div>

                        {displayCode ? (
                            <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #bbf7d0', marginTop: '20px', textAlign: 'center' }}>
                                <p style={{ color: '#166534', fontWeight: '600', marginBottom: '8px' }}>Código de Retirada</p>
                                <div style={{ fontSize: '32px', fontWeight: '800', color: '#15803d', letterSpacing: '2px', margin: '10px 0' }}>
                                    {displayCode}
                                </div>
                                <p style={{ color: '#15803d', fontSize: '14px' }}>
                                    Apresente este código na secretaria para retirar seu item.
                                </p>
                            </div>
                        ) : (
                            item.type === 'FOUND' && (
                                <button
                                    className={styles.actionBtn}
                                    onClick={handleClaim}
                                    disabled={loading}
                                    style={{ width: '100%', marginTop: '20px', background: '#2563eb' }}
                                >
                                    {loading ? 'Gerando Código...' : 'É meu! (Gerar Código de Retirada)'}
                                </button>
                            )
                        )}
                    </div>
                </div>

                <div className={styles.footer}>
                    <button className={styles.actionBtn} onClick={onClose} style={{ background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0' }}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
