'use client'

import Link from "next/link";
import './home.css'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1 className="hero-title">Bemvindo à Cris Laços</h1>
          <p className="hero-subtitle">
            descubra produtos maravilhosos por preços muitos baixos com entrega rápida
          </p>
          <Link href="/products" className="hero-btn">
            Comece Agora →
          </Link>
        </div>
      </section>

      {/* Feature Section */}
      <section className="features-section">
          <div className="container">
              <h2 className="section-title">Porquê escolher Cris Laços</h2>
              <div className="features-grid">
                  <div className="features-card">
                      <div className="feature-icon">🚚</div>
                      <h3>
                          Entrega Grátis
                      </h3>
                      <p>Entrega grátis nas compras acima de R$ 50,00 </p>
                  <div>

                  <div className="features-card">
                      <div className="feature-icon">🛡️</div>
                      <h3>
                          Pagamento Seguro
                      </h3>
                      <p>Métodos de pagamento 100% seguros </p>
                  </div>

                  <div className="features-card">
                      <div className="feature-icon">⭐</div>
                      <h3>
                          Qualidade nos Produtos
                      </h3>
                      <p>Qualidade Premium garantida </p>
                  </div>

                  <div className="features-card">
                     <div className="feature-icon">💯</div>
                     <h3>
                         Suporte 24/7
                     </h3>
                      <p>Suporte ao comprador dedicado </p>
                  </div>
              </div>
          </div>
              </div>
          </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Pronto pra começar a comprar?</h2>
          <p>Junte-se a milhões de compradores felizes que compram conosco todos os dias</p>
          <Link href="/products" className="cta-btn">
            Veja Nossos Produtos
          </Link>
        </div>
      </section>
    </>
  );
}
