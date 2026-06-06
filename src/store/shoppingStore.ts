import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ShoppingItem, CreateShoppingInput } from '../types/shopping'

interface ShoppingState {
  items: ShoppingItem[]
  addItem: (input: CreateShoppingInput) => void
  updateItem: (id: string, input: Partial<CreateShoppingInput>) => void
  deleteItem: (id: string) => void
  toggleChecked: (id: string) => void
  clearChecked: () => void
  reorderItems: (itemIds: string[]) => void
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (input) => set((state) => ({
        items: [
          ...state.items,
          {
            ...input,
            id: crypto.randomUUID(),
            checked: false,
            createdAt: new Date().toISOString(),
          },
        ],
      })),
      updateItem: (id, input) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...input } : item
        ),
      })),
      deleteItem: (id) => set((state) => ({
        items: state.items.filter((item) => item.id !== id),
      })),
      toggleChecked: (id) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, checked: !item.checked } : item
        ),
      })),
      clearChecked: () => set((state) => ({
        items: state.items.filter((item) => !item.checked),
      })),
      reorderItems: (itemIds) => set((state) => {
        const itemMap = new Map(state.items.map(item => [item.id, item]))
        const reorderedItems = itemIds.map(id => itemMap.get(id)).filter(Boolean) as ShoppingItem[]
        // Add items that were not in the reorder list (if any)
        const remainingItems = state.items.filter(item => !itemIds.includes(item.id))
        return { items: [...reorderedItems, ...remainingItems] }
      }),
    }),
    {
      name: 'coppa-shopping',
      version: 1,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = (state.items || []).map((i: any) => ({
            ...i,
            tags: Array.isArray(i.tags) ? i.tags : []
          }))
        }
      }
    }
  )
)
