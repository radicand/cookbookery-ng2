import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../App'
import { User, Book } from 'lucide-react'

interface UserProfile {
  id: string
  name: string
  bio: string
}

interface Recipe {
  id: string
  title: string
  averageRating: number
}

const Profile = () => {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])

  useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        const docRef = doc(db, 'users', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile)
        }
      }
    }

    const fetchRecipes = async () => {
      if (id) {
        const q = query(collection(db, 'recipes'), where('author.id', '==', id))
        const snapshot = await getDocs(q)
        setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe)))
      }
    }

    fetchProfile()
    fetchRecipes()
  }, [id])

  if (!profile) return <div>Loading...</div>

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <User className="w-16 h-16 text-gray-400 mr-4" />
        <div>
          <h1 className="text-3xl font-bold">{profile.name}</h1>
          <p className="text-gray-600">{profile.bio}</p>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recipes.map(recipe => (
            <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="block bg-gray-100 p-4 rounded hover:bg-gray-200 transition">
              <div className="flex items-center">
                <Book className="w-6 h-6 mr-2 text-gray-600" />
                <h3 className="text-xl font-semibold">{recipe.title}</h3>
              </div>
              <p className="text-gray-600 mt-2">Rating: {recipe.averageRating.toFixed(1)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile