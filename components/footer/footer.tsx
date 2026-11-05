'use client'

import Link from "next/link";
import './footer.css'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Cris Laços</h3>
                        <p>Sua única parada para produtos de qualidade pelo melhores preços.</p>
                        <div className="social-links">
                            <a href="#" className="social-icon" aria-label="Facebook">
                                📘
                            </a>
                            <a href="#" className="social-icon" aria-label="Instagram">
                                📷
                            </a>
                            <a href="#" className="social-icon" aria-label="Twitter">
                                🐦
                            </a>
                            <a href="#" className="social-icon" aria-label="LikedIn">
                                💼
                            </a>
                        </div>
                    </div>

                    <div className="footer-section">
                        <h3>Links Rápidos</h3>
                        <ul>
                            <link href="/products">Todos os Produtos</link>
                            <link href="/about">Sobre Nós</link>
                            <link href="/contact">Entre em Contato</link>
                            <link href="/faq">FAQ</link>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Serviços Ao Comprador</h3>
                        <ul>
                            <link href="/shipping">Informações de Entrega</link>
                            <link href="/return">Politica de Troca</link>
                            <link href="/terms">Termos e Condições</link>
                            <link href="/piracy">Politica de Privacidade</link>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Cris Laços. Todos os Direitos Reservados.</p>
                </div>
            </div>
        </footer>
    )
}