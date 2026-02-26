import './Modal.css'

function Modal({ isOpen, onClose, title, children, size = 'md', showClose = true }) {
    if (!isOpen) return null

    const handleBackdropClick = (e) => {
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

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = '确认', cancelText = '取消', danger = false }) {
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
