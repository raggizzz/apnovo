import { useState } from 'react';
import styles from './ItemFormModal.module.css';
import { supabase } from '../lib/supabase';

interface ItemFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'lost' | 'found';
    onSuccess: () => void;
}

export function ItemFormModal({ isOpen, onClose, type, onSuccess }: ItemFormModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Eletrônicos',
        location: '',
        date: new Date().toISOString().split('T')[0],
        finder_name: '',
        finder_ra: '',
        campus: 'asa-norte', // Default campus
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Upload image if exists
            let imageUrl = null;
            if (imageFile) {
                const fileExt = imageFile.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `items/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('items-photos')
                    .upload(filePath, imageFile, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('items-photos')
                    .getPublicUrl(filePath);

                imageUrl = publicUrl;
            }

            // 2. Insert item
            const descriptionWithDate = `Data: ${new Date(formData.date || Date.now()).toLocaleDateString()}\n\n${formData.description}`;
            const wantsPoints = type === 'found' && formData.finder_name && formData.finder_ra;

            const campusMap: { [key: string]: { id: string; name: string } } = {
                'asa-norte': { id: 'campus-asa-norte', name: 'Campus Asa Norte' },
                'lago-norte': { id: 'campus-lago-norte', name: 'Campus Lago Norte' },
                'riacho-fundo': { id: 'campus-riacho-fundo', name: 'Campus Riacho Fundo' },
                'samambaia': { id: 'campus-samambaia', name: 'Campus Samambaia' }
            };
            const selectedCampus = campusMap[formData.campus] || campusMap['asa-norte']!;

            const { error } = await supabase.from('items').insert({
                owner_id: user ? user.id : null,
                title: formData.title,
                description: descriptionWithDate,
                category: formData.category,
                location: formData.location,
                type: type === 'lost' ? 'LOST' : 'FOUND',
                status: 'OPEN',
                finder_name: formData.finder_name || null,
                finder_ra: formData.finder_ra || null,
                points_status: wantsPoints ? 'PENDING' : 'NONE',
                campus_id: selectedCampus.id,
                campus_name: selectedCampus.name,
                building_id: 'bloco-a',
                building_name: 'Bloco A',
                lat: -15.7633,
                lng: -47.8706,
                title_normalized: formData.title.toLowerCase(),
                description_normalized: descriptionWithDate.toLowerCase(),
                tags_normalized: [],
                image_url: imageUrl
            });

            if (error) throw error;

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error saving item:', error);
            alert('Erro ao salvar item. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>
                        {type === 'lost' ? 'Relatar Perda' : 'Relatar Achado'}
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    {/* Image Upload */}
                    <div
                        className={styles.fileInputWrapper}
                        style={{
                            minHeight: '180px',
                            border: '3px dashed #cbd5e1',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                            cursor: 'pointer',
                            marginBottom: '20px'
                        }}
                    >
                        {previewUrl ? (
                            <>
                                <img src={previewUrl} alt="Preview" className={styles.previewImage} />
                                <button
                                    type="button"
                                    className={styles.removeImageBtn}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setImageFile(null);
                                        setPreviewUrl(null);
                                    }}
                                >
                                    ×
                                </button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className={styles.fileInput}
                                    onChange={handleFileChange}
                                />
                                <div className={styles.filePlaceholder}>
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#3b82f6' }}>
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                        <polyline points="21 15 16 10 5 21"></polyline>
                                    </svg>
                                    <span style={{ fontWeight: '600', color: '#475569', fontSize: '16px' }}>📸 Adicionar foto (opcional)</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>O que foi {type === 'lost' ? 'perdido' : 'encontrado'}?</label>
                        <input
                            type="text"
                            name="title"
                            className={styles.input}
                            placeholder="Ex: iPhone 13, Garrafa Azul..."
                            required
                            value={formData.title}
                            onChange={handleChange}
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Categoria</label>
                            <select
                                name="category"
                                className={styles.select}
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option>Eletrônicos</option>
                                <option>Documentos</option>
                                <option>Roupas</option>
                                <option>Acessórios</option>
                                <option>Material Escolar</option>
                                <option>Outros</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Campus</label>
                            <select
                                name="campus"
                                className={styles.select}
                                value={formData.campus}
                                onChange={handleChange}
                                required
                            >
                                <option value="asa-norte">Campus Asa Norte</option>
                                <option value="lago-norte">Campus Lago Norte</option>
                                <option value="riacho-fundo">Campus Riacho Fundo</option>
                                <option value="samambaia">Campus Samambaia</option>
                            </select>
                        </div>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label className={styles.label}>Data</label>
                            <input
                                type="date"
                                name="date"
                                className={styles.input}
                                required
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Local {type === 'lost' ? 'da perda' : 'do encontro'}</label>
                            <input
                                type="text"
                                name="location"
                                className={styles.input}
                                placeholder="Ex: Bloco A, Biblioteca..."
                                required
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Descrição Detalhada</label>
                        <textarea
                            name="description"
                            className={styles.textarea}
                            placeholder="Descreva características únicas para ajudar na identificação..."
                            required
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Gamification Fields - Only for Found Items */}
                    {type === 'found' && (
                        <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#0f172a' }}>🎮 Ganhar Pontos (Opcional)</h4>
                            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>Quer ganhar pontos na gamificação? Preencha seus dados:</p>

                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Seu Nome</label>
                                    <input
                                        type="text"
                                        name="finder_name"
                                        className={styles.input}
                                        placeholder="Ex: João Silva"
                                        value={formData.finder_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className={styles.formGroup}>
                                    <label className={styles.label}>Sua Matrícula</label>
                                    <input
                                        type="text"
                                        name="finder_ra"
                                        className={styles.input}
                                        placeholder="Ex: 202312345"
                                        value={formData.finder_ra}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </form>

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose} type="button">
                        Cancelar
                    </button>
                    <button
                        className={styles.submitBtn}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar Registro'}
                    </button>
                </div>
            </div>
        </div>
    );
}
