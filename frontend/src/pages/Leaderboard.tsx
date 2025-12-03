import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./Leaderboard.module.css";
import { AccessibilityControls } from "../components/AccessibilityControls";

interface UserRank {
    id: string;
    name: string;
    points: number;
    rank: number;
    avatar?: string;
    title?: string;
}

export function Leaderboard() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserRank[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    async function fetchLeaderboard() {
        setLoading(true);
        try {
            // Fetch all approved items with finder information
            const { data, error } = await supabase
                .from('items')
                .select('finder_name, finder_ra')
                .eq('points_status', 'APPROVED')
                .not('finder_name', 'is', null)
                .not('finder_ra', 'is', null);

            if (error) throw error;

            // Group by finder and count points (150 per item)
            const pointsMap = new Map<string, { name: string; ra: string; count: number }>();

            data?.forEach((item) => {
                const key = item.finder_ra;
                if (pointsMap.has(key)) {
                    pointsMap.get(key)!.count += 1;
                } else {
                    pointsMap.set(key, {
                        name: item.finder_name,
                        ra: item.finder_ra,
                        count: 1
                    });
                }
            });

            // Convert to UserRank array with 150 points per item
            const leaderboardData: UserRank[] = Array.from(pointsMap.values())
                .map((finder, index) => ({
                    id: finder.ra,
                    name: finder.name,
                    points: finder.count * 150,
                    rank: 0, // Will be set below
                    avatar: '🎖️'
                }))
                .sort((a, b) => b.points - a.points)
                .map((user, index) => ({
                    ...user,
                    rank: index + 1,
                    title: index === 0 ? 'Super Finder' : index === 1 ? 'Explorer' : index === 2 ? 'Helper' : undefined
                }));

            setUsers(leaderboardData);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    }

    const top3 = users.slice(0, 3);
    const rest = users.slice(3);

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
                            <a href="#" className={`${styles.navLink} ${styles.active}`}>Ranking</a>
                        </nav>
                    </div>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.container}>
                    <div className={styles.pageHeader}>
                        <h1>Hall da Fama</h1>
                        <p>Reconhecendo os heróis que ajudam a manter nossa comunidade organizada e honesta.</p>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            Carregando ranking...
                        </div>
                    ) : users.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                            <p style={{ fontSize: '18px', marginBottom: '8px' }}>Ainda não há heróis no ranking!</p>
                            <p style={{ fontSize: '14px' }}>Seja o primeiro a ganhar pontos reportando itens encontrados.</p>
                        </div>
                    ) : (
                        <>
                            {/* Podium */}
                            <div className={styles.podium}>
                                {top3[1] && (
                                    <div className={`${styles.podiumSpot} ${styles.second}`}>
                                        <div className={styles.avatar}>{top3[1].avatar}</div>
                                        <div className={styles.podiumBase}>
                                            <span className={styles.rank}>2</span>
                                            <span className={styles.playerName}>{top3[1].name}</span>
                                            <span className={styles.playerPoints}>{top3[1].points} pts</span>
                                        </div>
                                    </div>
                                )}
                                {top3[0] && (
                                    <div className={`${styles.podiumSpot} ${styles.first}`}>
                                        <div className={styles.avatar}>{top3[0].avatar}</div>
                                        <div className={styles.podiumBase}>
                                            <span className={styles.rank}>1</span>
                                            <span className={styles.playerName}>{top3[0].name}</span>
                                            <span className={styles.playerPoints}>{top3[0].points} pts</span>
                                        </div>
                                    </div>
                                )}
                                {top3[2] && (
                                    <div className={`${styles.podiumSpot} ${styles.third}`}>
                                        <div className={styles.avatar}>{top3[2].avatar}</div>
                                        <div className={styles.podiumBase}>
                                            <span className={styles.rank}>3</span>
                                            <span className={styles.playerName}>{top3[2].name}</span>
                                            <span className={styles.playerPoints}>{top3[2].points} pts</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* List */}
                            {rest.length > 0 && (
                                <div className={styles.list}>
                                    {rest.map((user) => (
                                        <div key={user.id} className={styles.listItem}>
                                            <span className={styles.listRank}>{user.rank}</span>
                                            <div className={styles.listAvatar}>{user.avatar}</div>
                                            <div className={styles.listInfo}>
                                                <span className={styles.listName}>{user.name}</span>
                                                {user.title && <span className={styles.listTitle}>{user.title}</span>}
                                            </div>
                                            <span className={styles.listPoints}>{user.points} pts</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            <AccessibilityControls />
        </div>
    );
}
