'use client'

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import './error.css'

// Main Page component with Suspense boundary
export default function AuthErrorPage() {
    return (
        <Suspense fallback={<AuthErrorFallback />}>
            <AuthErrorContent />
        </Suspense>
    )
}

function AuthErrorContent() {
    const router = useRouter()

    const searchParams = useSearchParams()

    const error = searchParams.get('error')

    useEffect(() => {
        // Redirect after 5 seconds
        const timer = setTimeout(() => {
            router.push('/login')
        }, 5000)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="auth-error-container">
            <div className="error-card">
                <div className="error-icon">✗</div>
                <h2>Falha na AUtenticação</h2>
                <div className="error-message">
                    <p>{error || 'Algo errado aconteceu durante a autenticação.Por favor tente novamente'}</p>
                </div>
                
                <Link href="/login" className="back-link">
                    Voltar para o Login
                </Link>

                <p className="redirect-message">
                    Redirecionando você para a página de login em 5 segundos...
                </p>
            </div>
        </div>
    )
}

// Loading fallback while suspense is resolving
function AuthErrorFallback() {
    return (
        <div className="auth-error-container">
            <div className="error-card">
                <div className="loading-spinner"></div>
                <p>Carregando...</p>
            </div>
        </div>
    )
}