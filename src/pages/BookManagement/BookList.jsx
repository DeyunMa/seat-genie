import { useState, useEffect } from 'react'
import { useToast } from '../../components/common/Toast'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import { listBooks, createBook, updateBook, deleteBook } from '../../services/booksApi'
import '../UserManagement/UserManagement.css'

function BookList() {
    const { addToast } = useToast()
    const [books, setBooks] = useState([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingBook, setEditingBook] = useState(null)
    const [selectedBookId, setSelectedBookId] = useState(null)

    const loadBooks = async () => {
        setLoading(true)
        try {
            const data = await listBooks()
            setBooks(data)
        } catch (error) {
            addToast(error.message || '获取图书失败', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadBooks()
    }, [])

    const activeBooks = books.filter(b => b.activeStatus === 'Y')

    const categories = [...new Set(activeBooks.map(b => b.category))]

    const filteredBooks = activeBooks.filter(book => {
        const authorName = book.author || ''
        const matchesSearch =
            book.title.toLowerCase().includes(search.toLowerCase()) ||
            book.isbn.includes(search) ||
            authorName.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = categoryFilter === 'all' || book.category === categoryFilter
        const matchesStatus = statusFilter === 'all' || book.status === statusFilter
        return matchesSearch && matchesCategory && matchesStatus
    })

    const statusLabels = {
        available: '可借阅',
        borrowed: '已借出',
        maintenance: '维护中'
    }

    const statusColors = {
        available: 'success',
        borrowed: 'warning',
        maintenance: 'error'
    }

    const handleOpenModal = (book = null) => {
        setEditingBook(book)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingBook(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const bookData = {
            isbn: formData.get('isbn'),
            title: formData.get('title'),
            author: formData.get('author'),
            publisher: formData.get('publisher'),
            category: formData.get('category'),
            location: formData.get('location'),
            status: formData.get('status'),
            activeStatus: 'Y'
        }

        try {
            if (editingBook) {
                await updateBook(editingBook.id, bookData)
                addToast('图书信息已更新', 'success')
            } else {
                await createBook(bookData)
                addToast('图书添加成功', 'success')
            }
            await loadBooks()
            handleCloseModal()
        } catch (error) {
            addToast(error.message || '保存图书失败', 'error')
        }

    }

    const handleDelete = async () => {
        if (selectedBookId) {
            try {
                await deleteBook(selectedBookId)
                await loadBooks()
                addToast('图书已删除', 'success')
            } catch (error) {
                addToast(error.message || '删除图书失败', 'error')
            } finally {
                setIsDeleteModalOpen(false)
                setSelectedBookId(null)
            }
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">图书管理</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <span>➕</span> 新增图书
                </button>
            </div>

            <div className="filter-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="搜索书名、ISBN或作者..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                        <option value="all">全部分类</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">全部状态</option>
                        <option value="available">可借阅</option>
                        <option value="borrowed">已借出</option>
                        <option value="maintenance">维护中</option>
                    </select>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ISBN</th>
                            <th>书名</th>
                            <th>作者</th>
                            <th>出版社</th>
                            <th>分类</th>
                            <th>位置</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredBooks.map(book => (
                            <tr key={book.id}>
                                <td><code>{book.isbn}</code></td>
                                <td><strong>{book.title}</strong></td>
                                <td>{book.author}</td>
                                <td>{book.publisher}</td>
                                <td>
                                    <span className="badge badge-info">{book.category}</span>
                                </td>
                                <td>{book.location}</td>
                                <td>
                                    <span className={`badge badge-${statusColors[book.status]}`}>
                                        {statusLabels[book.status]}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleOpenModal(book)}
                                            title="编辑"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => { setSelectedBookId(book.id); setIsDeleteModalOpen(true); }}
                                            title="删除"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && (
                    <div className="empty-state">
                        <div className="empty-state-icon">⏳</div>
                        <p>正在加载图书...</p>
                    </div>
                )}
                {!loading && filteredBooks.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <p>没有找到图书</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingBook ? '编辑图书' : '新增图书'} size="lg">
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>ISBN *</label>
                            <input type="text" name="isbn" defaultValue={editingBook?.isbn} required />
                        </div>
                        <div className="form-group">
                            <label>书名 *</label>
                            <input type="text" name="title" defaultValue={editingBook?.title} required />
                        </div>
                        <div className="form-group">
                            <label>作者 *</label>
                            <input type="text" name="author" defaultValue={editingBook?.author} required />
                        </div>
                        <div className="form-group">
                            <label>出版社 *</label>
                            <input type="text" name="publisher" defaultValue={editingBook?.publisher} required />
                        </div>
                        <div className="form-group">
                            <label>分类 *</label>
                            <input type="text" name="category" defaultValue={editingBook?.category} required placeholder="如：计算机科学、文学" />
                        </div>
                        <div className="form-group">
                            <label>馆藏位置 *</label>
                            <input type="text" name="location" defaultValue={editingBook?.location} required placeholder="如：A区-01-03" />
                        </div>
                        <div className="form-group">
                            <label>状态 *</label>
                            <select name="status" defaultValue={editingBook?.status || 'available'} required>
                                <option value="available">可借阅</option>
                                <option value="borrowed">已借出</option>
                                <option value="maintenance">维护中</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>取消</button>
                        <button type="submit" className="btn btn-primary">{editingBook ? '保存' : '添加'}</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="确认删除"
                message="确定要删除该图书吗？此操作不可撤销。"
                confirmText="删除"
                danger
            />
        </div>
    )
}

export default BookList
