import { API_CONFIG } from "./apiUrl"

const API_BASE_URL = API_CONFIG.API_URL

class OrderService {
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        }

        const token = localStorage.getItem('token')

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

    async getMyOrders(): Promise<any[]> {
        return this.request<any[]>(`/orders/me`, {
            method: 'GET',
        })
    }

    async getAllOrders(): Promise<any[]> {
        return this.request<any[]>(`/orders/all`, {
            method: 'GET',
        })
    }

    async updateOrderStatus(orderId: number, status: string): Promise<any> {
        return this.request<any>(`/orders/${orderId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status })
        })
    }
}

export const orderService = new OrderService()