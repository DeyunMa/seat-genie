import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useToast } from '../../components/common/Toast'
import './Login.css'

function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuthStore()
    const navigate = useNavigate()
    const { addToast } = useToast()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!username.trim() || !password.trim()) {
            addToast('请输入用户名和密码', 'warning')
            return
        }

        setLoading(true)

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500))

        const result = await login(username, password)

        if (result.success) {
            addToast(`欢迎回来，${result.user.name}！`, 'success')
            navigate('/dashboard')
        } else {
            addToast(result.error, 'error')
        }

        setLoading(false)
    }

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="bg-gradient"></div>
                <div className="bg-pattern"></div>
            </div>

            <div className="login-container">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <span className="logo-icon">📚</span>
                            <h1 className="logo-title">Seat Genie</h1>
                        </div>
                        <p className="login-subtitle">图书馆座位预约与管理系统</p>
                    </div>

                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">用户名</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="请输入用户名"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">密码</label>
                            <div className="input-wrapper">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="请输入密码"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className={`login-btn ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            {loading ? '登录中...' : '登 录'}
                        </button>
                    </form>

                    <div className="login-footer">
                        <div className="demo-accounts">
                            <p className="demo-title">演示账号</p>
                            <div className="account-list">
                                <div className="account-item">
                                    <span className="account-role">管理员</span>
                                    <span className="account-cred">admin / TempPass123!</span>
                                </div>
                                <div className="account-item">
                                    <span className="account-role">工作人员</span>
                                    <span className="account-cred">staff1 / TempPass123!</span>
                                </div>
                                <div className="account-item">
                                    <span className="account-role">学生</span>
                                    <span className="account-cred">student1 / TempPass123!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
