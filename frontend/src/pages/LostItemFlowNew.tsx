import { useState } from "react";
import styles from "./LostItemFlowNew.module.css";

const STEPS = [
  { number: 1, label: "Contato", icon: "👤" },
  { number: 2, label: "Objeto", icon: "📦" },
  { number: 3, label: "Resultados", icon: "✓" },
];

const CATEGORIES = [
  { id: "documentos", name: "Documentos", icon: "📄" },
  { id: "chaves", name: "Chaves", icon: "🔑" },
  { id: "eletronicos", name: "Eletrônicos", icon: "📱" },
  { id: "roupas", name: "Roupas e Acessórios", icon: "👕" },
  { id: "material", name: "Material Escolar", icon: "📚" },
  { id: "outros", name: "Outros", icon: "📦" },
];

const COLORS = [
  { id: "preto", name: "Preto", hex: "#000000" },
  { id: "branco", name: "Branco", hex: "#FFFFFF" },
  { id: "azul", name: "Azul", hex: "#2B5C9E" },
  { id: "verde", name: "Verde", hex: "#4CAF50" },
  { id: "vermelho", name: "Vermelho", hex: "#F44336" },
  { id: "amarelo", name: "Amarelo", hex: "#FFC107" },
  { id: "cinza", name: "Cinza", hex: "#9E9E9E" },
  { id: "marrom", name: "Marrom", hex: "#795548" },
];

