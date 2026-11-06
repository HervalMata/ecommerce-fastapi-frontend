'use client'

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { categoryService } from "@/services/categoryService";
import './categories.css'

export default function CategoriesPage() {
    return (
        <Suspense fallback={<CategoryFallback />}>
            <CategoryContent />
        </Suspense>
    )
}

function CategoryFallback() {
    return (
        <div className="container">
            <div className="categories-card">
                <div className="categories-header">
                    <h1>Produtos por Categoria</h1>
                    <p>Veja os produtos por categoria</p>
                </div>
            </div>
        </div>
    )
}

function CategoryContent() {
    const [categories, setCategories] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      fetchCategories()
    }, [])
    
    const fetchCategories = async () => {
        try {
            setError(null)
            const data = await categoryService.getCategories()
            setCategories(data)
        } catch (error: any) {
            setError(error.message || 'Falha ao carregar categorias')
        }
    }

    if (error) {
        return (
            <div className="container">
                <div className="categories-container">
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Erro ao carregar as categorias</h3>
                            <p>{error}</p>
                        </div>
                        <button onClick={fetchCategories} className="retry-btn">
                            Tente Novamente
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="container">
            <div className="categories-container">
                <div className="categories-header">
                    <h1>Produtos por Categoria</h1>
                    <p>Veja os produtos por categoria</p>
                </div>

                {categories.lentgh === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📂</div>
                        <h3>Nenhuma Categoria Encontrada</h3>
                        <p>Retorne mais tarde para checar por novas categorias</p>
                    </div>
                ) : (
                    <div>
                        {categories.map((category) => (
                            <Link
                                href={`/products?categoryId=${category.id}`}
                                key={category.id}
                                className="cartegory-card"
                            >
                                <div className="category-icon">
                                    {getCategoryIcon(category.name)}
                                    <h3 className="category-name">{category.name}</h3>
                                    <p className="category-description">
                                        {category.description || `Explore ${category.name} produtos`}
                                    </p>
                                    <span className="shop-now">Veja agora →</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function getCategoryIcon(categoryName:string): string {
    const icons: Record<string, string> = {
        'eletrônicos': '📱',
        'roupas': '👕',
        'livros': '📚',
        'casa e jardim': '🏠',
        'esportes': '⚽',
        'brinquedos': '🧸',
        'beleza': '💄',
        'comida': '🍕',
        'moda': '😅'
    }
    return icons[categoryName.toLowerCase().trim()] || '📦';
}