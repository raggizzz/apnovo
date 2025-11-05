import { useState } from "react";
import styles from "./LostItemFlow.module.css";

const STEPS = [
  { number: 1, label: "Contato" },
  { number: 2, label: "Objeto" },
  { number: 3, label: "Resultados" },
];

const CATEGORIES = [
  "Documentos",
  "Chaves",
  "Eletrônicos",
  "Roupas e Acessórios",
  "Material Escolar",
  "Outros",
];

const COLORS = ["Preto", "Branco", "Azul", "Verde", "Vermelho", "Amarelo", "Outro"];

export function LostItemFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    category: "",
    subcategory: "",
    color: "",
    description: "",
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Aqui você faria a chamada à API
    console.log("Submitting:", formData);
    setCurrentStep(3);
  };

  return (
    <div className={styles.page}>
      {/* Header UNDF */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <div className={styles.logoSquare}></div>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>UNDF</span>
              <span className={styles.logoSubtitle}>ACHADOS E PERDIDOS</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className={styles.content}>
        <h1 className={styles.title}>Achados e Perdidos</h1>
        
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {STEPS.map((step) => (
            <div key={step.number} className={styles.stepItem}>
              <div className={`${ styles.stepCircle} ${currentStep >= step.number ? styles.stepActive : ''} ${currentStep > step.number ? styles.stepCompleted : ''}`}>
                {step.number}
              </div>
              <span className={styles.stepLabel}>{step.label}</span>
              {step.number < STEPS.length && (
                <div className={`${styles.stepLine} ${currentStep > step.number ? styles.stepLineActive : ''}`}></div>
              )}
            </div>
          ))}
        </div>

        {currentStep === 1 && (
          <div className={styles.stepContent}>
            <div className="form-group">
              <label className="form-label">Nome completo</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Telefone/Celular</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <button className="btn btn-primary" onClick={handleNext}>
              Continuar
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContent}>
            <p className={styles.instructions}>
              Ótimo, Igor, agora vamos recolher alguns dados sobre o item que você perdeu,
              por favor, preencha os campos abaixo para identificarmos seu objeto:
            </p>

            <div className="form-group">
              <label className="form-label">Categoria(*)</label>
              <select
                className="select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Escolha uma categoria...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Sub-categoria(*)</label>
              <select className="select" value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}>
                <option value="">Escolha uma sub-categoria...</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cor(*)</label>
              <select
                className="select"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              >
                <option value="">Escolha uma cor...</option>
                {COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descreva seu objeto(*)</label>
              <textarea
                className={`input ${styles.textarea}`}
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva características específicas do seu objeto..."
              />
            </div>

            <div className={styles.buttonGroup}>
              <button className="btn btn-secondary" onClick={handleBack}>
                ← Voltar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                Próximo
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContent}>
            <h2 className={styles.resultsTitle}>Argumento de Pesquisa</h2>
            
            <div className={styles.searchBar}>
              <input
                type="text"
                className="input"
                placeholder="Categoria"
              />
            </div>

            <div className={styles.filters}>
              <span className={styles.filterLabel}>Categoria ▼</span>
              <span className={styles.filterLabel}>Cor ▼</span>
              <span className={styles.filterValue}>Verde</span>
            </div>

            <div className={styles.resultsList}>
              <div className={styles.categoryGroup}>
                <h3 className={styles.categoryTitle}>• Chaves</h3>
                <div className={styles.resultCard}>
                  <div className={styles.resultImage}>
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                      <circle cx="40" cy="40" r="30" fill="#E0E0E0"/>
                      <path d="M30 35 L50 35 L50 45 L45 45 L45 50 L35 50 L35 45 L30 45 Z" fill="#9E9E9E"/>
                    </svg>
                  </div>
                  <div className={styles.resultInfo}>
                    <h4 className={styles.resultTitle}>Chaves</h4>
                    <p className={styles.resultSubtitle}>Chave de metal</p>
                  </div>
                </div>
              </div>

              <div className={styles.categoryGroup}>
                <h3 className={styles.categoryTitle}>• Objetos pessoais</h3>
                <div className={styles.resultCard}>
                  <div className={styles.resultImage}>
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                      <rect x="20" y="25" width="40" height="30" rx="2" fill="#E0E0E0"/>
                      <circle cx="40" cy="40" r="8" fill="#9E9E9E"/>
                    </svg>
                  </div>
                  <div className={styles.resultInfo}>
                    <h4 className={styles.resultTitle}>Documentos</h4>
                    <p className={styles.resultSubtitle}>Carteira de identidade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className={styles.footer}>
        <svg width="120" height="40" viewBox="0 0 120 40" fill="none">
          <text x="10" y="25" fill="var(--undf-teal-primary)" fontSize="24" fontWeight="700">UNDF</text>
        </svg>
      </footer>
    </div>
  );
}
