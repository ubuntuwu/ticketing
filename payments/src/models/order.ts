import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { OrderStatus } from '@alexjjtickets/common';

// order建構時, 必須提供的屬性列表
interface OrderAttrs {
  id: string;
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// ㄧ個 order 具有的屬性列表
interface OrderDoc extends mongoose.Document {
  // Mongoose 已經包含或定義了id
  version: number;
  userId: string;
  price: number;
  status: OrderStatus;
}

// 模型本身包含的屬性列表
interface OrderModel extends mongoose.Model<OrderDoc> {
  // 這將接受一些類型為 OrderAttrs的對象, 然後返回 OrderDoc的實例
  build(attrs: OrderAttrs): OrderDoc;
}

// 架構
const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // ret: return value
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

// 不使用 __v
orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
  return new Order({
    _id: attrs.id,
    version: attrs.version,
    price: attrs.price,
    userId: attrs.userId,
    status: attrs.status,
  });
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
