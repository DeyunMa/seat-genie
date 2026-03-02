import React from 'react'
import './Modal.css'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    size?: 'sm' | 'md' | 'lg'
    showClose?: boolean
}

function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }: ModalProps): React.ReactNode {
    if (!isOpen) return null

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdropClick}>
            <div className={`modal modal-${size}`}>
                <div className="modal-header">
                    <h3 className="modal-title">{title}</h3>
                    {showClose && (
                        <button className="modal-close" onClick={onClose}>×</button>
                    )}
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    )
}

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    danger?: boolean
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = '确认', cancelText = '取消', danger = false }: ConfirmModalProps): React.ReactNode {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <p className="confirm-message">{message}</p>
            <div className="modal-actions">
                <button className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
                <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
                    {confirmText}
                </button>
            </div>
        </Modal>
    )
}

export default Modal
