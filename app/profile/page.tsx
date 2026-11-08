'use client'

import {useRouter} from "next/navigation";
import React, {useEffect, useState} from "react";
import {authService} from "@/services/authService";
import './profile.css'

export default function ProfilePage() {
    const router = useRouter()

    const [user, setUser] = useState<any>(null)
    const [updating, setUpdating] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [profileForm, setProfileForm] = useState({
        name: '',
        address: '',
    })
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [successMessage, setSuccessMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')

    const fetchUserProfile = async () => {
        try {
            const userData = await authService.getCurrentUser()
            setUser(userData)

            setProfileForm({
                name: userData.name || '',
                address: userData.address || '',
            })
        } catch (error: any) {
            setErrorMessage(error.message || 'Falha ao carregar o perfil')
        }
    }

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            router.push('/login')
            return
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUserProfile()
    }, [router])

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setProfileForm({
            ...profileForm,
            [e.target.name]: e.target.value,
        })
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value,
        })
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        setSuccessMessage('')
        setErrorMessage('')

        try {
            const updateData: any = {}
            if (profileForm.name !== user.name) updateData.name = profileForm.name
            if (profileForm.address !== user.address) updateData.address = profileForm.address

            if (Object.keys(updateData).length === 0) {
                setErrorMessage('Nenhuma mudança para atualizar')
                return
            }

            await authService.updateProfile(updateData)
            await fetchUserProfile()
            setSuccessMessage('Perfil atualizado com sucesso')
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error: any) {
            setErrorMessage(error.message || 'Falha ao atualizar o perfil')
        } finally {
            setUpdating(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setErrorMessage('Nova senha não corresponde com a confirmação')
            return
        }

        if (passwordForm.newPassword.length < 6) {
            setErrorMessage('Nova senha deve ter pelo menos 6 caracteres')
            return
        }

        setUpdating(true)
        setSuccessMessage('')
        setErrorMessage('')

        try {
            await authService.changePassword({
                oldPassword: passwordForm.oldPassword,
                newPassword: passwordForm.newPassword,
            })

            setSuccessMessage('Senha atualizada com sucesso')
            setPasswordForm({
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            })
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error: any) {
            setErrorMessage(error.message || 'Falha ao atualizar a senha')
        } finally {
            setUpdating(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image')) {
            setErrorMessage('Por favor carregue uma imagem')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrorMessage('A imagem deve ter no máximo 5 MB')
            return
        }

        setUploading(true)
        setSuccessMessage('')
        setErrorMessage('')

        try {
            await authService.uploadAvatar(file)
            await fetchUserProfile()

            setSuccessMessage('Imagem do Perfil atualizada com sucesso')
            setTimeout(() => setSuccessMessage(''), 3000)
        } catch (error: any) {
            setErrorMessage(error.message || 'Falha ao atualizar o avatar')
        } finally {
            setUploading(false)
        }
    }

    const getImageUrl = (imageUrl: string) => {
        if (!imageUrl) return '/images/profile.jpeg'
        return  imageUrl
    }

    return (
        <div className="profile-container">
            <div className="container">
                <div className="profile-wrapper">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="avatar-section">
                            <div className="avatar-wrapper">
                                <img
                                    src={getImageUrl(user?.profilePicture)}
                                    alt={user?.name || ''}
                                    className="avatar-image"
                                />
                                <label htmlFor="avatar-upload" className="avatar-upload-btn">
                                    📷
                                    <input
                                        id="avatar-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                {uploading && <div className="avatar-loading">Atualizando...</div>}
                            </div>
                            <h3>{user?.name || ''}</h3>
                            <p>{user?.email}</p>
                            <span className={`user-role role-${user?.role?.toLowerCase()}`}>{user?.role}</span>
                        </div>

                        <div className="profile-tabs">
                            <button
                                className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                📝 Editar Perfil
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                🔒 Trocar Senha
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="profile-content">
                        {successMessage && (
                            <div className="success-alert">
                                <span>✅</span>
                                <p>{successMessage}</p>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="error-alert">
                                <span>⚠️</span>
                                <p>{errorMessage}</p>
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="profile-form-section">
                                <h2>Editar Perfil</h2>
                                <form onSubmit={handleUpdateProfile} className="profile-form">
                                    <div className="form-group">
                                        <label htmlFor="name">Nome Completo</label>
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={profileForm.name}
                                            onChange={handleProfileChange}
                                            placeholder="Nome Completo"
                                            disabled={updating}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="email">Email</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="disabled-input"
                                        />
                                        <small>Email não pode ser alterado</small>
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="address">Endereço</label>
                                        <textarea
                                            id="address"
                                            name="address"
                                            value={profileForm.address || ''}
                                            onChange={handleProfileChange}
                                            placeholder="Digite seu endereço"
                                            rows={3}
                                            disabled={updating}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={updating}
                                    >
                                        {updating ? 'Salvando...' : 'Salvar Alterações'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'password' && (
                            <div className="profile-form-section">
                                <h2>Alterar Senha</h2>
                                <form onSubmit={handleChangePassword} className="profile-form">
                                    <div className="form-group">
                                        <label htmlFor="oldPassword">Senha Atual</label>
                                        <input
                                            type="password"
                                            id="oldPassword"
                                            name="oldPassword"
                                            value={passwordForm.oldPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Digite a senha atual"
                                            required
                                            disabled={updating}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="newPassword">Nova Senha</label>
                                        <input
                                            type="password"
                                            id="newPassword"
                                            name="newPassword"
                                            value={passwordForm.newPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Digite a nova senha"
                                            required
                                            disabled={updating}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label htmlFor="confirmPassword">Confirme a Nova Senha</label>
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            value={passwordForm.confirmPassword}
                                            onChange={handlePasswordChange}
                                            placeholder="Confirme a nova senha"
                                            required
                                            disabled={updating}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={updating}
                                    >
                                        {updating ? 'Alterando...' : 'Alterar Senha'}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
