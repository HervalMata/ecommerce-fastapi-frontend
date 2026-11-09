'use client'

import {Suspense, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {paymentService} from "@/services/paymentService";
import Link from "next/link";
import './cancel.css'

export default function PaymentCancelPage() {
    return (
        <Suspense fallback={<PaymentCancelFallback />}>
            <PaymentCancelContent />
        </Suspense>
    )
}

function PaymentCancelFallback() {
    return (
        <div className="payment-container">
            <div className="container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Carregando...</p>
                </div>
            </div>
        </div>
    )
}

function PaymentCancelContent() {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get('session_id')

    const [orderId, setOrderId] = useState<number | null>(null)

    const fetchCancelOrder = async () => {
      try {
          const result = await paymentService.cancelPayment(sessionId)
          if (result?.order_id) {
              setOrderId(result.order_id)
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
          console.error('Falha ao carregar cancelamento da ordem')
      }
    }

    useEffect(() => {
        if (sessionId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            fetchCancelOrder()
        }
    }, [fetchCancelOrder, sessionId]);

    return (
        <div className="payment-container">
            <div className="container">
                <div className="cancel-card">
                    <div className="cancel-icon">✗</div>
                    <h1>Pagamento Cancelado</h1>
                    <p>Seu pagamento foi cancelado. Nenhuma alteração foi feita na sua conta.</p>

                    {orderId && (
                        <div className="order-info">
                            <p>Ordem #{orderId} foi cancelada.Você pode começar uma nova ordem.</p>
                        </div>
                    )}

                    <div className="message-box">
                        <p>O que você pode fazer?</p>
                        <ul>
                            <li>Tentar novamente com o mesmo cartão</li>
                            <li>Revisar os dados do seu pagamento e tentar um diferente metódo de pagamento</li>
                            <li>Procurar o suporte se você necessitar de ajuda</li>
                        </ul>
                    </div>

                    <div className="button-group">
                        <Link href="/cart" className="back-to-cart-btn">
                            ← Voltar para o carrinho
                        </Link>
                        <Link href="/products" className="continue-shopping-btn">
                            Continue Comprando
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
