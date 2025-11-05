import { useState, useRef } from "react";
import styles from "./AchadosPerdidos.module.css";

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
}

const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    title: "iPhone 13 Pro Azul",
    description: "Encontrado na biblioteca, tem uma capinha transparente",
    category: "Eletrônicos",
    color: "Azul",
    campus: "Asa Norte",
    building: "Biblioteca Central",
    date: "Há 2 horas",
    status: "found"
  },
  {
    id: "2",
    title: "Carteira de couro marrom",
    description: "Perdida no RU, contém documentos",
    category: "Documentos",
    color: "Marrom",
    campus: "Samambaia",
    building: "Restaurante Universitário",
    date: "Há 5 horas",
    status: "lost"
  },
  {
    id: "3",
    title: "Chaves com chaveiro UnDF",
    description: "Molho de 3 chaves com chaveiro vermelho",
    category: "Chaves",
    color: "Prata",
    campus: "Riacho Fundo",
    building: "Bloco A",
    date: "Ontem",
    status: "found"
  },
  {
    id: "4",
    title: "Notebook Dell Inspiron",
    description: "Notebook prata com adesivos de programação",
    category: "Eletrônicos",
    color: "Prata",
    campus: "Lago Norte",
    building: "Laboratório de Informática",
    date: "Há 3 dias",
    status: "found"
  },
  {
    id: "5",
    title: "Mochila preta Nike",
    description: "Mochila com material escolar dentro",
    category: "Outros",
    color: "Preto",
    campus: "Asa Norte",
    building: "Quadra de Esportes",
    date: "Há 1 dia",
    status: "lost"
  },
  {
    id: "6",
    title: "Óculos de grau Ray-Ban",
    description: "Armação preta, encontrado no banheiro",
    category: "Outros",
    color: "Preto",
    campus: "Samambaia",
    building: "Bloco B",
    date: "Há 6 horas",
    status: "found"
  }
];

