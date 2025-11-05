import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabase";
import styles from "./AchadosPerdidosPro.module.css";

interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  color: string;
  campus: string;
  building: string;
  date: string;
  status: "found" | "lost";
  photoUrl?: string;
  timestamp?: Date;
}

// Função para calcular tempo relativo
const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `Há ${minutes} min`;
  if (hours < 24) return `Há ${hours}h`;
  if (days === 1) return "Ontem";
  return `Há ${days} dias`;
};

const CATEGORIES = [
  { id: "eletronicos", name: "Eletrônicos", icon: "📱" },
  { id: "documentos", name: "Documentos", icon: "📄" },
  { id: "chaves", name: "Chaves", icon: "🔑" },
  { id: "acessorios", name: "Acessórios", icon: "👜" },
  { id: "outros", name: "Outros", icon: "📦" }
];

const COLORS = ["Preto", "Branco", "Azul", "Verde", "Vermelho", "Amarelo", "Cinza", "Marrom", "Rosa", "Roxo"];

export function AchadosPerdidosPro() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("todos");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState<"todos" | "found" | "lost">("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "relevant">("recent");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar items do Supabase
  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          item_photos (
            url,
            position
          )
        `)
        .eq('status', 'OPEN')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Loaded items:', data);

      const formattedItems: Item[] = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        color: item.color || 'N/A',
        campus: item.campus_name,
        building: item.building_name,
        date: getRelativeTime(new Date(item.created_at)),
        status: item.type.toLowerCase() as "found" | "lost",
        photoUrl: item.item_photos?.[0]?.url || null,
        timestamp: new Date(item.created_at)
      }));

      console.log('Formatted items:', formattedItems);
      setItems(formattedItems);
    } catch (error) {
      console.error('Erro ao carregar items:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    color: "",
    campus: "",
    building: "",
    status: "found" as "found" | "lost",
    photo: null as File | null,
    photoPreview: "" as string
  });

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // 1. Upload da foto se houver
      let photoUrl = "";
      if (formData.photo) {
        const fileExt = formData.photo.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Uploading photo:', fileName);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('items-photos')
          .upload(fileName, formData.photo, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }

        console.log('Upload success:', uploadData);

        const { data: { publicUrl } } = supabase.storage
          .from('items-photos')
          .getPublicUrl(fileName);

        photoUrl = publicUrl;
        console.log('Public URL:', photoUrl);
      }

      // 2. Criar item no Supabase
      const { data, error } = await supabase
        .from('items')
        .insert({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          color: formData.color,
          campus_name: formData.campus,
          building_name: formData.building,
          type: formData.status.toUpperCase(),
          status: 'OPEN'
          // owner_id será NULL (sem autenticação por enquanto)
        })
        .select()
        .single();

      if (error) throw error;

      // 3. Adicionar foto se houver
      if (photoUrl && data) {
        console.log('Saving photo to database:', { item_id: data.id, url: photoUrl });
        const { data: photoData, error: photoError } = await supabase
          .from('item_photos')
          .insert({
            item_id: data.id,
            url: photoUrl,
            position: 0
          })
          .select();

        if (photoError) {
          console.error('Photo insert error:', photoError);
        } else {
          console.log('Photo saved:', photoData);
        }
      }

      // 4. Recarregar lista
      await loadItems();
      setShowRegisterModal(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        category: "",
        color: "",
        campus: "",
        building: "",
        status: "found",
        photo: null,
        photoPreview: ""
      });
    } catch (error) {
      console.error('Erro ao cadastrar item:', error);
      alert('Erro ao cadastrar objeto. Tente novamente.');
    }
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCampus("todos");
    setSelectedCategory("todos");
    setSelectedStatus("todos");
  };

  const activeFiltersCount = [
    selectedCampus !== "todos",
    selectedCategory !== "todos",
    selectedStatus !== "todos",
    searchTerm !== ""
  ].filter(Boolean).length;

  let filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = selectedCampus === "todos" || item.campus === selectedCampus;
    const matchesCategory = selectedCategory === "todos" || item.category.toLowerCase() === selectedCategory;
    const matchesStatus = selectedStatus === "todos" || item.status === selectedStatus;
    
    return matchesSearch && matchesCampus && matchesCategory && matchesStatus;
  });

  if (sortBy === "recent") {
    filteredItems = filteredItems.sort((a, b) => 
      (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0)
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <img src="/src/components/images/undflogo.png" alt="UnDF" className={styles.logo} />
          <nav className={styles.nav}>
            <a href="/">Início</a>
            <a href="/lost" className={styles.active}>Achados e Perdidos</a>
          </nav>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.hero}>
            <h1>Achados e Perdidos</h1>
            <p>Achou algo? Publique em 30 segundos. Perdeu? Ative um alerta e nós avisamos você.</p>
          </div>

          <div className={styles.toolbar}>
            <div className={styles.searchWrapper}>
              <div className={styles.searchBar}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                  <path d="M13 13L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Buscar por 'mochila preta', 'RU', 'Biblioteca Bloco A'..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className={styles.clearBtn} onClick={() => setSearchTerm("")}>×</button>
                )}
              </div>
              
              <button className={styles.btnDesktopAdd} onClick={() => setShowRegisterModal(true)}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Cadastrar Objeto
              </button>
            </div>

            <div className={styles.filterBar}>
              <button 
                className={`${styles.filterToggle} ${showFilters ? styles.active : ''}`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Filtros
                {activeFiltersCount > 0 && (
                  <span className={styles.filterBadge}>{activeFiltersCount}</span>
                )}
              </button>

              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className={styles.sortSelect}>
                <option value="recent">Mais recentes</option>
                <option value="relevant">Mais relevantes</option>
              </select>
            </div>
          </div>

          {showFilters && (
            <div className={styles.filtersPanel}>
              <div className={styles.filterGroup}>
                <label>Campus</label>
                <select value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)}>
                  <option value="todos">Todos</option>
                  <option value="Asa Norte">Asa Norte</option>
                  <option value="Samambaia">Samambaia</option>
                  <option value="Riacho Fundo">Riacho Fundo</option>
                  <option value="Lago Norte">Lago Norte</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Categoria</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="todos">Todas</option>
                  <option value="eletrônicos">Eletrônicos</option>
                  <option value="documentos">Documentos</option>
                  <option value="chaves">Chaves</option>
                  <option value="acessórios">Acessórios</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Status</label>
                <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as any)}>
                  <option value="todos">Todos</option>
                  <option value="found">Encontrados</option>
                  <option value="lost">Perdidos</option>
                </select>
              </div>
            </div>
          )}

          {activeFiltersCount > 0 && (
            <div className={styles.activeFilters}>
              <span className={styles.filterLabel}>Filtros ativos:</span>
              {searchTerm && (
                <button className={styles.filterChip} onClick={() => setSearchTerm("")}>
                  "{searchTerm}" ×
                </button>
              )}
              {selectedCampus !== "todos" && (
                <button className={styles.filterChip} onClick={() => setSelectedCampus("todos")}>
                  {selectedCampus} ×
                </button>
              )}
              {selectedCategory !== "todos" && (
                <button className={styles.filterChip} onClick={() => setSelectedCategory("todos")}>
                  {selectedCategory} ×
                </button>
              )}
              {selectedStatus !== "todos" && (
                <button className={styles.filterChip} onClick={() => setSelectedStatus("todos")}>
                  {selectedStatus === "found" ? "Encontrados" : "Perdidos"} ×
                </button>
              )}
              <button className={styles.clearAllBtn} onClick={clearFilters}>
                Limpar todos
              </button>
            </div>
          )}

          <div className={styles.resultsBar}>
            <p>
              <strong>{filteredItems.length}</strong> {filteredItems.length === 1 ? 'resultado' : 'resultados'}
              <span className={styles.separator}>·</span>
              ordenado por {sortBy === "recent" ? "mais recentes" : "relevância"}
              {activeFiltersCount > 0 && (
                <>
                  <span className={styles.separator}>·</span>
                  <button className={styles.linkBtn} onClick={clearFilters}>limpar filtros</button>
                </>
              )}
            </p>
          </div>

          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Carregando objetos...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className={styles.grid}>
              {filteredItems.map((item) => (
                <div key={item.id} className={styles.card}>
                  <div className={styles.cardImage}>
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.title} />
                    ) : (
                      <div className={styles.placeholder}>
                        {item.category === "Eletrônicos" && "📱"}
                        {item.category === "Documentos" && "📄"}
                        {item.category === "Chaves" && "🔑"}
                        {item.category === "Outros" && "📦"}
                      </div>
                    )}
                    <span className={`${styles.statusBadge} ${styles[item.status]}`}>
                      {item.status === "found" ? "✓ ENCONTRADO" : "⚠ PERDIDO"}
                    </span>
                  </div>
                  
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{item.title}</h3>
                    <p className={styles.cardDescription}>{item.description}</p>
                    
                    <div className={styles.cardMeta}>
                      <span>🕐 {item.date}</span>
                      <span className={styles.separator}>·</span>
                      <span>📍 {item.building} · {item.campus}</span>
                    </div>

                    <div className={styles.cardTags}>
                      <span className={styles.tag}>{item.category}</span>
                      <span className={styles.tag}>{item.color}</span>
                    </div>

                    <button className={styles.cardBtn} onClick={() => handleViewDetails(item)}>
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔍</div>
              <h3>Nenhum item encontrado</h3>
              <p>Tente buscar por 'carteira marrom', 'Biblioteca' ou ajuste os filtros</p>
              <button className={styles.btnPrimary} onClick={() => setShowRegisterModal(true)}>
                Cadastrar Objeto
              </button>
            </div>
          )}
        </div>
      </main>

      {/* FAB Mobile */}
      <button className={styles.fab} onClick={() => setShowRegisterModal(true)}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className={styles.modal} onClick={() => setShowRegisterModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cadastrar Objeto</h2>
              <button className={styles.modalClose} onClick={() => setShowRegisterModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.photoSection}>
                <p className={styles.photoHint}>Foto horizontal, enquadre o objeto, fundo neutro</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  style={{ display: 'none' }}
                />
                {formData.photoPreview ? (
                  <div className={styles.photoPreview}>
                    <img src={formData.photoPreview} alt="Preview" />
                    <button
                      type="button"
                      className={styles.photoRemove}
                      onClick={() => setFormData(prev => ({ ...prev, photo: null, photoPreview: "" }))}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className={styles.photoButton}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <rect width="48" height="48" rx="24" fill="#E8F4FF"/>
                      <path d="M24 18V30M18 24H30" stroke="#2B5C9E" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Adicionar Foto</span>
                  </button>
                )}
              </div>

              <div className={styles.segmentedControl}>
                <button
                  type="button"
                  className={formData.status === "found" ? styles.active : ""}
                  onClick={() => setFormData(prev => ({ ...prev, status: "found" }))}
                >
                  Encontrei
                </button>
                <button
                  type="button"
                  className={formData.status === "lost" ? styles.active : ""}
                  onClick={() => setFormData(prev => ({ ...prev, status: "lost" }))}
                >
                  Perdi
                </button>
              </div>

              <div className={styles.formGroup}>
                <label>Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: iPhone 13 Pro Azul"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Descrição *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva características específicas..."
                  rows={3}
                  required
                />
                <span className={styles.hint}>Evite dados sensíveis, ex.: CPF completo</span>
              </div>

              <div className={styles.formGroup}>
                <label>Categoria *</label>
                <div className={styles.chipGroup}>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`${styles.chip} ${formData.category === cat.name ? styles.active : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.name }))}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Cor *</label>
                <div className={styles.chipGroup}>
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`${styles.chip} ${formData.color === color ? styles.active : ""}`}
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Campus *</label>
                  <select
                    value={formData.campus}
                    onChange={(e) => setFormData(prev => ({ ...prev, campus: e.target.value }))}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Asa Norte">Asa Norte</option>
                    <option value="Samambaia">Samambaia</option>
                    <option value="Riacho Fundo">Riacho Fundo</option>
                    <option value="Lago Norte">Lago Norte</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Local *</label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                    placeholder="Biblioteca, Bloco A, RU..."
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setShowRegisterModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnPrimary}>
                  Publicar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className={styles.modal} onClick={() => setShowDetailModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalhes do Objeto</h2>
              <button className={styles.modalClose} onClick={() => setShowDetailModal(false)}>×</button>
            </div>
            
            <div className={styles.detailContent}>
              {selectedItem.photoUrl ? (
                <img src={selectedItem.photoUrl} alt={selectedItem.title} className={styles.detailPhoto} />
              ) : (
                <div className={styles.detailPlaceholder}>
                  {selectedItem.category === "Eletrônicos" && "📱"}
                  {selectedItem.category === "Documentos" && "📄"}
                  {selectedItem.category === "Chaves" && "🔑"}
                  {selectedItem.category === "Outros" && "📦"}
                </div>
              )}
              
              <div className={styles.detailBody}>
                <span className={`${styles.statusBadge} ${styles[selectedItem.status]}`}>
                  {selectedItem.status === "found" ? "✓ ENCONTRADO" : "⚠ PERDIDO"}
                </span>
                
                <h3>{selectedItem.title}</h3>
                <p className={styles.detailDescription}>{selectedItem.description}</p>
                
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Categoria</span>
                    <span className={styles.detailValue}>{selectedItem.category}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Cor</span>
                    <span className={styles.detailValue}>{selectedItem.color}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Campus</span>
                    <span className={styles.detailValue}>{selectedItem.campus}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Local</span>
                    <span className={styles.detailValue}>{selectedItem.building}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Data</span>
                    <span className={styles.detailValue}>{selectedItem.date}</span>
                  </div>
                </div>

                <div className={styles.securityNote}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1L3 3V7C3 10.5 5.5 13.5 8 15C10.5 13.5 13 10.5 13 7V3L8 1Z" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                  <p>Para sua segurança, o contato ocorre por chat interno. Dados pessoais só são exibidos com consentimento.</p>
                </div>
                
                <button className={styles.btnPrimary}>
                  Entrar em Contato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
