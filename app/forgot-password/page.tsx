'use client'

import React, {useState} from "react";
import {authService} from "@/services/authService";
import Link from "next/link";
import './forgot-password.css'


export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess(false)

        try {
            await authService.forgotPassword(email)
            setSuccess(true)
        } catch (error: any) {
            setError(error.message || 'Falha ao enviar o código de recuperação da senha. Por favor Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="forgot-container">
                <div className="forgot-card">
                    <div className="success-icon">📧</div>
                    <h1>Check Seu Email</h1>
                    <p>Nós enviamos um código de recuperação de senha para <strong>{email}</strong></p>
                    <div className="info-box">
                        <p>Por favor check seu email e digite os 6 digitos do código na página de recuperação de senha.</p>
                    </div>
                    <div className="button-group">
                        <Link href="/login" className="back-btn">
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="forgot-container">
            <div className="forgot-card">
                <div className="forgot-header">
                    <h1>Esqueceu a Senha?</h1>
                    <p>Digite seu email e enviaremos a você um código para recuperar sua semha.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="forgot-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            disabled={loading}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Digite seu email"
                        />

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Enviando...' : 'Envar Código'}
                        </button>
                    </div>
                </form>

                <div className="forgot-footer">
                    <p>Lembrou sua senha? <Link href="/login">Voltar para o login</Link></p>
                </div>
            </div>
        </div>
    )
}
