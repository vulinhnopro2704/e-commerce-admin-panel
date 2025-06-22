import { useState } from "react"
import { ChevronDown, ChevronRight} from "lucide-react"
import { Button } from "@/components/ui/button"
import { type Category } from "@/types"

interface CategoryListViewProps {
  categories: Category[]
  isLoading: boolean
  onRefresh: () => void
  onSearch: (query: string) => void
  onAdd: () => void
  emptyState?: React.ReactNode
}

const CategoryItem = ({ 
  category, 
}: { 
  category: Category
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const hasSubcategories = category.subCategories && category.subCategories.length > 0

  return (
    <div className="border-b border-gray-200">
      <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50">
        <div className="flex items-center space-x-2">
          {hasSubcategories ? (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-8" />
          )}
          <span className="font-medium">{category.name}</span>
        </div>
      </div>
      
      {isExpanded && hasSubcategories && (
        <div className="pl-8 border-t border-gray-100">
          {category.subCategories.map((subcategory) => (
            <CategoryItem
              key={subcategory.id}
              category={subcategory}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const CategoryListView: React.FC<CategoryListViewProps> = ({
  categories,
  isLoading,
  onAdd,
  emptyState,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow-sm">
        <div className="p-4 text-center text-gray-500">Loading categories...</div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-sm">
        {emptyState || (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No categories found</p>
            <Button onClick={() => onAdd()} className="bg-purple-600 hover:bg-purple-700">
              Add Category
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md shadow-sm divide-y divide-gray-200">
      <div className="p-4 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categories</h3>
        <Button onClick={() => onAdd()} className="bg-purple-600 hover:bg-purple-700">
          Add Categories
        </Button>
      </div>
      <div className="overflow-hidden">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
          />
        ))}
      </div>
    </div>
  )
}

export default CategoryListView
