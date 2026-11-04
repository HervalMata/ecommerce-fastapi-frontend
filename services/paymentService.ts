import { API_CONFIG } from "./apiUrl"

const API_BASE_URL = API_CONFIG.API_URL

class PaymentService {
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

    async confirmPayment(sessionId: string | null): Promise<any> {
        if (!sessionId) {
            throw new Error("ID da Sessão é requerido");
        }
        return this.request<any>(`/payments/confirm?session_id=${sessionId}`, {
            method: 'GET',
        })
    }

    async cancelPayment(sessionId: string | null): Promise<any> {
        if (!sessionId) {
            throw new Error("ID da Sessão é requerido");
        }
        return this.request<any>(`/payments/cancel?session_id=${sessionId}`, {
            method: 'GET',
        })
    }
}

export const paymentService = new PaymentService()