'use client'

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {cartService} from "@/services/cartService";
import {authService} from "@/services/authService";
import './cart.css'

export default function CartPage() {
    const router = useRouter();

    const [cart, setCart] = useState<any>(null)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)

    const fetchCart = async () => {
        try {
            setLoading(true)
            const data = await cartService.getCart();
            setCart(data)
        } catch (error: any) {
            setError(error.message || 'Falha ao carregar carrinho.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push("/login")
            return
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCart()
    }, [router]);

    const updateNavbarContent = () => {
        window.dispatchEvent(new Event("cartUpdated"))
    }

    const handleAddOne = async (productId: number) => {
        setUpdating(true)

        try {
            await cartService.addToCart(productId, 1)
            await fetchCart()
            updateNavbarContent()
        } catch (error: any) {
            setError(error.message || 'Falha ao atualizar o carrinho.')
        } finally {
            setUpdating(false)
        }
    }

    const handleRemoveOne = async (productId: number) => {
        setUpdating(true)

        try {
            await cartService.decrementItem(productId)
            await fetchCart()
            updateNavbarContent()
        } catch (error: any) {
            setError(error.message || 'Falha ao atualizar o carrinho.')
        } finally {
            setUpdating(false)
        }
    }

    const handleRemoveItem = async (productId: number) => {
        if (!confirm('Limpar todo o carrinho?')) return

        setUpdating(true)

        try {
            await cartService.removeItem(productId)
            await fetchCart()
            updateNavbarContent()
        } catch (error: any) {
            setError(error.message || 'Falha ao remover item do carrinho.')
        } finally {
            setUpdating(false)
        }
    }

    const handleClearCart = async () => {
        if (!confirm('Limpar todo o carrinho?')) return

        setUpdating(true)

        try {
            await cartService.clearCart()
            await fetchCart()
            updateNavbarContent()
        } catch (error: any) {
            setError(error.message || 'Falha ao limpar o carrinho.')
        } finally {
            setUpdating(false)
        }
    }

    const handleCheckout = async () => {
        setUpdating(true)

        try {
            const result = await cartService.checkout()

            if (result.checkoutUrl) {
                window.location.href = result.checkoutUrl
            } else {
                router.push("/orders")
            }
        } catch (error: any) {
            setError(error.message || 'Falha ao processar checkout.')
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="cart-container">
                <div className="container">
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Carregando Carrinho...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="cart-container">
                <div className="container">
                    <div className="empty-cart">
                        <div className="empty-cart-icon">🛒</div>
                        <h2>Seu Carrinho de Compras está vazio.</h2>
                        <p>Parece que você não tem adcionado nenhum item no seu carrinho ainda.</p>
                        <Link href="/products" className="shop-now-btn">
                            Continue Comprando
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="cart-container">
            <div className="container">
                <div className="cart-wrapper">
                    <div className="cart-header">
                        <h1>Carrinho de Compras</h1>
                        <p>{cart.totalQuantity} item(ns) no seu carrinho.</p>
                    </div>

                    {error && (
                        <div className="error-alert">
                            <span>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="cart-content">
                        {/* Cart Items */}
                        <div className="cart-items">
                            <div className="cart-items-header">
                                <div className="col-product">Produto</div>
                                <div className="col-price">Preço</div>
                                <div className="col-quantity">Quantidade</div>
                                <div className="col-total">Total</div>
                                <div className="col-action"></div>
                            </div>

                            {cart.items.map((item: any) => (
                                <div key={item.id} className="cart-item">
                                    <div className="col-product">
                                        <div className="product-info">
                                            <img
                                                src={item.productImage}
                                                alt={item.productName}
                                                className="product-image"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.src = '/omages/product.jpeg'
                                                }}
                                            />
                                            <div className="product-details">
                                                <Link href={`/products/${item.productId}`} className="product-name">
                                                    {item.productName}
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-price">
                                        <span>R$ {parseFloat(item.productPrice).toLocaleString("pt-BR",
                                            {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>

                                    <div className="col-quantity">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={(e) => handleRemoveOne(item.productId)}
                                                disabled={updating}
                                                className="qty-btn"
                                            >
                                                -
                                            </button>
                                            <span className="qty-value">R$ {item.quantity}</span>
                                            <button
                                                onClick={(e) => handleAddOne(item.productId)}
                                                disabled={updating}
                                                className="qty-btn"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    <div className="col-total">
                                        <span className="price">
                                            R$ {item.subtotal.toLocaleString("pt-BR",
                                            {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                        </span>
                                    </div>

                                    <div className="col-action">
                                        <button
                                            onClick={(e) => handleRemoveItem(item.productId)}
                                            disabled={updating}
                                            className="remove-btn"
                                            title="Remover Item"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <div className="cart-actions">
                                <button
                                    onClick={handleClearCart}
                                    disabled={updating}
                                    className="clear-cart-btn"
                                >
                                    Limpar Carrinho️
                                </button>
                                <Link href="/products" className="continue-shopping">
                                    Continue Comprando
                                </Link>
                            </div>
                        </div>

                        {/* Cart Summary */}
                        <div className="cart-summary">
                            <h2>Resumo da Ordem</h2>
                            <div className="summary-details">
                                <div className="summary-row">
                                    <span>Subtotal: ({cart.totalQuantity} itens)</span>
                                    <span>R$ {parseFloat(cart.totalPrice)}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Entrega: </span>
                                    <span>Grátis</span>
                                </div>
                                <div className="summary-row">
                                    <span>Taxas: </span>
                                    <span>R$ {parseFloat(cart.totalPrice) * 0.1}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Total: </span>
                                    <span>R$ {parseFloat(cart.totalPrice) * 1.1}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={updating}
                                className="checkout-btn"
                            >
                                {updating ? 'Processando...' : "Ir Para o Checkout"}
                            </button>
                            <p className="payment-info">
                                🔒 Pagamento Seguro Garantido Pelo Stripe
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
