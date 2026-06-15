import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { addToCartApi } from '../services/carts.services'
import { CART_QUERY_KEY } from './useCart'
import { handleApiAuthFeedback } from '../utils/handleApiAuthFeedback'

type AddToCartInput = {
  product_id: string
  quantity: number
  redirect?: boolean
}

export const useCartActions = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const addToCartMutation = useMutation({
    mutationFn: ({ product_id, quantity }: AddToCartInput) => addToCartApi({ product_id, quantity }),
    onSuccess: (_data, variables) => {
      toast.success('Đã thêm vào giỏ hàng')
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      if (variables.redirect !== false) {
        navigate('/user/cart')
      }
    },
    onError: (error) => {
      handleApiAuthFeedback(error, 'Thêm vào giỏ hàng thất bại', navigate)
    }
  })

  return {
    addToCart: addToCartMutation.mutate,
    isAdding: addToCartMutation.isPending,
    addingProductId: addToCartMutation.isPending ? addToCartMutation.variables?.product_id : undefined
  }
}
