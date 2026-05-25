import { ObjectId } from 'mongodb'
import { CartStatus, DeliveryMethodType, OrderStatus, PaymentMethod, PaymentStatus, USER_ROLE } from '~/constants/enums'
import databaseService from './database.service'
import { ErrorWithStatus } from '~/models/Errors'
import { CART_MESSAGES, ORDER_MESSAGES, PRODUCT_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import OrderItems from '~/models/schemas/OrderItems.Schema'
import Order from '~/models/schemas/Orders.schema'
import { CreateOrderReqBody } from '~/models/requests/Orders.requests'
import { Request } from 'express'
class OrdersService {
  async createOrderItem({
    user_id,
    cart_item_id,
    payload
  }: {
    user_id: string
    cart_item_id: string[]
    payload: CreateOrderReqBody
  }) {
    // get cart active
    const cart = await databaseService.carts.findOne({ user_id: new ObjectId(user_id), status: CartStatus.ACTIVE })
    if (!cart) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.CART_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // lấy cart item được chọn
    const cartItems = await databaseService.cart_items
      .find({
        _id: { $in: cart_item_id.map((id) => new ObjectId(id)) },
        cart_id: cart._id
      })
      .toArray()
    // nếu ko chọn
    if (cartItems.length === 0) {
      throw new ErrorWithStatus({
        message: CART_MESSAGES.NO_SELECTED_CART_ITEMS,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // validate delivery method
    const delivery_method = await databaseService.delivery_methods.findOne({
      _id: new ObjectId(payload.delivery_method_id)
    })

    if (!delivery_method) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.DELIVERY_METHOD_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    // tính tổng tiền
    let total_price = 0
    const orderItems: OrderItems[] = []
    for (const item of cartItems) {
      const product = await databaseService.products.findOne({ _id: item.product_id })
      if (!product) {
        throw new ErrorWithStatus({
          message: PRODUCT_MESSAGES.PRODUCT_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      if (item.quantity > product.quantity) {
        throw new ErrorWithStatus({
          message: PRODUCT_MESSAGES.INSUFFICIENT_PRODUCT_STOCK,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      total_price += item.quantity * product.price
      // push vào
      orderItems.push(
        new OrderItems({
          order_id: new ObjectId(),
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        })
      )
    }
    // tính shipping fee và total price
    const shipping_fee = delivery_method.type === DeliveryMethodType.STANDARD ? 30000 : 50000
    // tạo order
    const order = await databaseService.orders.insertOne(
      new Order({
        user_id: new ObjectId(user_id),
        total_price: total_price + shipping_fee,
        payment_method: payload.payment_method as any,
        payment_status: PaymentStatus.PENDING,
        delivery_method_id: delivery_method._id,
        shipping_fee: shipping_fee,
        status: OrderStatus.Pending
      })
    )
    // đặt hàng thành công thì tạo order items và trừ quantity trong products
    for (const orderItem of orderItems) {
      orderItem.order_id = order.insertedId
      await databaseService.order_items.insertOne(orderItem)
      // trừ quantity
      await databaseService.products.findOneAndUpdate(
        { _id: orderItem.product_id },
        {
          $inc: {
            quantity: -orderItem.quantity,
            soldNumber: orderItem.quantity
          }
        }
      )
    }
    // xóa cart items đã đặt hàng
    await databaseService.cart_items.deleteMany({
      _id: { $in: cartItems.map((item: any) => item._id!) }
    })    
    return order
  }
  // cập nhật trạng thái đơn hàng
  async updateOrderStatus({ user_id, order_id }: { user_id: string; order_id: string }) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    const isStaffOrAdmin = user && (user.role === USER_ROLE.Admin || user.role === USER_ROLE.Staff)

    const filter: any = { _id: new ObjectId(order_id), status: OrderStatus.Pending }
    if (!isStaffOrAdmin) {
      filter.user_id = new ObjectId(user_id)
    }

    const order = await databaseService.orders.findOneAndUpdate(
      filter,
      {
        $set: {
          status: OrderStatus.Confirmed,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    if (!order) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return order
  }

  async deleteOrder({ user_id, order_id }: { user_id: string; order_id: string }) {
    const order = await databaseService.orders.findOneAndUpdate(
      {
        _id: new ObjectId(order_id),
        user_id: new ObjectId(user_id),
        status: OrderStatus.Pending
      },

      {
        $set: {
          status: OrderStatus.Cancelled,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    if (!order) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
  }

  async getOrderById({ user_id, order_id }: { user_id: string; order_id: string }) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    const isStaffOrAdmin = user && (user.role === USER_ROLE.Admin || user.role === USER_ROLE.Staff)

    const filter: any = { _id: new ObjectId(order_id) }
    if (!isStaffOrAdmin) {
      filter.user_id = new ObjectId(user_id)
    }

    const orderList = await databaseService.orders.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'customer'
        }
      },
      {
        $unwind: {
          path: '$customer',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'order_items',
          localField: '_id',
          foreignField: 'order_id',
          as: 'items'
        }
      },
      {
        $unwind: {
          path: '$items',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product_id',
          foreignField: '_id',
          as: 'items.product'
        }
      },
      {
        $unwind: {
          path: '$items.product',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$_id',
          user_id: { $first: '$user_id' },
          total_price: { $first: '$total_price' },
          payment_method: { $first: '$payment_method' },
          payment_status: { $first: '$payment_status' },
          delivery_method_id: { $first: '$delivery_method_id' },
          shipping_fee: { $first: '$shipping_fee' },
          status: { $first: '$status' },
          created_at: { $first: '$created_at' },
          updated_at: { $first: '$updated_at' },
          customer: {
            $first: {
              name: '$customer.name',
              email: '$customer.email'
            }
          },
          items: {
            $push: {
              _id: '$items._id',
              product_id: '$items.product_id',
              quantity: '$items.quantity',
              price: '$items.price',
              product: '$items.product'
            }
          }
        }
      }
    ]).toArray()

    if (orderList.length === 0) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    const order = orderList[0]
    // Clean empty items if no items found
    if (order.items && order.items.length === 1 && !order.items[0].product_id) {
      order.items = []
    }

    return order
  }

  async getAllMyOrders({ user_id }: { user_id: string }) {
    const orders = (await databaseService.orders
      .aggregate([{ $match: { user_id: new ObjectId(user_id) } }, { $sort: { created_at: -1 } }])
      .toArray()) as Order[]

    if (!orders.length) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.NO_ORDERS_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }
    return orders
  }

  async getAllOrders(req: Request) {
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10

    const orders = (await databaseService.orders
      .aggregate([
        {
          $sort: { created_at: -1 }
        },
        {
          $skip: (page - 1) * limit
        },
        {
          $limit: limit
        }
      ])
      .toArray()) as Order[]

    if (orders.length === 0) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.NO_ORDERS_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    return orders
  }
}

let ordersService = new OrdersService()
export default ordersService
