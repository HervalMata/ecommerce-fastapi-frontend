'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { API_CONFIG } from "@/services/apiUrl";
import './register.css'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
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

        if (formData.password !== formData.confirmPassword) {
            setError('Senhas não coferem')
            return
        }

        if (formData.password.length < 4) {
            setError('A Senha deve ter pelo menos 4 caracteres')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Register as regular customer (no role specified)
            await authService.register({
                email: formData.email,
                name: formData.name,
                password: formData.password,
            })

            // Auto login after registration
            const loginResult = await authService.login({
                email: formData.email,
                name: formData.name,
            })

            authService.saveAuthData(loginResult.token, loginResult.user)
            router.push('/products')
        } catch (error: any) {
            setError(error.message || 'Falha no cadastro. Por favor tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleRegister = () => {
        window.location.href = `${API_CONFIG.API_URL}/auth/google`
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Criar Conta</h1>
                    <p>Junte-se a Cris Laços ainda hoje</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Nome Completo</label>
                        <input 
                            type="text" 
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Digite seu nome completo"
                            disabled={loading}
                        />
                    </div>

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

                    <div className="form-group">
                        <label htmlFor="configPassword">Confirme a Senha</label>
                        <input 
                            type="password" 
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirme sua senha"
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? 'Criando conta...' : 'Cadastrar-se'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Ou cadastre-se com:</p>
                    <button onClick={handleGoogleRegister} className="google-btn">
                        Continuar com Google
                    </button>

                    <p>
                        Já tem uma conta? <Link href='/login'>Entre Aqui</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}