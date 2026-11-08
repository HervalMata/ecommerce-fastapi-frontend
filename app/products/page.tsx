'use client'

import { useState, Suspense, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/authService";
import { productService } from "@/services/productService";
import { reviewService } from "@/services/reviewService";
import { cartService } from "@/services/cartService";
import './products.css'

// 1. Componente de conteúdo que consome os parâmetros de busca com segurança
function ProductsContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    const categoryId = searchParams.get('categoryId')

    const [products, setProducts] = useState<any[]>([])
    const [displayedProducts, setDisplayedProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name asc')
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        categoryId ? parseInt(categoryId) : null
    )
    const [cartItemsMap, setCartItemsMap] = useState<Record<number, number>>({})
    const [ratingMap, setRatingMap] = useState<Record<number, any>>({})

    const observerRef = useRef<IntersectionObserver | null>(null)
    const lastProductRef = useRef<HTMLDivElement | null>(null)

    const ITEMS_PER_PAGE = 3

    const fetchProducts = async () => {
        try {
            setLoading(true)
            setError(null)
            setPage(1)
            const data = await productService.getProducts(selectedCategory || undefined)
            setProducts(data)
            setDisplayedProducts(data.slice(0, ITEMS_PER_PAGE))
            setHasMore(data.length > ITEMS_PER_PAGE)

            await fetchRatingsForProducts(data)
        } catch (error: any) {
            setError(error.message || 'Falha ao carregar produtos')
        } finally {
            setLoading(false)
        }
    }

    const fetchCartItems = async () => {
        try {
            const cart = await cartService.getCart()
            const itemsMap: Record<number, number> = {}
            cart.items?.forEach((item: any) => {
                itemsMap[item.productId] = (itemsMap[item.productId] || 0) - item.quantity
            });
            setCartItemsMap(itemsMap)
        } catch (error) {
            console.error('Falha ao carregar carrinho: ', error)
        }
    }

    const fetchRatingsForProducts = async (productsList: any[]) => {
        const ratingsData: Record<number, any> = {}

        for(const product of productsList) {
            try {
                const rating = await reviewService.getProductRating(product.id)
                ratingsData[product.id] = rating
            } catch (error) {
                console.error(`Falha ao carregar avaliação para o produto ${product.id}: `, error )
                ratingsData[product.id] = { average_rating: 0, total_reviews: 0 }
            }
        }

        setRatingMap(ratingsData)
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProducts()
    }, [fetchProducts, selectedCategory])

    useEffect(() => {
      if (authService.isAuthenticated()) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCartItems()
      }

      const handleCartUpdate = () => {
        if (authService.isAuthenticated()) {
            fetchCartItems()
        }
      }

      window.addEventListener('cartUpdated', handleCartUpdate)

      return () => window.removeEventListener('cartUpdated', handleCartUpdate)
    }, [])



    const handleUpdateQuantity = async (productId: number, change: number) => {
        try {
            if (change === 1) {
                await cartService.addToCart(productId, 1)
            } else if (change === -1) {
                await cartService.decrementItem(productId)
            }

            await fetchCartItems()
            window.dispatchEvent(new Event('cartUpdated'))
            showToast(change === 1 ? 'Quantidade de itens aumentada' : 'Quantidade de itens diminuida')
        } catch (error: any) {
            showToast(error.message || 'Falha ao atualizar carrinho', 'error')
        }
    }

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 >= 0.5
        const emptyStars = 5 - Math.ceil(rating)
        const stars = []

        for (let i = 0; i < fullStars; i++) {
            stars.push(<span key={`full-${i}`} className="star filled">★</span>)
        }

        if (hasHalfStar) {
            stars.push(<span key="half" className="star half-filled">★</span>)
        }

        for (let i = 0; i < emptyStars; i++) {
            stars.push(<span key={`empty-${i}`} className="star">☆</span>)
        }

        return stars
    }

    const getFilteredAndSortedProducts = useCallback(
      () => {
        let result = [...products]

        if (searchTerm) {
            result = result.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }

        switch (sortBy) {
            case 'price-asc':
                result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                break;

            case 'price-desc':
                result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price))
                break;

            case 'name-asc':
                result.sort((a, b) => a.name.localeCompare(b.name))
                break;

            case 'name-desc':
                result.sort((a, b) => b.name.localeCompare(a.name))
                break;

            default:
                break;
        }

        return result
      },
      [products, searchTerm, sortBy],
    )

    const filteredProducts = getFilteredAndSortedProducts()
    const totalProducts = filteredProducts.length

    const handleAddToCart = async (product: any) => {
        if (!authService.isAuthenticated()) {
            router.push('/login')
            return
        }

        try {
            await cartService.addToCart(product.id, 1)
            await fetchCartItems()
            window.dispatchEvent(new Event('cartUpdated'))
            showToast(`${product.name} adicionado para o carrinho!`)
        } catch (error: any) {
            showToast(error.message || 'Falha ao adicionar para o carrinho', 'error')
        }
    }

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        const toast = document.createElement('div')
        toast.className = `toast-notification ${type}`
        toast.textContent = message
        document.body.appendChild(toast)
        setTimeout(() => toast.remove(), 3000);
    }

    useEffect(() => {
      const filtered = getFilteredAndSortedProducts()
        // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayedProducts(filtered.slice(0, page * ITEMS_PER_PAGE))
      setHasMore(filtered.length > page * ITEMS_PER_PAGE)

    }, [products, searchTerm, sortBy, page, getFilteredAndSortedProducts])

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            setLoadingMore(true)
            setTimeout(() => {
                setPage(prev => prev + 1)
                setLoadingMore(false)
            }, 500);
        }
    }

    useEffect(() => {
      if (loading || loadingMore) return

      if (observerRef.current) {
          observerRef.current.disconnect()
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore()
            }
        },
        { threshold: 0.1 }
      )

      if (lastProductRef.current) {
        observerRef.current.observe(lastProductRef.current)
      }

      return () => {
        if (observerRef.current) {
            observerRef.current.disconnect()
        }
      }
    }, [loading, loadingMore, hasMore, loadMore])

    // Insira o seu retorno de JSX existente aqui
    if (loading) {
        return (
            <div className="container">
                <div className="products-container">
                    <div className="products-header">
                        <h1>Nossos Produtos</h1>
                        <p>Descubra nossa de coleção de produtos de alta qualidade</p>
                    </div>
                    <div className="products-grid">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="product-card loading-card">
                                <div className="loading-image"></div>
                                <div className="loading-content">
                                    <div className="loading-title"></div>
                                    <div className="loading-description"></div>
                                    <div className="loading-price"></div>
                                    <div className="loading-button"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container">
                <div className="products-container">
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Erro ao carregar produtos</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={fetchProducts} className="retry-btn">
                            Tente Novamente
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <Suspense fallback={<div className="loading-spinner">Carregando produtos...</div>}>
            <div className="container">
                <div className="products-container">
                    <div className="products-header">
                        <h1>Nossos Produtos</h1>
                        <p>Descubra nossa de coleção de produtos de alta qualidade</p>
                        {selectedCategory && (
                            <div>
                                <span>Categoria: {selectedCategory}</span>
                                <button>
                                    ✕ Limpar Filtro
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters Section */}
                    <div>
                        <div>
                            <input
                                type="text"
                                placeholder="Pesquisar Produtos..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="name-asc">Nome A-Z</option>
                            <option value="name-desc">Nome Z-A</option>
                            <option value="price-asc">Preço: Menor Para o Maior</option>
                            <option value="price-desc">Preço: Maior Para o Menor</option>
                        </select>
                    </div>

                    {displayedProducts.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3>Nenhum produto encontrado</h3>
                            <p>Tente ajustar sua pesquisa ou critérios de filtro</p>
                        </div>
                    ) : (
                        <>
                            <div className="products-grid four-per-row">
                                {displayedProducts.map((product, index) => {
                                    const rating = ratingMap[product.id]
                                    const averageRating = rating?.average_rating || 0
                                    const totalReviews = rating?.total_reviews || 0

                                    return (

                                        <div
                                            key={product.id}
                                            className="product-card"
                                            ref={index === displayedProducts.length - 1 ? lastProductRef : null}
                                        >
                                            <Link
                                                href={`/products/${product.id}`}
                                            >
                                                <div className="product-image-container">
                                                    <img
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        className="product-image"
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement
                                                            target.src = '/images/product.jpeg'
                                                        }}
                                                    />
                                                    {product.stockQuantity <= 5 && product.stockQuantity > 0 && (
                                                        <span className="stock-badge low-stock">
                                                        Somente {product.stockQuantity} restantes
                                                    </span>
                                                    )}

                                                    {product.stockQuantity === 0 && (
                                                        <span className="stock-badge out-of-stock">
                                                        Fora de Estoque
                                                    </span>
                                                    )}
                                                </div>
                                            </Link>

                                            <div className="product-info">
                                                <Link href={`/products/${product.id}`}>
                                                    <h3 className="product-title">{product.name}</h3>
                                                </Link>

                                                <div className="product-rating">
                                                    <div className="rating-stars">
                                                        {renderStars(averageRating)}
                                                    </div>
                                                    <span className="rating-value">{averageRating.toFixed(1)}</span>
                                                    <span className="rating-count">({totalReviews})</span>
                                                </div>

                                                <div className="price-section">
                                                <span className="product-price">
                                                    R$ {parseFloat(product.price.toLocaleString("pt-BR", {}))}
                                                </span>
                                                    <span className="product-stock">
                                                    {product.stockQuantity}
                                                </span>
                                                </div>

                                                {cartItemsMap[product.id] ? (
                                                    <div className="cart-quantity-controls">
                                                        <button
                                                            onClick={() => handleUpdateQuantity(product.id, 1)}
                                                            className="qty-btn"
                                                            disabled={product.stockQuantity === 0}
                                                        >
                                                            -
                                                        </button>
                                                        <span className="qty-value">{cartItemsMap[product.id]}</span>
                                                        <button
                                                            onClick={() => handleUpdateQuantity(product.id, -1)}
                                                            className="qty-btn"
                                                            disabled={product.stockQuantity === 0}
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(product)}
                                                        className="add-to-cart-btn"
                                                        disabled={product.stockQuantity === 0}
                                                    >
                                                        {product.stockQuantity === 0 ? 'Fora de Estoque' : 'Adicionar Para o Carrinho 🛒'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {loadingMore && (
                                <div className="loading-more">
                                    <div className="loading-spinner"></div>
                                    <p>Carregando mais produtos...</p>
                                </div>
                            )}

                            <div className="results-count">
                                Mostrando {displayedProducts.length} de {totalProducts} produtos
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Suspense>
    )
}

// 2. Exportação padrão da página embrulhada em Suspense para resolver o erro do Next.js
export default function ProductsPage() {
    return (
        <Suspense fallback={<div className="products-loading">A carregar catálogo de produtos...</div>}>
            <ProductsContent />
        </Suspense>
    )
}
