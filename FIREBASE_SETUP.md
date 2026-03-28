# Firebase 配置指南

## 步骤一：创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击「添加项目」
3. 输入项目名称（例如：`couple-diary`）
4. 关闭「为此项目启用 Google Analytics」选项（可选，根据需要）
5. 点击「创建项目」

## 步骤二：启用 Authentication

1. 在左侧菜单中点击「Authentication」
2. 点击「开始使用」
3. 在「登录方式」标签页中，找到「电子邮件/密码」
4. 点击启用开关
5. 点击「保存」

## 步骤三：启用 Firestore Database

1. 在左侧菜单中点击「Firestore Database」
2. 点击「创建数据库」
3. 选择「测试模式」（开发阶段可先用测试模式）
4. 选择数据库位置（建议选择离你最近的区域）
5. 点击「启用」

## 步骤四：获取服务账号密钥

1. 在左侧菜单中点击「项目设置」（齿轮图标）
2. 点击「服务账号」标签
3. 点击「生成新的私钥」
4. 确认下载，保存 JSON 文件
5. 将文件重命名为 `serviceAccountKey.json`
6. 将文件移动到项目目录：`backend/src/config/serviceAccountKey.json`

## 步骤五：配置 Firebase 客户端（前端）

### 5.1 获取 Web 应用配置

1. 在 Firebase Console 中，点击「项目设置」
2. 滚动到「你的应用」部分
3. 点击 Web 图标（</>）添加 Web 应用
4. 输入应用昵称（例如：`couple-diary-web`）
5. **不要**勾选「Firebase Hosting」
6. 点击「注册应用」
7. 复制显示的 `firebaseConfig` 配置

### 5.2 创建前端 Firebase 配置文件

创建 `frontend/src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "你的 apiKey",
  authDomain: "你的 authDomain",
  projectId: "你的 projectId",
  storageBucket: "你的 storageBucket",
  messagingSenderId: "你的 messagingSenderId",
  appId: "你的 appId"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

## 步骤六：更新后端 Firebase 配置

确保你的 `backend/src/config/firebase.js` 引用了正确的密钥文件：

```javascript
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

module.exports = db;
```

## 步骤七：配置 Firestore 安全规则

在 Firebase Console 的 Firestore Database 中，点击「规则」标签，更新规则如下：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能访问自己的文档
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 情侣共享日记 - 两个绑定用户都可以访问
    match /diary_entries/{entryId} {
      allow read, write: if request.auth != null;
    }

    // 情侣文档
    match /couples/{coupleId} {
      allow read, write: if request.auth != null;
    }

    // 邀请码
    match /invites/{inviteCode} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 步骤八：启动项目

### 启动后端
```bash
cd d:/couple-diary/backend
npm start
```

### 启动前端（新终端）
```bash
cd d:/couple-diary/frontend
npm run dev
```

## Firebase 控制台快速链接

- [Firebase Console](https://console.firebase.google.com/)
- [Authentication](https://console.firebase.google.com/) → Authentication
- [Firestore](https://console.firebase.google.com/) → Firestore Database
- [项目设置](https://console.firebase.google.com/) → 项目设置

## 常见问题

### Q: 服务账号密钥有什么作用？
A: 服务账号密钥用于后端服务器验证 Firebase 权限，允许后端进行用户管理和数据库操作。

### Q: 前端 firebaseConfig 泄露安全吗？
A: 这是安全的。Firebase Web 配置只能访问公开数据，实际的敏感操作（如创建用户）需要服务端的管理员 SDK。

### Q: 如何切换到生产模式？
A: 在 Firestore 规则中，将测试模式规则替换为更严格的规则，验证用户是否属于情侣关系后再允许访问日记。

### Q: 图片存储在哪里？
A: 当前配置使用本地文件系统存储在 `backend/uploads/` 目录。如需云端存储，可配置 Firebase Storage。
