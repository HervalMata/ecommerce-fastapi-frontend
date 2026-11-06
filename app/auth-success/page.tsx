'use client'

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import './success.css'

// Main Page component with Suspense boundary
export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<AuthSuccessFallback />}>
            <AuthSuccessContent />
        </Suspense>
    )
}

function AuthSuccessContent() {
    const router = useRouter()

    const searchParams = useSearchParams()

    const token = searchParams.get('token')
    const role = searchParams.get('role')

    useEffect(() => {
        if (token && role) {
            // Save token and role
            authService.saveAuthData(token, role)

            // Dispatch events
            window.dispatchEvent(new Event('storage'))
            window.dispatchEvent(new CustomEvent('authChange', {
                detail: { isAuthenticated: true, role }
            }))

            // Clear URL params and redirect after short delay
            if (role === 'ADMIN') {
                router.push('/admin/register-user')
            } else if (role === 'DELIVERY') {
                router.push('/dashboard/delivery')
            } else {
                router.push('/products')
            }
        } else {
            
        }
    }, [token, role, router])

    return (
        <div className="auth-success-container">
            <div className="success-card">
                <div className="success-icon"></div>
                <h2>Autenticado com sucesso!</h2>
                <p>Você está autenticado com sucesso</p>
                <div className="loading-spinner"></div>
                <p>Redirecionando você para...</p>
            </div>
        </div>
    )
}

// Loading fallback while suspense is resolving
function AuthSuccessFallback() {
    return (
        <div className="auth-success-container">
            <div className="success-card">
                <div className="loading-spinner"></div>
                <p>Carregando...</p>
            </div>
        </div>
    )
}