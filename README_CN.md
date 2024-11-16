<div align="center">
  <a href="https://github.com/basemulti/basemulti">
    <img src="/public/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3>Basemulti</h3>

  您的终极无代码数据库解决方案！🎉  
</div>

## 🌟 Basemulti 是什么？

Basemulti 是一个开发人员友好的无代码数据库，可让您使用您最喜欢的数据库快速构建电子表格、管理后端和 API 接口。

无论您是从头开始构建新项目还是希望增强现有的数据库设置，Basemulti 都能为您提供成功所需的工具。

## 🚀 功能

1. **无代码解决方案** 👨‍💻👩‍💻: 无需编码即可构建强大的数据库应用。
2. **类 Airtable 界面** 📑: 熟悉且用户友好的电子表格界面。
3. **即时 API 生成** ⚡: 只需点击几下即可为您的数据创建 API。
4. **Headless CMS 功能** 🧠: 完美适用于现有项目的内容管理。
5. **灵活的数据库支持** 🔄: 使用您选择的任何支持的数据库。
6. **CRUD 操作** ✏️: 轻松创建、读取、更新和删除表格、列和行。
7. **丰富的单元格格式** 🎨: 支持各种数据类型,包括链接、电子邮件、单行文本、图片、单选/多选、日期/时间、数字等。
8. **关系型数据** 🔗: 建立和管理表格之间的关系。
9. **精细的权限控制** 🔒: 实施多级访问控制,增强安全性。
10. **视图共享** 👥: 与团队成员或客户共享特定视图。
11. **轻松集成** 🔌: 无缝连接到您当前的数据库。
12. **虚拟格式化** 🖼️: 对现有数据库应用显示格式和关系,而不影响源数据。

## 🛠 支持的数据库

Basemulti 可以无缝对接多种数据库:

- MySQL 🐬
- PostgreSQL 🐘
- SQLite 🪶
- MariaDB 🦭

## 🏃‍♂️ 快速入门

### 本地开发

1. 克隆存储库：
```
git clone https://github.com/basemulti/basemulti.git
```

2. 安装依赖项：
```
cd basemulti
npm install
```

3. 在根目录中创建 `.env` 文件：
```
cp .env.example .env
```

3. 生成密钥并更新 `.env` 文件：
```
npm run key:generate
```

4. 迁移数据库：
```
npm run migrate
```

5. 启动开发服务器：
```
npm run dev
```

5. 打开浏览器并访问 `http://localhost:3000`

### 在 Vercel 上部署

只需单击一下即可在 Vercel 上部署 Basemulti：

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/basemulti/basemulti)

## 环境变量

`BASEMULTI_KEY` - 用于身份验证的密钥。
`NEXT_PUBLIC_URL` - Basemulti 实例的 URL。
`DB_DRIVER` - 要使用的数据库驱动程序。
`DB_DATABASE` - SQLite 数据库文件。（可选）
`DB_HOST` - 数据库主机。（可选）
`DB_PORT` - 数据库端口。（可选）
`DB_USER` - 数据库用户。 （可选）
`DB_PASSWORD` - 数据库密码。（可选）
`DB_DATABASE` - 数据库名称。（可选）
`NEXT_PUBLIC_DISABLE_PROVIDERS` - 禁用的驱动程序。（可选）

## 🤝 贡献

贡献使开源社区成为一个如此令人惊叹的学习、启发和创造的地方。我们非常感谢您的任何贡献。

## ⭐ 展示您的支持

如果您觉得 Basemulti 有帮助,请考虑在 GitHub 上给我们一个星标。这有助于项目的成长和改进!

您的支持对我们意义重大！💖

## 📜 许可证

Basemulti 基于 [AGPLv3](LICENSE) 发布。

---

由 HY Yu 用 ❤️ 制作