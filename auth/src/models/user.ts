import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties
// that are required to create a new user (創建用戶所需的內容)
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties
// that a User Model has (整個用戶集合的外觀或與用戶模型相關聯的最少方法)
interface UserModel extends mongoose.Model<UserDoc> {
  // 進行一些驗證或檢查
  build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Document has (單個用戶文件要寫出的屬性)
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// •	Schema  ：  一種以文件形式存儲的數據庫模型骨架，不具備數據庫的操作能力
// •	Model   ：  由Schema發佈生成的模型，具有抽象屬性和行為的數據庫操作對
// •	Entity  ：  由Model創建的實體，他的操作也會影響數據庫

// Schema、Model、Entity的關係請牢記，Schema生成Model，Model創造Entity，Model和Entity都可對數據庫操作造成影響，但Model比Entity更具操作性。

// 創建模式
const userSchema = new mongoose.Schema(
  {
    email: {
      // 這裡的String並不是typescript的string,而是javascript內置的String,所以是大寫
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      // doc是實際的用戶document, ret是最終將變成json
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

// 每當要保存到數據庫之前都先執行此middleware功能
userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

// mongoose 提供的模型模塊有兩種
// statics：類上擴展
// methods：對象上擴展

// 為了要讓Typescript知道其屬性類型(自定義函數內置到模型中)
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

// 該模式進入 Ｍongoose, 要創建一個新的模型, (model都要返回UserModel的類型)
const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
