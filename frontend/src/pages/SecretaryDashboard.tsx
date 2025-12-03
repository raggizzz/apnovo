import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./SecretaryDashboard.module.css";
import { AccessibilityControls } from "../components/AccessibilityControls";

interface PendingItem {
    id: string;
    title: string;
    description: string;
    category: string;
    finder_name: string;
    finder_ra: string;
    created_at: string;
    status: string;
    claim_code?: string;
}

export function SecretaryDashboard() {
    const navigate = useNavigate();
    const [items, setItems] = useState<PendingItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        total: 0
    });

    useEffect(() => {
        fetchItems();
    }, []);

    async function fetchItems() {
        setLoading(true);
        try {
            // Fetch pending items (for gamification - people who found items and want points)
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('points_status', 'PENDING')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setItems(data || []);

            // Fetch real stats
            const [approvedRes, rejectedRes] = await Promise.all([
                supabase.from('items').select('id', { count: 'exact', head: true }).eq('points_status', 'APPROVED'),
                supabase.from('items').select('id', { count: 'exact', head: true }).eq('points_status', 'REJECTED')
            ]);

            const approvedCount = approvedRes.count || 0;
            const rejectedCount = rejectedRes.count || 0;

            setStats({
                pending: data?.length || 0,
                approved: approvedCount,
                rejected: rejectedCount,
                total: (data?.length || 0) + approvedCount + rejectedCount
            });

        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleApprove = async (id: string) => {
        try {
            const { error } = await supabase
                .from('items')
                .update({
                    points_status: 'APPROVED'
                })
                .eq('id', id);

            if (error) throw error;
            fetchItems(); // Refresh
        } catch (error) {
            console.error('Error approving item:', error);
            alert('Erro ao aprovar item.');
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm('Tem certeza que deseja rejeitar esta solicitação?')) return;

        try {
            const { error } = await supabase
                .from('items')
                .update({ points_status: 'REJECTED' })
                .eq('id', id);

            if (error) throw error;
            fetchItems(); // Refresh
        } catch (error) {
            console.error('Error rejecting item:', error);
            alert('Erro ao rejeitar item.');
        }
    };

    const [validationCode, setValidationCode] = useState("");
    const [foundItem, setFoundItem] = useState<PendingItem | null>(null);

    const handleSearchCode = async () => {
        if (!validationCode) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('items')
                .select('*')
                .eq('claim_code', validationCode.toUpperCase())
                .eq('claim_status', 'PENDING')
                .single();

            if (error) {
                alert('Código não encontrado ou inválido.');
                setFoundItem(null);
            } else {
                setFoundItem(data);
            }
        } catch (error) {
            console.error('Error searching code:', error);
            alert('Erro ao buscar código.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmClaim = async () => {
        if (!foundItem) return;
        if (!confirm(`Confirmar entrega do item "${foundItem.title}"?`)) return;

        try {
            const { error } = await supabase
                .from('items')
                .update({
                    status: 'RESOLVED',
                    claim_status: 'APPROVED',
                    points_status: 'APPROVED' // Approve points automatically when confirming delivery
                })
                .eq('id', foundItem.id);

            if (error) throw error;

            alert('Item entregue com sucesso! Pontos aprovados automaticamente.');
            setFoundItem(null);
            setValidationCode("");
            fetchItems(); // Refresh pending list if needed
        } catch (error) {
            console.error('Error confirming claim:', error);
            alert('Erro ao confirmar entrega.');
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.container}>
                    <div className={styles.headerContent}>
                        <div className={styles.logo} onClick={() => navigate("/")}>
                            <div className={styles.logoIcon}></div>
                            UnDF Connect
                        </div>
                        <nav className={styles.nav}>
                            <a href="#" className={styles.navLink} onClick={() => navigate("/")}>Início</a>
                            <a href="#" className={`${styles.navLink} ${styles.active}`}>Secretaria</a>
                        </nav>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.container}>

                    <div className={styles.dashboardHeader}>
                        <div className={styles.titleSection}>
                            <h1>Painel da Secretaria</h1>
                            <p>Gerencie solicitações de resgate e validação de pontos.</p>
                        </div>
                        <button className={styles.refreshBtn} onClick={fetchItems}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M23 4v6h-6M1 20v-6h6"></path>
                                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                            </svg>
                            Atualizar
                        </button>
                    </div>

                    {/* Validation Section */}
                    <div className={styles.validationSection} style={{ background: '#fff', padding: '24px', borderRadius: '16px', marginBottom: '32px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Validar Retirada de Item</h2>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#64748b', marginBottom: '6px' }}>Código de Retirada</label>
                                <input
                                    type="text"
                                    placeholder="Ex: X7K9P2"
                                    value={validationCode}
                                    onChange={(e) => setValidationCode(e.target.value.toUpperCase())}
                                    style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '16px', textTransform: 'uppercase' }}
                                />
                            </div>
                            <button
                                onClick={handleSearchCode}
                                style={{ padding: '12px 24px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                            >
                                Buscar
                            </button>
                        </div>

                        {foundItem && (
                            <div style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Item Encontrado:</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Título</span>
                                        <p style={{ fontWeight: '500', color: '#0f172a' }}>{foundItem.title}</p>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Categoria</span>
                                        <p style={{ fontWeight: '500', color: '#0f172a' }}>{foundItem.category || 'Geral'}</p>
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' }}>Descrição</span>
                                        <p style={{ fontWeight: '500', color: '#0f172a' }}>{foundItem.description}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleConfirmClaim}
                                    style={{ width: '100%', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}
                                >
                                    Confirmar Entrega e Baixar Item
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Metrics */}
                    <div className={styles.statsGrid}>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Pendentes</span>
                                <div className={styles.statIcon}>⏳</div>
                            </div>
                            <span className={styles.statValue}>{stats.pending}</span>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Aprovados (Mês)</span>
                                <div className={styles.statIcon}>✅</div>
                            </div>
                            <span className={styles.statValue}>{stats.approved}</span>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Rejeitados (Mês)</span>
                                <div className={styles.statIcon}>❌</div>
                            </div>
                            <span className={styles.statValue}>{stats.rejected}</span>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>Total Processado</span>
                                <div className={styles.statIcon}>📊</div>
                            </div>
                            <span className={styles.statValue}>{stats.total}</span>
                        </div>
                    </div>

                    {/* Table */}
                    <div className={styles.tableSection}>
                        <div className={styles.tableHeader}>
                            <h2 className={styles.tableTitle}>Solicitações de Pontos (Gamificação)</h2>
                            <div className={styles.tableActions}>
                                <input type="text" placeholder="Buscar por RA ou Nome..." className={styles.searchTable} />
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Item</th>
                                        <th>Quem Encontrou</th>
                                        <th>RA</th>
                                        <th>Data</th>
                                        <th>Status</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading && !foundItem ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Carregando...</td>
                                        </tr>
                                    ) : items.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>Nenhuma solicitação de pontos pendente.</td>
                                        </tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr key={item.id}>
                                                <td>
                                                    <strong>{item.title}</strong>
                                                    <br />
                                                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.description}</span>
                                                </td>
                                                <td>{item.finder_name || 'Anônimo'}</td>
                                                <td>{item.finder_ra || '-'}</td>
                                                <td>{new Date(item.created_at).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`${styles.statusBadge} ${styles.statusPending}`}>
                                                        Pendente
                                                    </span>
                                                </td>
                                                <td>
                                                    <button className={`${styles.actionBtn} ${styles.btnApprove}`} onClick={() => handleApprove(item.id)}>
                                                        Aprovar
                                                    </button>
                                                    <button className={`${styles.actionBtn} ${styles.btnReject}`} onClick={() => handleReject(item.id)}>
                                                        Rejeitar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
            <AccessibilityControls />
        </div>
    );
}
