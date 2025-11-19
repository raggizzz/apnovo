import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: "🔍",
      title: "Busca Inteligente",
      description: "Encontre objetos perdidos com tecnologia de busca avançada por categoria, cor e localização."
    },
    {
      icon: "📱",
      title: "Notificações em Tempo Real",
      description: "Receba alertas instantâneos quando um objeto correspondente for encontrado no campus."
    },
    {
      icon: "🗺️",
      title: "Geolocalização Precisa",
      description: "Identifique exatamente onde o objeto foi perdido ou encontrado com mapas interativos."
    },
    {
      icon: "💬",
      title: "Chat Seguro",
      description: "Comunique-se diretamente com quem encontrou seu objeto de forma segura e privada."
    },
    {
      icon: "🔐",
      title: "100% Seguro",
      description: "Seus dados protegidos com autenticação e criptografia de ponta a ponta."
    },
    {
      icon: "⚡",
      title: "Rápido e Fácil",
      description: "Cadastre objetos em menos de 2 minutos com nosso fluxo intuitivo de 3 passos."
    }
  ];

  return (
    <div className={styles.landing}>
      {/* Header */}
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <img src="/src/components/images/undflogo.png" alt="UnDF" className={styles.logoImage} />
          </div>
          <nav className={styles.nav}>
            <a href="#features">Recursos</a>
            <a href="#how-it-works">Como Funciona</a>
            <button className={styles.btnLogin} onClick={() => navigate("/login")}>
              Entrar
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.heroShape1}></div>
          <div className={styles.heroShape2}></div>
          <div className={styles.heroShape3}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Perdeu algo no campus?
              <span className={styles.heroTitleHighlight}> Nós ajudamos você a encontrar.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Sistema inteligente de achados e perdidos da UnDF. Conecte-se com quem encontrou seu objeto
              em segundos com tecnologia de busca avançada e notificações em tempo real.
            </p>
            <div className={styles.heroButtons}>
              <button className={styles.btnPrimary} onClick={() => navigate("/lost")}>
                <span>Perdi um Objeto</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className={styles.btnSecondary} onClick={() => navigate("/found")}>
                <span>Encontrei um Objeto</span>
              </button>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroCard}>
              <div className={styles.heroCardIcon}>🔑</div>
              <div className={styles.heroCardContent}>
                <h3>Chaves Encontradas</h3>
                <p>Bloco A - Sala 203</p>
                <span className={styles.heroCardTime}>Há 5 minutos</span>
              </div>
            </div>
            <div className={`${styles.heroCard} ${styles.heroCard2}`}>
              <div className={styles.heroCardIcon}>📱</div>
              <div className={styles.heroCardContent}>
                <h3>Celular iPhone</h3>
                <p>Biblioteca Central</p>
                <span className={styles.heroCardTime}>Há 1 hora</span>
              </div>
            </div>
            <div className={`${styles.heroCard} ${styles.heroCard3}`}>
              <div className={styles.heroCardIcon}>🎒</div>
              <div className={styles.heroCardContent}>
                <h3>Mochila Azul</h3>
                <p>Cantina Principal</p>
                <span className={styles.heroCardTime}>Há 3 horas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Recursos</span>
            <h2 className={styles.sectionTitle}>Tudo que você precisa em um só lugar</h2>
            <p className={styles.sectionSubtitle}>
              Tecnologia de ponta para conectar pessoas e objetos perdidos de forma rápida e segura
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.howItWorks}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Processo</span>
            <h2 className={styles.sectionTitle}>Como funciona?</h2>
            <p className={styles.sectionSubtitle}>
              Três passos simples para recuperar seu objeto perdido
            </p>
          </div>
          <div className={styles.stepsGrid}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Cadastre o Objeto</h3>
                <p className={styles.stepDescription}>
                  Descreva o objeto perdido ou encontrado com detalhes como categoria, cor, local e adicione fotos.
                </p>
              </div>
              <div className={styles.stepIcon}>📝</div>
            </div>
            <div className={styles.stepConnector}></div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Receba Notificações</h3>
                <p className={styles.stepDescription}>
                  Nosso sistema inteligente busca correspondências e envia alertas automáticos em tempo real.
                </p>
              </div>
              <div className={styles.stepIcon}>🔔</div>
            </div>
            <div className={styles.stepConnector}></div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>Recupere seu Objeto</h3>
                <p className={styles.stepDescription}>
                  Entre em contato via chat seguro e combine a devolução no local mais conveniente.
                </p>
              </div>
              <div className={styles.stepIcon}>✅</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Pronto para encontrar seu objeto?</h2>
          <p className={styles.ctaSubtitle}>
            Junte-se à comunidade acadêmica e ajude a manter nosso campus organizado e seguro.
          </p>
          <div className={styles.ctaButtons}>
            <button className={styles.btnPrimary} onClick={() => navigate("/lost")}>
              Começar Agora
            </button>
            <button className={styles.btnOutline} onClick={() => navigate("/about")}>
              Saiba Mais
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerColumn}>
              <img src="/src/components/images/undflogo.png" alt="UnDF" className={styles.footerLogo} />
              <p className={styles.footerDescription}>
                Sistema oficial de Achados e Perdidos da Universidade do Distrito Federal.
                Conectando a comunidade acadêmica com eficiência e segurança.
              </p>
            </div>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerTitle}>Navegação</h4>
              <ul className={styles.footerLinks}>
                <li><a href="#features">Recursos</a></li>
                <li><a href="#how-it-works">Como Funciona</a></li>
                <li><a href="/login">Entrar</a></li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerTitle}>Institucional</h4>
              <ul className={styles.footerLinks}>
                <li><a href="https://undf.edu.br" target="_blank" rel="noopener noreferrer">Site Oficial</a></li>
                <li><a href="https://undf.edu.br/sobre" target="_blank" rel="noopener noreferrer">Sobre a UnDF</a></li>
                <li><a href="/privacy">Privacidade</a></li>
              </ul>
            </div>
            <div className={styles.footerColumn}>
              <h4 className={styles.footerTitle}>Contato</h4>
              <ul className={styles.footerLinks}>
                <li>� SHIN CA 02, Lote 24 - Lago Norte</li>
                <li>🏢 Brasília - DF, 71503-502</li>
                <li>� contato@undf.edu.br</li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} UnDF - Universidade do Distrito Federal. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
