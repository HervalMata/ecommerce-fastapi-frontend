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

    useEffect(() => {
      fetchProducts()
    }, [selectedCategory])

    useEffect(() => {
      if (authService.isAuthenticated()) {
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
    }, [loading, loadingMore, hasMore])

    // Insira o seu retorno de JSX existente aqui
    return (
        <div>
            {/* O seu código JSX que renderiza a lista de produtos vai aqui */}
            {loading ? <p>A carregar produtos...</p> : <p>Produtos carregados: {totalProducts}</p>}
        </div>
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