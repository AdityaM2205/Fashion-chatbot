#!/bin/bash

# Create project directory
mkdir -p fashion-chatbot
cd fashion-chatbot

# Initialize npm project
npm init -y

# Install dependencies
npm install react react-dom typescript @types/react @types/react-dom @vitejs/plugin-react vite @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot class-variance-authority clsx lucide-react next-themes tailwind-merge tailwindcss-animate

# Install dev dependencies
npm install -D @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser @vitejs/plugin-react autoprefixer eslint eslint-plugin-react-hooks eslint-plugin-react-refresh postcss tailwindcss

# Create necessary directories
mkdir -p src/{components,lib,assets}
mkdir -p src/components/ui

# Create necessary files
touch src/App.tsx src/main.tsx src/index.css src/vite-env.d.ts

# Initialize TypeScript
npx tsc --init

# Initialize Tailwind CSS
npx tailwindcss init -p

echo "Setup complete! Run 'npm run dev' to start the development server."
