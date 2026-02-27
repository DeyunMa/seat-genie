import { toDateOnly } from './dateUtils'

export const mapLoansToBorrowings = (loans, usersByEmail) => {
    if (!Array.isArray(loans)) return []
    return loans.map(loan => ({
        id: String(loan.id),
        userId: usersByEmail?.[loan.member_email] ?? null,
        memberId: loan.member_id,
        memberName: loan.member_name,
        memberEmail: loan.member_email,
        bookId: loan.book_id,
        bookTitle: loan.book_title,
        borrowDate: toDateOnly(loan.loaned_at),
        dueDate: toDateOnly(loan.due_at),
        returnDate: loan.returned_at ? toDateOnly(loan.returned_at) : null,
        status: loan.returned_at ? 'returned' : 'borrowed',
        createdAt: loan.loaned_at,
        updatedAt: loan.returned_at ?? loan.loaned_at
    }))
}
