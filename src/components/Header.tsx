import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../App'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { CookingPot, LogIn, LogOut, User } from 'lucide-react'

const Header = () => {
  const [user] = useAuthState(auth)

  const signIn = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
  }

  const signOut = () => {
    auth.signOut()
  }

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center text-xl font-bold text-gray-800">
          <CookingPot className="mr-2" />
          CulinaryGit
        </Link>
        <nav>
          {user ? (
            <div className="flex items-center">
              <Link to={`/profile/${user.uid}`} className="mr-4">
                <User className="inline-block mr-1" />
                Profile
              </Link>
              <button onClick={signOut} className="flex items-center text-gray-600 hover:text-gray-800">
                <LogOut className="mr-1" />
                Sign Out
              </button>
            </div>
          ) : (
            <button onClick={signIn} className="flex items-center text-gray-600 hover:text-gray-800">
              <LogIn className="mr-1" />
              Sign In with Google
            </button>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header