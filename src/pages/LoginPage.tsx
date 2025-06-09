import { Link } from 'react-router-dom'
import { AuthForm } from '@/components/auth/AuthForm'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-6 text-center">
        <AuthForm 
          mode="login" 
          onSuccess={() => navigate('/')} 
        />
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
} 