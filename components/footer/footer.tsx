'use client'

import Link from "next/link";
import { useState, useEffect } from "react";
import './footer.css'

export default function Footer() {
    // Definimos o ano atual como o ano de desenvolvimento (ex: 2026) para o SSR estático.
    // Assim o Next.js consegue fazer o build sem erros.
    const [currentYear, setCurrentYear] = useState(2026);

    useEffect(() => {
        // Atualiza para o ano real assim que o componente hidrata no navegador
        setCurrentYear(new Date().getFullYear());
    }, []);

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
                            <Link href="/products">Todos os Produtos</Link>
                            <Link href="/about">Sobre Nós</Link>
                            <Link href="/contact">Entre em Contato</Link>
                            <Link href="/faq">FAQ</Link>
                        </ul>
                    </div>

                    <div className="footer-section">
                        <h3>Serviços Ao Comprador</h3>
                        <ul>
                            <Link href="/shipping">Informações de Entrega</Link>
                            <Link href="/return">Politica de Troca</Link>
                            <Link href="/terms">Termos e Condições</Link>
                            <Link href="/privacy">Politica de Privacidade</Link>
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