# Sendy – A Simple WeTransfer Clone on the Edge

**Sendy** is a minimalist file-sharing application inspired by WeTransfer, built with **Nuxt** and **NuxtHub**. It runs on Cloudflare Workers at the edge, supports large files via multipart upload, and automatically deletes them after 4 days using Nitro tasks.

---

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/lschvn/sendy.git
   ```

2. Navigate to the project directory:

   ```bash
   cd sendy
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm run dev
   ```

The app will now be running locally. By default, you can access it at [http://localhost:3000](http://localhost:3000).

---

## Contributing

Contributions, bug reports, and feature requests are welcome! Feel free to open an [issue](../../issues) or submit a [pull request](../../pulls).

---

## License

This project is licensed under the [MIT License](LICENSE). Feel free to fork, modify, and distribute under these terms.
