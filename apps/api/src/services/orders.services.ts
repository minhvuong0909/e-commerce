import { ObjectId } from 'mongodb'
import { CartStatus, OrderStatus, PaymentMethod, PaymentStatus, USER_ROLE } from '~/constants/enums'
import databaseService from './database.service'
import { ErrorWithStatus } from '~/models/Errors'
import { CART_MESSAGES, ORDER_MESSAGES, PRODUCT_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import OrderItems from '~/models/schemas/OrderItems.Schema'
import Order from '~/models/schemas/Orders.schema'
import { CreateOrderReqBody } from '~/models/requests/Orders.requests'
import { Request } from 'express'
import { canTransitionOrderStatus, isValidOrderStatus } from '~/utils/orderStatus'
import { buildOrderSearchFilter } from '~/utils/listQuery'
import shippingService from './shipping.services'
import { createMailTransporter } from '~/config/mail'

const mailTransporter = createMailTransporter()

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng (COD)',
  [PaymentMethod.MOMO]: 'Ví MoMo',
  [PaymentMethod.PAYPAL]: 'PayPal',
  [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng'
}
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
    // tính tổng tiền — load tất cả product một lần để tránh N+1
    const products = await databaseService.products
      .find({ _id: { $in: cartItems.map((item) => item.product_id) } })
      .toArray()
    const productMap = new Map(products.map((product) => [product._id.toString(), product]))

    let total_price = 0
    const orderItems: OrderItems[] = []
    for (const item of cartItems) {
      const product = productMap.get(item.product_id.toString())
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
      orderItems.push(
        new OrderItems({
          order_id: new ObjectId(),
          product_id: item.product_id,
          quantity: item.quantity,
          price: product.price
        })
      )
    }
    // tính shipping fee theo khoảng cách (OSRM) + loại giao hàng
    const lat = Number(payload.lat)
    const lng = Number(payload.lng)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.SHIPPING_COORDINATES_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    const quote = await shippingService.getShippingQuote({
      address_line: payload.address_line,
      city: payload.city,
      district: payload.district,
      lat,
      lng,
      delivery_method_id: payload.delivery_method_id
    })
    const shipping_fee = quote.shipping_fee

    const recipient_name = payload.recipient_name?.trim()
    const phone = payload.phone?.trim()
    const address_line = payload.address_line?.trim()
    const note = payload.note?.trim()
    if (!recipient_name || !phone || !address_line) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.SHIPPING_ADDRESS_REQUIRED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // tạo order
    const order = await databaseService.orders.insertOne(
      new Order({
        user_id: new ObjectId(user_id),
        total_price: total_price + shipping_fee,
        payment_method: payload.payment_method,
        payment_status: PaymentStatus.PENDING,
        delivery_method_id: delivery_method._id,
        shipping_fee: shipping_fee,
        status: OrderStatus.Pending,
        shipping_address: {
          recipient_name,
          phone,
          note: note || undefined,
          address_line,
          city: payload.city?.trim(),
          district: payload.district?.trim(),
          lat: quote.lat,
          lng: quote.lng,
          distance_km: quote.distance_km,
          address_source: payload.address_source
        }
      })
    )
    // đặt hàng thành công: tạo order items + trừ kho theo batch (tránh N+1)
    orderItems.forEach((orderItem) => {
      orderItem.order_id = order.insertedId
    })
    await databaseService.order_items.insertMany(orderItems)
    await databaseService.products.bulkWrite(
      orderItems.map((orderItem) => ({
        updateOne: {
          filter: { _id: orderItem.product_id },
          update: { $inc: { quantity: -orderItem.quantity, soldNumber: orderItem.quantity } }
        }
      }))
    )
    // xóa cart items đã đặt hàng
    await databaseService.cart_items.deleteMany({
      _id: { $in: cartItems.map((item) => item._id!) }
    })

    this.sendOrderConfirmationEmail(order.insertedId.toString()).catch((err) =>
      console.error('Gửi email xác nhận đơn hàng thất bại:', err)
    )

    return order
  }

  private async sendOrderConfirmationEmail(order_id: string) {
    const order = await databaseService.orders.findOne({ _id: new ObjectId(order_id) })
    if (!order) return

    const user = await databaseService.users.findOne({ _id: order.user_id })
    if (!user?.email) return

    const items = await databaseService.order_items.find({ order_id: new ObjectId(order_id) }).toArray()
    const products = await databaseService.products
      .find({ _id: { $in: items.map((item) => item.product_id) } })
      .toArray()
    const productMap = new Map(products.map((product) => [product._id.toString(), product.name]))

    const itemRows = items
      .map((item) => {
        const name = productMap.get(item.product_id.toString()) || 'Sản phẩm'
        const lineTotal = (item.quantity * item.price).toLocaleString('vi-VN')
        return `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#334155;font-size:14px;">${name} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:600;color:#0f172a;font-size:14px;">${lineTotal}đ</td>
        </tr>`
      })
      .join('')

    const paymentLabel = PAYMENT_METHOD_LABELS[order.payment_method] || order.payment_method
    const address = order.shipping_address
    const addressText = [address?.address_line, address?.district, address?.city].filter(Boolean).join(', ')

    await mailTransporter.sendMail({
      from: process.env.GMAIL_USER as string,
      to: user.email,
      subject: `Xác nhận đơn hàng #${order_id.slice(-6).toUpperCase()} - Vibrant Mart`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          <div style="background:linear-gradient(135deg,#16a34a 0%,#15803d 100%);padding:32px 24px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:24px;">Đặt hàng thành công!</h1>
            <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;">Cảm ơn bạn đã mua sắm tại Vibrant Mart</p>
          </div>
          <div style="padding:32px 24px;">
            <p style="color:#64748b;font-size:14px;margin:0 0 16px;">Xin chào <strong>${user.name}</strong>, đơn hàng của bạn đã được ghi nhận.</p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
              <tr><td style="color:#64748b;font-size:14px;">Mã đơn</td><td style="text-align:right;font-weight:700;">#${order_id.slice(-6).toUpperCase()}</td></tr>
              <tr><td style="color:#64748b;font-size:14px;">Thanh toán</td><td style="text-align:right;font-weight:600;">${paymentLabel}</td></tr>
              <tr><td style="color:#64748b;font-size:14px;">Phí ship</td><td style="text-align:right;">${order.shipping_fee.toLocaleString('vi-VN')}đ</td></tr>
              <tr><td style="color:#64748b;font-size:14px;">Tổng cộng</td><td style="text-align:right;font-weight:700;color:#16a34a;font-size:18px;">${order.total_price.toLocaleString('vi-VN')}đ</td></tr>
            </table>
            <h3 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">Sản phẩm</h3>
            <table style="width:100%;border-collapse:collapse;">${itemRows}</table>
            <h3 style="font-size:15px;color:#0f172a;margin:24px 0 8px;">Giao đến</h3>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0;">
              ${address?.recipient_name || ''}<br/>
              ${address?.phone || ''}<br/>
              ${addressText}
            </p>
          </div>
        </div>
      `
    })
  }

  private async sendRefundNotificationEmail(order_id: string, amount: number) {
    const order = await databaseService.orders.findOne({ _id: new ObjectId(order_id) })
    if (!order) return

    const user = await databaseService.users.findOne({ _id: order.user_id })
    if (!user?.email) return

    await mailTransporter.sendMail({
      from: process.env.GMAIL_USER as string,
      to: user.email,
      subject: `Hoàn tiền đơn hàng #${order_id.slice(-6).toUpperCase()}`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h2 style="color:#0f172a;">Đơn hàng đã được hoàn tiền</h2>
          <p style="color:#475569;font-size:14px;">Mã đơn: <strong>#${order_id.slice(-6).toUpperCase()}</strong></p>
          <p style="color:#475569;font-size:14px;">Số tiền hoàn: <strong style="color:#16a34a;">${amount.toLocaleString('vi-VN')}đ</strong></p>
          <p style="color:#64748b;font-size:13px;">Tiền sẽ được hoàn theo phương thức thanh toán ban đầu trong 3–7 ngày làm việc.</p>
        </div>
      `
    })
  }
  // hoàn kho khi đơn bị hủy: cộng lại quantity và trừ soldNumber
  private async restockOrderItems(order_id: ObjectId) {
    const items = await databaseService.order_items.find({ order_id }).toArray()
    if (items.length === 0) return
    await databaseService.products.bulkWrite(
      items.map((item) => ({
        updateOne: {
          filter: { _id: item.product_id },
          update: { $inc: { quantity: item.quantity, soldNumber: -item.quantity } }
        }
      }))
    )
  }

  // cập nhật trạng thái đơn hàng theo trạng thái đích, có validate luồng chuyển trạng thái
  async updateOrderStatus({ user_id, order_id, status }: { user_id: string; order_id: string; status: number }) {
    if (!isValidOrderStatus(status)) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_STATUS_IS_INVALID,
        status: HTTP_STATUS.UNPROCESSABLE_ENTITY
      })
    }

    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
    const isStaffOrAdmin = user && (user.role === USER_ROLE.Admin || user.role === USER_ROLE.Staff)

    const filter: any = { _id: new ObjectId(order_id) }
    if (!isStaffOrAdmin) {
      filter.user_id = new ObjectId(user_id)
    }

    const currentOrder = await databaseService.orders.findOne(filter)
    if (!currentOrder) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (!canTransitionOrderStatus(currentOrder.status, status)) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_STATUS_TRANSITION_INVALID,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // hủy đơn thì hoàn kho lại
    if (status === OrderStatus.Cancelled) {
      await this.restockOrderItems(currentOrder._id)
    }

    const order = await databaseService.orders.findOneAndUpdate(
      { _id: currentOrder._id },
      {
        $set: {
          status,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )
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
    // hoàn kho cho đơn vừa hủy
    await this.restockOrderItems(order._id)
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
          shipping_address: { $first: '$shipping_address' },
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
    // list endpoint: luôn trả về mảng (rỗng nếu chưa có đơn) thay vì 404
    const orders = (await databaseService.orders
      .aggregate([{ $match: { user_id: new ObjectId(user_id) } }, { $sort: { created_at: -1 } }])
      .toArray()) as Order[]

    return orders
  }

  async getAllOrders(req: Request) {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 10))
    const search = typeof req.query.search === 'string' ? req.query.search : undefined
    const filter = buildOrderSearchFilter(search)

    const [orders, totalItems] = await Promise.all([
      databaseService.orders
        .aggregate([
          ...(Object.keys(filter).length ? [{ $match: filter }] : []),
          { $sort: { created_at: -1 } },
          { $skip: (page - 1) * limit },
          { $limit: limit }
        ])
        .toArray() as Promise<Order[]>,
      databaseService.orders.countDocuments(filter)
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit))
      }
    }
  }

  async refundOrder({ order_id }: { order_id: string }) {
    const orderObjectId = new ObjectId(order_id)
    const order = await databaseService.orders.findOne({ _id: orderObjectId })

    if (!order) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    if (order.payment_status === PaymentStatus.REFUNDED) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_ALREADY_REFUNDED,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (order.payment_status !== PaymentStatus.COMPLETED) {
      throw new ErrorWithStatus({
        message: ORDER_MESSAGES.ORDER_NOT_REFUNDABLE,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    if (order.status !== OrderStatus.Cancelled) {
      await this.restockOrderItems(orderObjectId)
    }

    const updated = await databaseService.orders.findOneAndUpdate(
      { _id: orderObjectId },
      {
        $set: {
          payment_status: PaymentStatus.REFUNDED,
          status: OrderStatus.Cancelled,
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    )

    await databaseService.payments.updateMany(
      { order_id: orderObjectId },
      {
        $set: {
          payment_status: PaymentStatus.REFUNDED,
          updated_at: new Date()
        }
      }
    )

    this.sendRefundNotificationEmail(order_id, order.total_price).catch((err) =>
      console.error('Gửi email hoàn tiền thất bại:', err)
    )

    return updated
  }
}

let ordersService = new OrdersService()
export default ordersService
