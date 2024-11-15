<div align="center">
  <a href="https://github.com/basemulti/basemulti">
    <img src="/public/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3>Basemulti</h3>

  <p>
    Your Ultimate No-Code Database Solution! 🎉
    <br />
    <br />
    <br />
  </p>
</div>

## 🌟 What is Basemulti?

Basemulti is a developer-friendly no-code database that allows you to quickly build spreadsheets, management backends, and API interfaces using your favorite database.

Whether you're building a new project from scratch or looking to enhance your existing database setup, Basemulti provides the tools you need to succeed.

## 🚀 Features

1. **No-Code Solution** 👨‍💻👩‍💻: Build powerful database applications without coding.
2. **Airtable-like Interface** 📑: Familiar and user-friendly spreadsheet interface.
3. **Instant API Generation** ⚡: Create APIs for your data with just a few clicks.
4. **Headless CMS Functionality** 🧠: Perfect for content management in your existing projects.
5. **Flexible Database Support** 🔄: Use any supported database of your choice.
6. **CRUD Operations** ✏️: Easily Create, Read, Update, and Delete tables, columns, and rows.
7. **Rich Cell Formats** 🎨: Support for various data types including links, email, single-line text, images, single/multi-select, date/time, numbers, and more.
8. **Relational Data** 🔗: Establish and manage relationships between tables.
9. **Granular Permissions** 🔒: Implement multi-level access control for enhanced security.
10. **View Sharing** 👥: Share specific views with team members or clients.
11. **Easy Integration** 🔌: Seamlessly connect to your current database.
12. **Virtual Formatting** 🖼️: Apply display formats and relationships to existing databases without affecting the source.

## 🛠 Supported Databases

Basemulti works seamlessly with various databases:

- MySQL 🐬
- PostgreSQL 🐘
- SQLite 🪶
- MariaDB 🦭

## 🏃‍♂️ Quick Start

### Local Development

1. Clone the repository:
   ```
   git clone https://github.com/basemulti/basemulti.git
   ```

2. Install dependencies:
   ```
   cd basemulti
   npm install
   ```

3. Create a `.env` file in the root directory:
   ```
   cp .env.example .env
   ```

3. Generate keys and update the `.env` file:
   ```
   npm run key:generate
   ```

4. Migrate the database:
   ```
   npm run migrate
   ```

5. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and visit `http://localhost:3000`

### Deploy on Vercel

Deploy Basemulti on Vercel with just one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/basemulti/basemulti)

##  Environment Variables

`BASEMULTI_KEY` - Your secret key for authentication.  
`NEXT_PUBLIC_URL` - The base URL of your Basemulti instance.  
`DB_DRIVER` - The database driver to use.  
`DB_DATABASE` - The SQLite database file. (optional)  
`DB_HOST` - The database host. (optional)  
`DB_PORT` - The database port. (optional)  
`DB_USER` - The database user. (optional)  
`DB_PASSWORD` - The database password. (optional)  
`DB_DATABASE` - The database name. (optional)  
`NEXT_PUBLIC_DISABLE_PROVIDERS` - Disable providers. (optional)  

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## ⭐ Show Your Support

If you find Basemulti helpful, please consider giving us a star on GitHub. It helps the project grow and improve!

Your support means a lot to us! 💖

## 📜 License

Basemulti is released under the [AGPLv3](LICENSE).

---

Made with ❤️ by the HY Yu