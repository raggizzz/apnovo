import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./AdminMetrics.module.css";
import { AccessibilityControls } from "../components/AccessibilityControls";

interface Metrics {
    totalItems: number;
    resolvedItems: number;
    openItems: number;
    resolutionRate: number;
}

interface WeeklyData {
    day: string;
    value: number;
}

interface CategoryData {
    label: string;
    value: number;
}

export function AdminMetrics() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState<Metrics>({
        totalItems: 0,
        resolvedItems: 0,
        openItems: 0,
        resolutionRate: 0
    });
    const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

    useEffect(() => {
        fetchMetrics();
    }, []);

    async function fetchMetrics() {
        setLoading(true);
        try {
            // Get total items count
            const { count: totalCount } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true });

            // Get resolved items count
            const { count: resolvedCount } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'RESOLVED');

            // Get open items count
            const { count: openCount } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'OPEN');

            const total = totalCount || 0;
            const resolved = resolvedCount || 0;
            const open = openCount || 0;
            const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

            setMetrics({
                totalItems: total,
                resolvedItems: resolved,
                openItems: open,
                resolutionRate: rate
            });

            // Fetch items from last 7 days for weekly chart
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data: recentItems } = await supabase
                .from('items')
                .select('created_at')
                .gte('created_at', sevenDaysAgo.toISOString());

            // Group by day of week
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            const dayCounts = new Array(7).fill(0);

            recentItems?.forEach(item => {
                const day = new Date(item.created_at).getDay();
                dayCounts[day]++;
            });

            const maxCount = Math.max(...dayCounts, 1);
            const weekly = dayNames.map((day, index) => ({
                day,
                value: Math.round((dayCounts[index] / maxCount) * 100)
            }));

            setWeeklyData(weekly);

            // Fetch category distribution
            const { data: allItems } = await supabase
                .from('items')
                .select('category');

            const categoryCounts: { [key: string]: number } = {};
            allItems?.forEach(item => {
                categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
            });

            const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1);
            const categories = Object.entries(categoryCounts)
                .map(([label, count]) => ({
                    label,
                    value: Math.round((count / maxCategoryCount) * 100)
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 4); // Top 4 categories

            setCategoryData(categories);

        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    }

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
                            <a href="#" className={`${styles.navLink} ${styles.active}`}>Admin</a>
                        </nav>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.dashboardHeader}>
                        <h1>Métricas do Sistema</h1>
                        <p>Visão geral do desempenho e engajamento da plataforma.</p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            Carregando métricas...
                        </div>
                    ) : (
                        <>
                            <div className={styles.kpiGrid}>
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiValue}>{metrics.totalItems.toLocaleString()}</div>
                                    <div className={styles.kpiLabel}>Itens Cadastrados</div>
                                </div>
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiValue}>{metrics.resolutionRate}%</div>
                                    <div className={styles.kpiLabel}>Taxa de Resolução</div>
                                </div>
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiValue}>{metrics.openItems}</div>
                                    <div className={styles.kpiLabel}>Itens Abertos</div>
                                </div>
                                <div className={styles.kpiCard}>
                                    <div className={styles.kpiValue}>{metrics.resolvedItems}</div>
                                    <div className={styles.kpiLabel}>Itens Resolvidos</div>
                                </div>
                            </div>

                            <br /><br />

                            <div className={styles.chartsGrid}>
                                <div className={styles.chartCard}>
                                    <div className={styles.chartHeader}>
                                        <span className={styles.chartTitle}>Atividade Semanal</span>
                                        <span className={styles.chartAction}>Últimos 7 dias</span>
                                    </div>
                                    <div className={styles.chartBody}>
                                        {weeklyData.map((item, i) => (
                                            <div key={i} className={styles.barGroup}>
                                                <div
                                                    className={styles.bar}
                                                    style={{ height: `${item.value || 5}%` }}
                                                ></div>
                                                <span className={styles.barLabel}>{item.day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.chartCard}>
                                    <div className={styles.chartHeader}>
                                        <span className={styles.chartTitle}>Categorias Mais Comuns</span>
                                        <span className={styles.chartAction}>Top 4</span>
                                    </div>
                                    <div className={styles.chartBody}>
                                        {categoryData.length > 0 ? categoryData.map((item, i) => (
                                            <div key={i} className={styles.barGroup}>
                                                <div
                                                    className={styles.bar}
                                                    style={{
                                                        height: `${item.value}%`,
                                                        background: i % 2 === 0 ? 'var(--brand-primary)' : '#94a3b8'
                                                    }}
                                                ></div>
                                                <span className={styles.barLabel}>{item.label}</span>
                                            </div>
                                        )) : (
                                            <div style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>
                                                Nenhum dado disponível
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                </div>
            </main>
            <AccessibilityControls />
        </div>
    );
}
