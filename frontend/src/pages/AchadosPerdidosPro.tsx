import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./AchadosPerdidosPro.module.css";
import { AccessibilityControls } from "../components/AccessibilityControls";
import { ItemFormModal } from "../components/ItemFormModal";
import { ItemDetailsModal } from "../components/ItemDetailsModal";

// Types
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
}

export function AchadosPerdidosPro() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLostPage = location.pathname === "/lost";

  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Fetch items
  useEffect(() => {
    fetchItems();
  }, [isLostPage]);

  async function fetchItems() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('type', isLostPage ? 'LOST' : 'FOUND')
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter items
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.building_name && item.building_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAudioDescription = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    window.speechSynthesis.cancel(); // Stop any previous speech

    const locationText = item.location || item.building_name || "Local não informado";

    // Clean description (remove "Data: ...")
    const cleanDescription = item.description.replace(/Data: \d{2}\/\d{2}\/\d{4}\n\n/, '').trim();

    // Extract date if possible
    const dateMatch = item.description.match(/Data: (\d{2}\/\d{2}\/\d{4})/);
    const dateText = dateMatch ? dateMatch[1] : new Date(item.created_at).toLocaleDateString();

    const text = `Item: ${item.title}. Categoria: ${item.category}. Data: ${dateText}. Local: ${locationText}. Descrição: ${cleanDescription}`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <div className={styles.logo} onClick={() => navigate("/")}>
              <div className={styles.logoIcon}></div>
              UnDF Connect
            </div>
            <nav className={styles.nav}>
              <a
                href="#"
                className={`${styles.navLink} ${isLostPage ? styles.active : ''}`}
                onClick={(e) => { e.preventDefault(); navigate("/lost"); }}
              >
                Perdidos
              </a>
              <a
                href="#"
                className={`${styles.navLink} ${!isLostPage ? styles.active : ''}`}
                onClick={(e) => { e.preventDefault(); navigate("/found"); }}
              >
                Achados
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <h1 className={styles.pageTitle}>
              {isLostPage ? "Itens Perdidos" : "Itens Encontrados"}
            </h1>

            <div className={styles.controls}>
              <div className={styles.searchWrapper}>
                <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Buscar por nome, local ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <button className={styles.filterBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="4" y1="21" x2="4" y2="14"></line>
                  <line x1="4" y1="10" x2="4" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12" y2="3"></line>
                  <line x1="20" y1="21" x2="20" y2="16"></line>
                  <line x1="20" y1="12" x2="20" y2="3"></line>
                  <line x1="1" y1="14" x2="7" y2="14"></line>
                  <line x1="9" y1="8" x2="15" y2="8"></line>
                  <line x1="17" y1="16" x2="23" y2="16"></line>
                </svg>
                Filtros
              </button>

              <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                {isLostPage ? "Relatar Perda" : "Relatar Achado"}
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className={styles.grid}>
            {loading ? (
              <p>Carregando itens...</p>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={styles.card}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className={styles.cardImageWrapper}>
                    <span className={`${styles.cardStatus} ${item.type === 'LOST' ? styles.statusLost : styles.statusFound}`}>
                      {item.type === 'LOST' ? 'Perdido' : 'Encontrado'}
                    </span>
                    <img
                      src={item.image_url || "https://placehold.co/600x400/f1f5f9/94a3b8?text=Sem+Foto"}
                      alt={item.title}
                      className={styles.cardImage}
                    />
                  </div>
                  <div className={styles.cardContent}>
                    <span className={styles.cardCategory}>{item.category}</span>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <div className={styles.cardMeta}>
                      <div className={styles.cardMetaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {item.location || item.building_name || "Local não informado"}
                      </div>
                      <div className={styles.cardMetaItem}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Audio Description Button */}
                    <button
                      className={styles.audioBtn}
                      onClick={(e) => handleAudioDescription(e, item)}
                      title="Ouvir descrição"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                      Ouvir
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>Nenhum item encontrado.</p>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Form Modal */}
      <ItemFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        type={isLostPage ? 'lost' : 'found'}
        onSuccess={() => {
          fetchItems();
        }}
      />

      {/* Details Modal */}
      <ItemDetailsModal
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        item={selectedItem}
      />

      <AccessibilityControls />
    </div>
  );
}
