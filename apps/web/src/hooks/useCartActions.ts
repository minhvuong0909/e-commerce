import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addToCartApi } from '../services/carts.services'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export const useCartActions = () => {
  const queryClient = useQueryClient()
  const nav = useNavigate()

  const addToCartMutation = useMutation({
    mutationFn: (data: { product_id: string; quantity: number }) => addToCartApi(data),
    onSuccess: () => {
      toast.success('Đã thêm vào giỏ hàng')
      // Invalidate cart query if there's one to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      nav('/user/cart')
    },
    onError: () => {
      toast.error('Thêm vào giỏ hàng thất bại')
    }
  })

  return {
    addToCart: addToCartMutation.mutate,
    isAdding: addToCartMutation.isPending
  }
}
