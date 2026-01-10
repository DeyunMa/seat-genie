import { useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../components/common/Toast'
import './ChangePassword.css'

function ChangePassword() {
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { changePassword } = useAuthStore()
    const { addToast } = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!oldPassword || !newPassword || !confirmPassword) {
            addToast('请填写所有字段', 'warning')
            return
        }

        if (newPassword !== confirmPassword) {
            addToast('两次输入的新密码不一致', 'error')
            return
        }

        if (newPassword.length < 6) {
            addToast('新密码长度不能少于6位', 'warning')
            return
        }

        setLoading(true)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const result = changePassword(oldPassword, newPassword)

        if (result.success) {
            addToast('密码修改成功', 'success')
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } else {
            addToast(result.error, 'error')
        }

        setLoading(false)
    }

    return (
        <div className="page-container">
            <div className="password-page">
                <div className="password-card">
                    <div className="card-header">
                        <h2>修改密码</h2>
                        <p>为了账户安全，请定期更换密码</p>
                    </div>

                    <form onSubmit={handleSubmit} className="password-form">
                        <div className="form-group">
                            <label>当前密码</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="请输入当前密码"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>新密码</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="请输入新密码（至少6位）"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label>确认新密码</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="请再次输入新密码"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            disabled={loading}
                        >
                            {loading ? '修改中...' : '确认修改'}
                        </button>
                    </form>

                    <div className="password-tips">
                        <h4>密码安全建议</h4>
                        <ul>
                            <li>密码长度至少为6位字符</li>
                            <li>建议使用字母、数字和特殊字符的组合</li>
                            <li>不要使用与其他网站相同的密码</li>
                            <li>定期更换密码以保障账户安全</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword
