import express, { Request, Response } from 'express';
// body 用於驗證主體上的傳入數據
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';
import { validateRequest, BadRequestError } from '@alexjjtickets/common';

import { User } from '../models/user';

const router = express.Router();

router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // 檢查註冊的電郵是否已經存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new BadRequestError('Email in use');
    }

    // 創建用戶
    const user = User.build({ email, password });
    await user.save();

    // 生成JWT並發送回cookie
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      // !代表告訴typescript忽略錯誤(已經在一開始就定義了JWT_KEY)
      process.env.JWT_KEY!
    );

    // 存入Session object
    req.session = { jwt: userJwt };

    res.status(201).send(user);
  }
);

export { router as signupRouter };
