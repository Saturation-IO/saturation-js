# 🚀 Quick Start: Build a Saturation App with AI

Want to quickly test the Saturation SDK in a Next.js app? Use this prompt with your favorite AI coding tool to create a simple "Hello World" app that connects to your Saturation workspace and is ready to deploy on Vercel.

## Choose Your Tool

### Option 1: Claude Code (Local Development)
Use [Claude Code](https://claude.ai/code) to create the app in your local environment. The app will be created in your current directory.

### Option 2: v0.app (Instant Deploy-Ready App)
Use [v0.app](https://v0.app) by Vercel to get an instantly deployable app with live preview and one-click deployment to Vercel.

## The Simple Prompt

Copy and paste this entire prompt into Claude Code or v0.app:

```
First, read the Saturation SDK README to understand the library:
https://raw.githubusercontent.com/Saturation-IO/saturation-js/refs/heads/main/README.md

Then create a simple Next.js application in the CURRENT DIRECTORY (do NOT create a new folder) with:
- Next.js 14+ with App Router
- TypeScript
- @saturation-api/js SDK for API calls (use the latest published version from npm)
- Environment variables for secure API key storage

When installing dependencies:
- Check npm for the latest version of @saturation-api/js
- Install it using: npm install @saturation-api/js@latest

Create a minimal app that:
1. Connects to the Saturation API using server-side API calls
2. Fetches the list of projects
3. Displays "Hello World! You have X projects" where X is the actual count
4. Lists the project names as simple bullet points

Set up the API configuration:
- Create a .env.local file with SATURATION_API_KEY environment variable
- Use the API key from the environment variable (never hardcode it)
- Base URL: https://api.saturation.io/api/v1
- Add .env.local to .gitignore

The app should have:
- A single page at app/page.tsx
- Server component for data fetching (no client-side API calls)
- Basic HTML and minimal Tailwind CSS styles (Next.js includes it by default)
- Show "Loading..." state while fetching
- Proper error handling with error boundaries

Make it production-ready for Vercel deployment:
- Ensure all API calls are server-side
- Include proper TypeScript types
- Add a .env.example file showing required environment variables

After creating the app, provide clear instructions on:
1. How to set up the .env.local file with the API key
2. How to install dependencies and run the development server
3. How to deploy to Vercel (including environment variable setup)
4. What the app does and what the user should expect to see
5. Security best practices for API key management
```

## What You'll Get

This prompt will create a minimal "Hello World" app with:

- ✨ **Production-Ready**: Next.js + TypeScript with server-side rendering
- 🔒 **Secure**: API key stored in environment variables, never exposed to client
- 📝 **Basic Output**: Just text showing your project count and names
- 🔌 **API Integration**: Server-side connection to your Saturation workspace
- ☁️ **Deploy-Ready**: Configured for one-click Vercel deployment
- 🎯 **Learning Friendly**: Perfect for testing the SDK or starting development

## Before You Start

1. **Get Your API Key**: 
   - Log into Saturation
   - Go to Settings → API Keys
   - Create a new key and copy it

2. **Have Node.js Ready**:
   - Ensure you have Node.js 18+ installed
   - npm or yarn package manager available

3. **Choose Your Tool and Paste**:
   - **For Claude Code**: Open Claude Code in your project directory and paste the prompt
   - **For v0.app**: Go to v0.app and paste the prompt for instant preview
   - Let the AI build your app!
   
4. **Set Up Your API Key**:
   - After the app is created, add your API key to `.env.local`
   - Never commit this file to version control

## Next Steps

After Claude creates your Hello World app, you can expand it:

### Show More Project Details
```
Update the app/page.tsx server component to also display:
- Project status (active/archived)
- Project labels
- Creation date
- Total budget for each project
Keep the data fetching server-side.
```

### Add Budget Information
```
In the server component, for each project also fetch and show:
- Total budget estimate
- Total actuals spent
- Remaining budget
Use Promise.all for parallel fetching to optimize performance.
```

### Add Basic Interactivity
```
Convert to a client component with 'use client' and add:
- A refresh button using router.refresh()
- Client-side filtering for active/archived projects
- Sort projects alphabetically
Fetch data in a server component and pass it as props.
```

### Add a Simple Form
```
Create a server action in app/actions.ts to:
- Create a new project with a name
- Show success/error messages using toast or inline
- Revalidate the page after creation
Use Next.js server actions for form submission.
```

## Building From Here

Once you have the Hello World working, you can build a real app:

### Improve Styling with Tailwind
```
Next.js includes Tailwind by default. Update the styling with:
- A centered container using max-w-4xl mx-auto
- Card layout for projects using shadow and rounded borders
- Proper spacing with p-4 and space-y-4
- A header with your company name
- Responsive design with sm: and md: breakpoints
```

### Create a Simple Dashboard
```
Transform app/page.tsx into a dashboard with multiple server components:
- Create app/components/ProjectSummary.tsx for counts
- Create app/components/ProjectList.tsx for project cards
- Create app/components/BudgetOverview.tsx for totals
- Create app/components/RecentActuals.tsx for latest entries
Compose them in the main page using Suspense boundaries.
```

### Add Multiple Pages with App Router
```
Create separate routes using Next.js App Router:
- app/projects/page.tsx - Projects list
- app/projects/[id]/page.tsx - Project detail with budget
- app/actuals/page.tsx - Actuals list
- app/layout.tsx - Shared navigation
Use Link components for navigation and dynamic routes for project details.
```

## Tips for Best Results

1. **Be Specific**: The more details you provide, the better the result
2. **Iterate**: Start with the base prompt, then ask for refinements
3. **Test Early**: Ask Claude to run the app and show you screenshots
4. **Save Progress**: Commit your code regularly as you make changes

## Common Issues

If something doesn't work:

### API Key Issues
```
I'm getting a 401 error. Make sure:
- The API key is in .env.local as SATURATION_API_KEY=your_key
- You've restarted the dev server after adding the key
- The key has proper permissions in Saturation
- Show me the server console error (not browser console)
```

### Environment Variable Not Loading
```
The app can't find the API key. Check:
- File is named .env.local (not .env)
- Format is SATURATION_API_KEY=your_actual_key
- No quotes around the key value
- Restart Next.js after adding the file
```

### No Projects Showing
```
The app says "You have 0 projects" but I have projects.
- Check the server logs for API responses
- Verify the API key has read permissions
- Try fetching both active and archived projects
```

### Vercel Deployment Issues
```
The app works locally but not on Vercel:
- Add SATURATION_API_KEY to Vercel environment variables
- Redeploy after adding the environment variable
- Check Function logs in Vercel dashboard
```

## Why Start Simple?

Starting with a Hello World app helps you:
- ✅ Verify your API key works
- ✅ Understand the SDK basics
- ✅ Test your development environment
- ✅ Learn the data structure
- ✅ Build confidence before adding complexity

---

**Remember**: Every great app starts with Hello World. Get the basics working first, then build your dream dashboard! 🚀