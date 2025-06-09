import { Link } from 'react-router-dom'
import { AuthForm } from '@/components/auth/AuthForm'
import { useNavigate } from 'react-router-dom'

export function SignupPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="space-y-6 text-center">
        <AuthForm 
          mode="signup" 
          onSuccess={() => navigate('/login')} 
        />
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
} 