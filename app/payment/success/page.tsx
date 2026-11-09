'use client'

import {Suspense, useEffect, useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {paymentService} from "@/services/paymentService";
import './success.css'

export default function PaymentSucceedPage() {
    return (
        <Suspense fallback={<PaymentSuccessFallback />}>
            <PaymentSuccessContent />
        </Suspense>
    )
}

function PaymentSuccessFallback() {
    return (
        <div className="payment-container">
            <div className="container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Esperando confirmação de Pagamento...</p>
                </div>
            </div>
        </div>
    )
}

function PaymentSuccessContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [order, setOrder] = useState<any>(null)

    const verifyPayment = async () => {
        try {
            setLoading(true)
            const result = await paymentService.confirmPayment(sessionId)
            setOrder(result)
        } catch (error: any) {
            setError(error.message || 'Falha na verificação de pagamento.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!sessionId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setError('Nenhuma sessão foi encontrada')
            setLoading(false)
            return
        }
        verifyPayment()
    }, [sessionId, verifyPayment]);

    const formDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div className="payment-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Vrificando seu pagamento...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="payment-container">
                <div className="container">
                    <div className="error-card">
                        <div className="error-icon">❌</div>
                        <h2>Falha na verificação de pagamento</h2>
                        <p>{error}</p>
                        <div className="button-group">
                            <Link href="/orders" className="view-orders-btn">
                                Visualizar Minhas Ordens
                            </Link>
                            <Link href="/products" className="continue-shopping">
                                Continue Comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="payment-container">
            <div className="container">
                <div className="success-card">
                    <div className="success-icon">✓</div>
                    <h1>Pagamento Realizado com Sucesso</h1>
                    <p>Sua Ordem foi paga com sucesso e agora está sendo processada.</p>

                    <div className="order-details">
                        <h2>Detalhes da Ordem</h2>

                        <div className="order-info-grid">
                            <div className="info-row">
                                <span className="label">Ordem ID: </span>
                                <span className="value">#{order?.id}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Status da Ordem: </span>
                                <span className="value status-processing">{order?.status?.toUpperCase()}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Total Pago: </span>
                                <span className="value total">R$ {parseFloat(order?.total_price).toLocaleString("pt-BR",
                                    {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 0}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Endereço: </span>
                                <span className="value"> {order?.shipping_address}</span>
                            </div>

                            <div className="info-row">
                                <span className="label">Data da Ordem: </span>
                                <span className="value"> {formDate(order?.created_at)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="next-steps">
                        <h3>Próximos Passos</h3>
                        <ul>
                            <li>📧 Você receberá um email de confirmação da ordem o mais breve possível</li>
                            <li>🚚 Nossa Equipe processará sua ordem em 24 horas</li>
                            <li>📦 Você pode rastrear o status da sua ordem na página Minhas Ordens</li>
                            <li>💬 Para Qualquer dúvida, contate nossa equipe de suporte</li>
                        </ul>
                    </div>

                    <div className="button-group">
                        <Link href="/orders" className="view-orders-btn">
                            Visualizar Minhas Ordens
                        </Link>
                        <Link href="/products" className="continue-shopping">
                            Continue Comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