export function LostItemFlowNew() {
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
    console.log("Submitting:", formData);
    setCurrentStep(3);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <div className={styles.logoContainer}>
            <img 
              src="/src/components/images/undflogo.png" 
              alt="UnDF" 
              className={styles.logo}
            />
          </div>
          <nav className={styles.nav}>
            <a href="/" className={styles.navLink}>Início</a>
            <a href="/lost" className={styles.navLink}>Perdi um Objeto</a>
            <a href="/found" className={styles.navLink}>Encontrei um Objeto</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Achados e Perdidos</h1>
          <p className={styles.heroSubtitle}>
            Sistema inteligente para recuperar objetos perdidos no campus
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.container}>
        {/* Step Indicator */}
        <div className={styles.stepIndicator}>
          {STEPS.map((step, index) => (
            <div key={step.number} className={styles.stepWrapper}>
              <div className={styles.stepItem}>
                <div 
                  className={`${styles.stepCircle} ${
                    currentStep >= step.number ? styles.stepActive : ''
                  } ${currentStep > step.number ? styles.stepCompleted : ''}`}
                >
                  {currentStep > step.number ? (
                    <span className={styles.checkmark}>✓</span>
                  ) : (
                    <span className={styles.stepIcon}>{step.icon}</span>
                  )}
                </div>
                <div className={styles.stepInfo}>
                  <span className={styles.stepNumber}>Passo {step.number}</span>
                  <span className={styles.stepLabel}>{step.label}</span>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${currentStep > step.number ? styles.stepLineActive : ''}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className={styles.formCard}>
          {/* Step 1: Contato */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Informações de Contato</h2>
                <p className={styles.stepDescription}>
                  Precisamos de seus dados para entrar em contato quando encontrarmos seu objeto
                </p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Nome completo <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="Digite seu nome completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Telefone/Celular <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    className={styles.input}
                    placeholder="(61) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    E-mail institucional <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.input}
                    placeholder="seu.email@undf.edu.br"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.btnPrimary} onClick={handleNext}>
                  Continuar
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Objeto */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Descreva o Objeto Perdido</h2>
                <p className={styles.stepDescription}>
                  Quanto mais detalhes você fornecer, mais fácil será encontrar seu objeto
                </p>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Categoria <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.categoryGrid}>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.categoryCard} ${
                          formData.category === cat.id ? styles.categoryActive : ''
                        }`}
                        onClick={() => setFormData({ ...formData, category: cat.id })}
                      >
                        <span className={styles.categoryIcon}>{cat.icon}</span>
                        <span className={styles.categoryName}>{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Cor predominante <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.colorGrid}>
                    {COLORS.map((color) => (
                      <button
                        key={color.id}
                        type="button"
                        className={`${styles.colorOption} ${
                          formData.color === color.id ? styles.colorActive : ''
                        }`}
                        onClick={() => setFormData({ ...formData, color: color.id })}
                        title={color.name}
                      >
                        <div 
                          className={styles.colorCircle}
                          style={{ 
                            backgroundColor: color.hex,
                            border: color.hex === '#FFFFFF' ? '2px solid #E0E0E0' : 'none'
                          }}
                        />
                        <span className={styles.colorName}>{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Descrição detalhada <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={styles.textarea}
                    rows={5}
                    placeholder="Descreva características específicas do objeto: marca, modelo, tamanho, detalhes únicos, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                  <span className={styles.hint}>
                    Dica: Inclua detalhes que só você saberia, como arranhões, adesivos ou marcas específicas
                  </span>
                </div>
              </div>

              <div className={styles.formActions}>
                <button className={styles.btnSecondary} onClick={handleBack}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Voltar
                </button>
                <button className={styles.btnPrimary} onClick={handleSubmit}>
                  Buscar Objetos
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="2"/>
                    <path d="M13 13L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Resultados */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.stepHeader}>
                <h2 className={styles.stepTitle}>Objetos Encontrados</h2>
                <p className={styles.stepDescription}>
                  Encontramos {3} objetos que podem corresponder à sua busca
                </p>
              </div>

              <div className={styles.resultsGrid}>
                {[1, 2, 3].map((item) => (
                  <div key={item} className={styles.resultCard}>
                    <div className={styles.resultImage}>
                      <div className={styles.resultPlaceholder}>
                        <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
                          <rect width="60" height="60" rx="8" fill="#E8F4FF"/>
                          <path d="M30 20L40 30L30 40L20 30L30 20Z" fill="#2B5C9E" opacity="0.3"/>
                        </svg>
                      </div>
                      <div className={styles.resultBadge}>
                        <span>Encontrado</span>
                      </div>
                    </div>
                    <div className={styles.resultContent}>
                      <h3 className={styles.resultTitle}>iPhone 13 Pro Azul</h3>
                      <p className={styles.resultDescription}>
                        Encontrado na Biblioteca Central, 2º andar
                      </p>
                      <div className={styles.resultMeta}>
                        <span className={styles.metaItem}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Há 2 horas
                        </span>
                        <span className={styles.metaItem}>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8 14C10.7614 14 13 11.7614 13 9C13 6.23858 10.7614 4 8 4C5.23858 4 3 6.23858 3 9C3 11.7614 5.23858 14 8 14Z" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M8 1V4M8 14V16M1 9H3M13 9H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          Campus Darcy Ribeiro
                        </span>
                      </div>
                      <button className={styles.btnContact}>
                        Entrar em Contato
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.noResults}>
                <p className={styles.noResultsText}>
                  Não encontrou seu objeto? 
                  <button className={styles.linkButton} onClick={() => setCurrentStep(1)}>
                    Refazer busca
                  </button>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className={styles.helpSection}>
          <div className={styles.helpCard}>
            <div className={styles.helpIcon}>💡</div>
            <h3 className={styles.helpTitle}>Dicas para encontrar seu objeto</h3>
            <ul className={styles.helpList}>
              <li>Seja específico na descrição</li>
              <li>Mencione características únicas</li>
              <li>Indique o local aproximado onde perdeu</li>
              <li>Verifique regularmente os novos objetos encontrados</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <img 
              src="/src/components/images/undflogo.png" 
              alt="UnDF" 
              className={styles.footerLogo}
            />
            <p className={styles.footerText}>
              © 2024 UnDF - Universidade do Distrito Federal<br />
              Sistema de Achados e Perdidos
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
