'use client'

import React, {Suspense, useState, useEffect} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import './reset-password.css'


export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordContent />
        </Suspense>
    )
}

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [formData, setFormData] = useState({
        code: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const codeFromUrl = searchParams.get('code');
        if (codeFromUrl) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData(prev => ({
                ...prev,
                code: codeFromUrl,
            }))
        }
    }, [searchParams]);

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
        setError('')
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setError('Nova senha não corresponde com a confirmação')
            return
        }

        if (formData.password.length < 6) {
            setError('Nova senha deve ter pelo menos 6 caracteres')
            return
        }

        if (formData.code.length !== 6) {
            setError('Código de recuperação de senha deve ter pelo menos 6 caracteres')
            return
        }

        setLoading(true)
        setError('')

        try {
            await authService.resetPassword(
                formData.code,
                formData.password,
            )

            setSuccess(true)
            setTimeout(() => {
                router.push('/')
            }, 3000)
        } catch (error: any) {
            setError(error.message && error.message !== 'API Request Failed' ? error.message : 'Falha ao recuperar a senha. Por favor check seu código e tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="reset-container">
                <div className="reset-card">
                    <div className="success-icon">✅</div>
                    <h1>Senha recuperada com sucesso</h1>
                    <p>Sua senha foi alterada com sucesso</p>
                    <div className="info-box">
                        <p>Redirecionando para a página de login....</p>
                    </div>
                    <div className="button-group">
                        <Link href="/login" className="logim-btn">
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="reset-container">
            <div className="reset-card">
                <div className="reset-header">
                    <h1>Recuperar a Senha?</h1>
                    <p>Digite os 6 digitos do código que enviamos para o seu email e recupere sua senha.</p>
                </div>

                {error && (
                    <div className="error-alert">
                        <span>⚠️</span>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="reset-form">
                    <div className="form-group">
                        <label htmlFor="code">Código</label>
                        <input
                            type="text"
                            id="code"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            required
                            placeholder="Digite o código"
                            maxLength={6}
                            disabled={loading}
                        />
                        <small>Check seu Email para ver se recebeu o código de 6 digitos</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Nova Senha</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Digite a nova senha (min 6 caracteres)"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirme a nova senha"
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Recuperando...' : 'Recuperar Senha'}
                    </button>
                </form>

                <div className="reset-footer">
                    <p>
                        <Link href="/forgot-password">Requisitar novo código</Link>
                    </p>
                    <p>Lembrou sua senha? <Link href="/login">Voltar para o login</Link></p>
                </div>
            </div>
        </div>
    )
}

function ResetPasswordFallback() {
    return (
        <div className="reset-container">
            <div className="reset-card">
                <div className="loading-spinner"></div>
                <p>Carregando...</p>
            </div>
        </div>
    )
}
