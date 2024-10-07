import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../App'
import { Star } from 'lucide-react'

interface Recipe {
  id: string
  title: string
  averageRating: number
  author: {
    id: string
    name: string
  }
}

const Home = () => {
  const [topRecipes, setTopRecipes] = useState<Recipe[]>([])
  const [topContributors, setTopContributors] = useState<{ id: string; name: string; recipeCount: number }[]>([])

  useEffect(() => {
    const fetchTopRecipes = async () => {
      const q = query(
        collection(db, 'recipes'),
        where('averageRating', '>=', 4),
        orderBy('averageRating', 'desc'),
        limit(5)
      )
      const snapshot = await getDocs(q)
      setTopRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe)))
    }

    const fetchTopContributors = async () => {
      // This is a simplified query. In a real app, you'd need to aggregate data or use a cloud function
      const q = query(collection(db, 'users'), orderBy('recipeCount', 'desc'), limit(5))
      const snapshot = await getDocs(q)
      setTopContributors(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; name: string; recipeCount: number })))
    }

    fetchTopRecipes()
    fetchTopContributors()
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Rated Recipes</h2>
        <div className="space-y-4">
          {topRecipes.map(recipe => (
            <Link key={recipe.id} to={`/recipe/${recipe.id}`} className="block bg-white p-4 rounded shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold">{recipe.title}</h3>
              <p className="text-gray-600">by {recipe.author.name}</p>
              <div className="flex items-center mt-2">
                <Star className="text-yellow-400 mr-1" />
                <span>{recipe.averageRating.toFixed(1)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-bold mb-4">Top Contributors</h2>
        <div className="space-y-4">
          {topContributors.map(contributor => (
            <Link key={contributor.id} to={`/profile/${contributor.id}`} className="block bg-white p-4 rounded shadow hover:shadow-md transition">
              <h3 className="text-xl font-semibold">{contributor.name}</h3>
              <p className="text-gray-600">{contributor.recipeCount} recipes</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home