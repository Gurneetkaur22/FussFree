# FussFree

A full-stack web application with a React frontend and Node.js backend, deployed on Vercel.

🔗 **Live Demo:** [fuss-free.vercel.app](https://fuss-free.vercel.app)

---

## Project Structure

```
FussFree/
├── frontend/       # React/Next.js frontend
├── backend/        # Node.js/Express backend
└── .gitignore
```

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/FussFree.git
   cd FussFree
   ```

2. **Set up the backend**

   ```bash
   cd backend
   npm install
   cp .env.example .env   # Add your environment variables
   npm start
   ```

3. **Set up the frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## Environment Variables

### Backend

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
```

> **Note:** Gmail SMTP is configured to use IPv4. Make sure to use a [Gmail App Password](https://support.google.com/accounts/answer/185833) rather than your main account password.

---

## Deployment

The app is deployed on **Vercel**.

- Frontend is auto-deployed on push to `main`
- Backend can be deployed as a Vercel serverless function or a separate service

To deploy manually:

```bash
vercel --prod
```

---

## Tech Stack

| Layer    | Technology         |
|----------|--------------------|
| Frontend | React / Next.js    |
| Backend  | Node.js / Express  |
| Email    | Gmail SMTP (IPv4)  |
| Hosting  | Vercel             |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add my feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is open source. See [LICENSE](LICENSE) for details.
