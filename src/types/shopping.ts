// src/types/shopping.ts
export interface ShoppingItem {
  id: string
  name: string
  quantity?: string       // free text: "2", "1kg", "un par"
  tags: string[]
  checked: boolean        // bought or not
  createdAt: string
}

export type CreateShoppingInput = Omit<ShoppingItem, 'id' | 'checked' | 'createdAt'>
