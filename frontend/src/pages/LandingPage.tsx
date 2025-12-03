import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: "🔍",
      title: "Busca Inteligente",
      description: "Algoritmos avançados que conectam quem perdeu a quem encontrou em segundos."
    },
    {
      icon: "🛡️",
      title: "Segurança Verificada",
      description: "Identidade confirmada via login institucional para garantir trocas seguras."
    },
    {
      icon: "📍",
      title: "Geolocalização",
      description: "Mapeamento preciso de onde os objetos foram encontrados no campus."
    },
    {
      icon: "⚡",
      title: "Notificações Reais",
      description: "Alertas instantâneos quando um objeto correspondente é cadastrado."
    },
    {
      icon: "📱",
      title: "Mobile First",
      description: "Experiência perfeita em qualquer dispositivo, para usar em movimento."
    },
    {
      icon: "🤝",
      title: "Comunidade",
      description: "Fomentando a honestidade e colaboração entre estudantes e servidores."
    }
  ];

  // Mock data for the live feed animation
  const feedItems = [
    { icon: "📱", title: "iPhone 13 Pro", location: "Biblioteca", time: "2m", type: "lost" },
    { icon: "🔑", title: "Chaves de Carro", location: "Estacionamento", time: "5m", type: "found" },
    { icon: "🎧", title: "AirPods Pro", location: "Cantina", time: "12m", type: "lost" },
    { icon: "📘", title: "Caderno Cálculo", location: "Bloco C", time: "15m", type: "found" },
    { icon: "🕶️", title: "Óculos RayBan", location: "Auditório", time: "28m", type: "lost" },
    { icon: "🎒", title: "Mochila Dell", location: "Laboratório 3", time: "45m", type: "found" },
    { icon: "💳", title: "Cartão Nubank", location: "Secretaria", time: "1h", type: "lost" },
    { icon: "🧥", title: "Casaco Jeans", location: "Pátio Central", time: "2h", type: "found" },
  ];

  // Duplicate items for infinite scroll effect
  const column1 = [...feedItems, ...feedItems];
  const column2 = [...feedItems.reverse(), ...feedItems.reverse()];

  return (
    <div className={styles.landing}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.container}>
          <div className={styles.navContent}>
            <a href="#" className={styles.logo}>
              <div className={styles.logoIcon}></div>
              UnDF Connect
            </a>
            <div className={styles.navLinks}>
              <a href="/lost" className={styles.navLink}>Perdidos</a>
              <a href="/found" className={styles.navLink}>Achados</a>
              <button className={styles.navBtn} onClick={() => navigate("/login")}>
                Acessar Sistema
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1>
                O jeito mais simples de encontrar o que você <span>perdeu</span>.
              </h1>
              <p className={styles.heroSubtitle}>
                O sistema oficial de Achados e Perdidos da UnDF.
                Conectando a comunidade acadêmica com eficiência, segurança e tecnologia.
              </p>
              <div className={styles.heroButtons}>
                <button className={styles.btnPrimary} onClick={() => navigate("/lost")}>
                  Perdi algo
                </button>
                <button className={styles.btnSecondary} onClick={() => navigate("/found")}>
                  Encontrei algo
                </button>
              </div>
            </div>

            {/* Animated Live Feed */}
            <div className={styles.heroVisual}>
              <div className={styles.feedColumn}>
                {column1.map((item, i) => (
                  <div key={`col1-${i}`} className={styles.feedCard}>
                    <div className={styles.feedIcon}>{item.icon}</div>
                    <div className={styles.feedContent}>
                      <div className={styles.feedTitle}>{item.title}</div>
                      <div className={styles.feedMeta}>
                        <span>{item.location}</span>
                        <span className={`${styles.feedStatus} ${item.type === 'lost' ? styles.statusLost : styles.statusFound}`}>
                          {item.type === 'lost' ? 'PERDIDO' : 'ACHADO'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.feedColumn}>
                {column2.map((item, i) => (
                  <div key={`col2-${i}`} className={styles.feedCard}>
                    <div className={styles.feedIcon}>{item.icon}</div>
                    <div className={styles.feedContent}>
                      <div className={styles.feedTitle}>{item.title}</div>
                      <div className={styles.feedMeta}>
                        <span>{item.location}</span>
                        <span className={`${styles.feedStatus} ${item.type === 'lost' ? styles.statusLost : styles.statusFound}`}>
                          {item.type === 'lost' ? 'PERDIDO' : 'ACHADO'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>Todos</span>
              <span className={styles.statLabel}>da UNDF</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>3min</span>
              <span className={styles.statLabel}>tempo medio para colocar algum item</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>disponibilidade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>Por que usar?</span>
            <h2 className={styles.sectionTitle}>Tecnologia a favor da comunidade</h2>
            <p className={styles.sectionDesc}>
              Desenvolvemos uma plataforma robusta para resolver um problema antigo de forma moderna.
            </p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureText}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Pronto para começar?</h2>
            <p className={styles.ctaText}>
              Junte-se a milhares de estudantes e servidores que já estão usando o UnDF Connect para manter nosso campus mais organizado.
            </p>
            <button className={styles.ctaBtn} onClick={() => navigate("/login")}>
              Criar Conta Gratuita
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <h3>UnDF Connect</h3>
              <p className={styles.footerDesc}>
                Facilitando a vida acadêmica através da tecnologia.
                Feito com ❤️ em Brasília.
              </p>
            </div>
            <div className={styles.footerCol}>
              <h4>Plataforma</h4>
              <ul>
                <li><a href="/lost">Perdi um Objeto</a></li>
                <li><a href="/found">Encontrei um Objeto</a></li>
                <li><a href="/login">Login / Cadastro</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Institucional</h4>
              <ul>
                <li><a href="#">Sobre a UnDF</a></li>
                <li><a href="#">Termos de Uso</a></li>
                <li><a href="#">Privacidade</a></li>
              </ul>
            </div>
            <div className={styles.footerCol}>
              <h4>Suporte</h4>
              <ul>
                <li><a href="#">Central de Ajuda</a></li>
                <li><a href="#">Contato</a></li>
                <li><a href="#">Reportar Bug</a></li>
              </ul>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2024 Universidade do Distrito Federal. Todos os direitos reservados.</p>
            <div className={styles.socialLinks}>
              {/* Social Icons could go here */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