export function AchadosPerdidos() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("todos");
  const [selectedCategory, setSelectedCategory] = useState("todos");
  const [selectedStatus, setSelectedStatus] = useState<"todos" | "found" | "lost">("todos");
  const [showFilters, setShowFilters] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form state
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: Item = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      color: formData.color,
      campus: formData.campus,
      building: formData.building,
      date: "Agora",
      status: formData.status,
      photoUrl: formData.photoPreview
    };
    
    setItems(prev => [newItem, ...prev]);
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
  };

  const handleViewDetails = (item: Item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = selectedCampus === "todos" || item.campus === selectedCampus;
    const matchesCategory = selectedCategory === "todos" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "todos" || item.status === selectedStatus;
    
    return matchesSearch && matchesCampus && matchesCategory && matchesStatus;
  });

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
          <div className={styles.pageHeader}>
            <h1>Achados e Perdidos</h1>
            <p>Encontre objetos perdidos ou cadastre algo que você achou no campus</p>
          </div>

          <div className={styles.actions}>
            <button className={styles.btnRegister} onClick={() => setShowRegisterModal(true)}>
              Cadastrar Objeto
            </button>
          </div>

          <div className={styles.searchSection}>
            <div className={styles.searchBar}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                <path d="M13 13L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <input
                type="text"
                placeholder="Buscar por nome, descrição, cor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className={styles.clearBtn} onClick={() => setSearchTerm("")}>
                  ×
                </button>
              )}
            </div>

            <button 
              className={styles.filterToggle}
              onClick={() => setShowFilters(!showFilters)}
            >
              Filtros
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M4 8H12M6 12H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {showFilters && (
            <div className={styles.filters}>
              <div className={styles.filterGroup}>
                <label>Campus</label>
                <select value={selectedCampus} onChange={(e) => setSelectedCampus(e.target.value)}>
                  <option value="todos">Todos os campus</option>
                  <option value="Asa Norte">Asa Norte</option>
                  <option value="Samambaia">Samambaia</option>
                  <option value="Riacho Fundo">Riacho Fundo</option>
                  <option value="Lago Norte">Lago Norte</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Categoria</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="todos">Todas as categorias</option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Documentos">Documentos</option>
                  <option value="Chaves">Chaves</option>
                  <option value="Outros">Outros</option>
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

          <div className={styles.results}>
            <div className={styles.resultsHeader}>
              <p>{filteredItems.length} {filteredItems.length === 1 ? 'objeto' : 'objetos'} {searchTerm || selectedCampus !== "todos" || selectedCategory !== "todos" || selectedStatus !== "todos" ? 'encontrado' : 'cadastrado'}s</p>
            </div>

            <div className={styles.itemsGrid}>
              {filteredItems.map((item) => (
                <div key={item.id} className={styles.itemCard}>
                  <div className={styles.itemImage}>
                    {item.photoUrl ? (
                      <img src={item.photoUrl} alt={item.title} className={styles.itemPhoto} />
                    ) : (
                      <div className={styles.imagePlaceholder}>
                        {item.category === "Eletrônicos" && "📱"}
                        {item.category === "Documentos" && "📄"}
                        {item.category === "Chaves" && "🔑"}
                        {item.category === "Outros" && "📦"}
                      </div>
                    )}
                    <span className={`${styles.badge} ${styles[item.status]}`}>
                      {item.status === "found" ? "Encontrado" : "Perdido"}
                    </span>
                  </div>
                  
                  <div className={styles.itemContent}>
                    <h3>{item.title}</h3>
                    <p className={styles.description}>{item.description}</p>
                    
                    <div className={styles.itemDetails}>
                      <span className={styles.detail}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 13C10.3137 13 13 10.3137 13 7C13 3.68629 10.3137 1 7 1C3.68629 1 1 3.68629 1 7C1 10.3137 3.68629 13 7 13Z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M7 4V7L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        {item.date}
                      </span>
                      <span className={styles.detail}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M7 1V3M7 11V13M1 7H3M11 7H13M2.5 2.5L4 4M10 10L11.5 11.5M11.5 2.5L10 4M4 10L2.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        {item.campus}
                      </span>
                    </div>

                    <div className={styles.tags}>
                      <span className={styles.tag}>{item.category}</span>
                      <span className={styles.tag}>{item.color}</span>
                    </div>

                    <button className={styles.btnContact} onClick={() => handleViewDetails(item)}>
                      Ver detalhes
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🔍</div>
                <h3>Nenhum objeto encontrado</h3>
                <p>Tente ajustar os filtros ou fazer uma nova busca</p>
                <button 
                  className={styles.btnClear}
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCampus("todos");
                    setSelectedCategory("todos");
                    setSelectedStatus("todos");
                  }}
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Register Modal */}
      {showRegisterModal && (
        <div className={styles.modal} onClick={() => setShowRegisterModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cadastrar Objeto</h2>
              <button className={styles.modalClose} onClick={() => setShowRegisterModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.photoUpload}>
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
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect width="40" height="40" rx="8" fill="#f0f0f0"/>
                      <path d="M20 14V26M14 20H26" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <span>Tirar/Adicionar Foto</span>
                  </button>
                )}
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "found" | "lost" }))}
                    required
                  >
                    <option value="found">Encontrei</option>
                    <option value="lost">Perdi</option>
                  </select>
                </div>
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
                  placeholder="Descreva o objeto com detalhes..."
                  rows={3}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Categoria *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="Eletrônicos">Eletrônicos</option>
                    <option value="Documentos">Documentos</option>
                    <option value="Chaves">Chaves</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Cor *</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Ex: Azul"
                    required
                  />
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
                    placeholder="Ex: Biblioteca, Bloco A"
                    required
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnCancel} onClick={() => setShowRegisterModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className={styles.btnSubmit}>
                  Cadastrar
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
              
              <div className={styles.detailInfo}>
                <span className={`${styles.detailBadge} ${styles[selectedItem.status]}`}>
                  {selectedItem.status === "found" ? "Encontrado" : "Perdido"}
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
                
                <button className={styles.btnContact}>
                  Entrar em Contato
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <img src="/src/components/images/undflogo.png" alt="UnDF" className={styles.footerLogo} />
          <p>© 2024 UnDF - Sistema de Achados e Perdidos</p>
        </div>
      </footer>
    </div>
  );
}
