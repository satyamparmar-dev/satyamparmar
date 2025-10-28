@echo off
echo 🚀 Starting simple deployment...

echo 📦 Building project...
call npm run build

echo 🔧 Creating .nojekyll file...
echo. > out\.nojekyll

echo 📝 Adding files to git...
cd out
git init
git add .
git commit -m "Deploy to GitHub Pages"

echo 🚀 Pushing to gh-pages branch...
git branch -M gh-pages
git remote add origin https://github.com/satyamparmar-dev/satyamparmar.git
git push -f origin gh-pages

echo 🎉 Deployment complete!
echo 🌐 Your site should be available at: https://satyamparmar-dev.github.io/satyamparmar
pause
