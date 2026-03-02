import React from 'react'

interface ErrorBoundaryProps {
    children: React.ReactNode
    fallback?: (props: { error: Error | null; reset: () => void }) => React.ReactNode
}

interface ErrorBoundaryState {
    hasError: boolean
    error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
        console.error('ErrorBoundary caught:', error, errorInfo)
    }

    handleReset = (): void => {
        this.setState({ hasError: false, error: null })
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback({
                    error: this.state.error,
                    reset: this.handleReset,
                })
            }

            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '50vh',
                    padding: '2rem',
                    textAlign: 'center',
                    color: '#e0e0e0',
                }}>
                    <span style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</span>
                    <h2 style={{ marginBottom: '0.5rem' }}>Something went wrong</h2>
                    <p style={{ color: '#999', marginBottom: '1.5rem' }}>
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={this.handleReset}
                        style={{
                            padding: '0.5rem 1.5rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#6366f1',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '1rem',
                        }}
                    >
                        Retry
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary
