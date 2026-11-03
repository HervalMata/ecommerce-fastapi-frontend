import { API_CONFIG } from "./apiUrl"

const API_BASE_URL = API_CONFIG.API_URL

class ProductService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        const token = this.getToken()

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        if (options.headers) {
            const addtionalHeaders = options.headers as Record<string, string>
            Object.assign(headers, addtionalHeaders)
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "API Request failed");
        }

        const result = await response.json()
        return result.data;
    }

    private async requestFormData<T>(
        endpoint: string,
        formData: FormData,
        options: RequestInit = {}
    ): Promise<T> {

        const token = this.getToken()

        const headers: Record<string, string> = {}

        if (token) {
            headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            method: 'POST',
            headers,
            body: formData,
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "API Request failed");
        }

        const result = await response.json()
        return result.data
    }

    async getProducts(categoryId?: number): Promise<any[]> {
        const endpoint = categoryId ? `/products/category_id=${categoryId}` : '/products'
        return this.request<any[]>(endpoint)
    }

    async getProductById(id: number): Promise<any> {
        return this.request<any>(`/products/${id}`)
    }

    async createProduct(formData: FormData): Promise<any> {
        return this.requestFormData<any>(`/products/`, formData, { method: 'POST' })
    }

    async updateProduct(formData: FormData): Promise<any> {
        return this.requestFormData<any>(`/products/update`, formData, { method: 'PUT' })
    }

    async deleteProduct(productId: number): Promise<any> {
        return this.request<any>(`/products/delete/${productId}`, { method: 'DELETE' })
    }
}

export const productService = new ProductService()