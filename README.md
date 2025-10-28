# 🚀 Backend Engineering Blog

A modern, responsive technical blog focused on Backend Engineering, AI, Tech Innovations, and Startup World. Built with Next.js 15, Tailwind CSS, and Framer Motion.

## ✨ Features

- **📱 Fully Responsive**: Mobile, tablet, and desktop optimized
- **🌙 Dark/Light Mode**: Toggle with localStorage persistence
- **🔍 Advanced Search**: Multi-keyword, date range, and category filtering
- **📧 Newsletter**: EmailJS integration for subscriptions
- **📝 Contact Form**: Formspree integration for inquiries
- **⚡ Performance**: Optimized with caching and lazy loading
- **🎨 Animations**: Smooth transitions with Framer Motion
- **🔧 SEO Ready**: Meta tags and structured data

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Content**: JSON-based blog posts
- **Deployment**: GitHub Pages
- **Email Services**: EmailJS + Formspree

## 📁 Project Structure

```
backend-engineering/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── blog/              # Blog listing page
│   ├── contact/           # Contact page
│   ├── setup/             # Email service setup guide
│   ├── test/              # Form testing page
│   └── category/          # Category-specific pages
├── components/            # React components
│   ├── BlogCard.tsx       # Blog post card
│   ├── ContactForm.tsx    # Contact form
│   ├── NewsletterSignup.tsx # Newsletter subscription
│   └── ...
├── data/                  # Blog content (JSON files)
│   ├── backend-engineering/
│   ├── ai/
│   ├── startup-world/
│   └── tech-innovations/
├── lib/                   # Utility functions
└── public/                # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/satyamparmar-dev/satyamparmar.git
   cd satyamparmar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

## 📧 Email Services Setup

### Newsletter (EmailJS)

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Create a free account
3. Set up email service and template
4. Update `components/NewsletterSignup.tsx` with your IDs

### Contact Form (Formspree)

1. Go to [Formspree.io](https://formspree.io/)
2. Create a free account
3. Create a new form
4. Update `components/ContactForm.tsx` with your form ID

### Quick Setup

```bash
npm run setup-email
```

## 🚀 Deployment

### GitHub Pages (Automatic)

The blog is configured for automatic deployment to GitHub Pages:

1. **Push to main branch** - triggers automatic deployment
2. **Check Actions tab** - monitor deployment progress
3. **Visit your site** - `https://satyamparmar-dev.github.io/satyamparmar`

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## 📝 Adding Blog Posts

1. **Create JSON file** in appropriate category folder:
   ```json
   {
     "title": "Your Blog Post Title",
     "slug": "your-blog-post-slug",
     "date": "2025-01-01",
     "author": "Your Name",
     "tags": ["Tag1", "Tag2", "Tag3"],
     "excerpt": "Brief description of your post...",
     "content": "# Your Blog Post\n\nYour markdown content here..."
   }
   ```

2. **File location**: `data/[category]/[slug].json`

3. **Categories available**:
   - `backend-engineering`
   - `ai`
   - `startup-world`
   - `tech-innovations`

## 🎨 Customization

### Colors and Styling

Edit `tailwind.config.js` to customize:
- Color scheme
- Fonts
- Spacing
- Breakpoints

### Content

- **Blog posts**: Add JSON files in `data/` folders
- **Pages**: Edit components in `components/`
- **Navigation**: Update `components/Header.tsx`

## 📊 Performance

- **Lighthouse Score**: 95+ across all metrics
- **Core Web Vitals**: Optimized
- **Bundle Size**: Minimized with tree shaking
- **Images**: Lazy loaded and optimized

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run export       # Export static site
npm run deploy       # Deploy to GitHub Pages
npm run setup-email  # Setup email services
```

### Code Structure

- **Server Components**: For data fetching and static content
- **Client Components**: For interactivity and state management
- **Shared Components**: Reusable UI components
- **Utility Functions**: Helper functions and configurations

## 📱 Responsive Design

- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px+

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

- **Email**: contact@example.com
- **GitHub Issues**: [Create an issue](https://github.com/satyamparmar-dev/satyamparmar/issues)
- **Documentation**: [Setup Guide](https://github.com/satyamparmar-dev/satyamparmar/blob/main/SETUP_INSTRUCTIONS.md)

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS
- Framer Motion for smooth animations
- Lucide for beautiful icons
- EmailJS and Formspree for free email services

---

**Built with ❤️ by [Satyam Parmar](https://github.com/satyamparmar-dev)**