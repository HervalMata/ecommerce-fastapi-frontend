'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { API_CONFIG } from "@/services/apiUrl";
import './login.css'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
            email: '',
            password: '',
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        setError('')
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
    
        try {
            // Auto login
            const result = await authService.login({
                email: formData.email,
                password: formData.password,
            })
    
            // Save only token and role to localStorage
            authService.saveAuthData(result.token, result.user)

            // Manually dispatch a storage event to notify other components (like navbar)
            window.dispatchEvent(new Event('storage'))

            // Also dispatch a custom event for immediate update
            window.dispatchEvent(new CustomEvent('authChange', {
                detail: { isAuthenticated: true, role: result.user.role }
            }))

            // Redirect based on role
            if (result.user.role === 'ADMIN') {
                router.push('/admin/dashboard')
            } else if (result.user.role === 'DELIVERY') {
                router.push('/delivery')
            } else {
                router.push('/products')
            }
                
        } catch (error: any) {
            setError(error.message || 'Falha no login. Por favor check suas credênciais.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = () => {
            window.location.href = `${API_CONFIG.API_URL}/auth/google`
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Bemvindo de volta</h1>
                    <p>Entre em sua conta</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            type="email" 
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Digite seu email"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Senha</label>
                        <input 
                            type="password" 
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Digite sua senha (min 6 caracteres)"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div className="auth-footer">
                    <button onClick={handleGoogleLogin} className="google-btn">
                        Continuar com Google
                    </button>
                
                    <p>
                        Não tem uma conta? <Link href='/register'>Cadastre-se Aqui</Link>
                    </p>

                    <p>
                        Esqueceu sua senha? <Link href='/forgot-password'>Recupere Aqui</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}