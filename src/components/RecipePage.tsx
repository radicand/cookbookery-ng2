import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { doc, getDoc, collection, addDoc, query, orderBy, onSnapshot } from 'firebase/firestore'
import { useAuthState } from 'react-firebase-hooks/auth'
import { db, auth } from '../App'
import { Star, GitBranch, GitFork } from 'lucide-react'

interface Recipe {
  id: string
  title: string
  ingredients: string[]
  instructions: string[]
  author: {
    id: string
    name: string
  }
  averageRating: number
  parentRecipe?: string
}

interface Comment {
  id: string
  text: string
  rating: number
  author: {
    id: string
    name: string
  }
  createdAt: Date
}

const RecipePage = () => {
  const { id } = useParams<{ id: string }>()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [newRating, setNewRating] = useState(0)
  const [user] = useAuthState(auth)

  useEffect(() => {
    const fetchRecipe = async () => {
      if (id) {
        const docRef = doc(db, 'recipes', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setRecipe({ id: docSnap.id, ...docSnap.data() } as Recipe)
        }
      }
    }

    const fetchComments = () => {
      if (id) {
        const q = query(collection(db, 'recipes', id, 'comments'), orderBy('createdAt', 'desc'))
        return onSnapshot(q, (snapshot) => {
          setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment)))
        })
      }
    }

    fetchRecipe()
    const unsubscribe = fetchComments()
    return () => unsubscribe && unsubscribe()
  }, [id])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (user && newComment && newRating > 0) {
      await addDoc(collection(db, 'recipes', id!, 'comments'), {
        text: newComment,
        rating: newRating,
        author: {
          id: user.uid,
          name: user.displayName
        },
        createdAt: new Date()
      })
      setNewComment('')
      setNewRating(0)
    }
  }

  const handleBranch = () => {
    // Implement branching logic
  }

  const handleFork = () => {
    // Implement forking logic
  }

  if (!recipe) return <div>Loading...</div>

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h1 className="text-3xl font-bold mb-4">{recipe.title}</h1>
      <p className="text-gray-600 mb-4">by {recipe.author.name}</p>
      <div className="flex items-center mb-4">
        <Star className="text-yellow-400 mr-1" />
        <span>{recipe.averageRating.toFixed(1)}</span>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Ingredients</h2>
        <ul className="list-disc list-inside">
          {recipe.ingredients.map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Instructions</h2>
        <ol className="list-decimal list-inside">
          {recipe.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>
      <div className="flex space-x-4 mb-6">
        <button onClick={handleBranch} className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          <GitBranch className="mr-2" />
          Branch Recipe
        </button>
        <button onClick={handleFork} className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
          <GitFork className="mr-2" />
          Fork Recipe
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        {user ? (
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-2 border rounded mb-2"
              placeholder="Add a comment..."
            />
            <div className="flex items-center mb-2">
              <span className="mr-2">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`cursor-pointer ${star <= newRating ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setNewRating(star)}
                />
              ))}
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              Submit Comment
            </button>
          </form>
        ) : (
          <p className="mb-4">Please sign in to leave a comment.</p>
        )}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-t pt-4">
              <p>{comment.text}</p>
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`${star <= comment.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">by {comment.author.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default RecipePage