# 🚀 Quick Start: Build a Saturation App with Claude Code

Want to quickly test the Saturation SDK in a React app? Copy this prompt into Claude Code to create a simple "Hello World" app that connects to your Saturation workspace.

## The Simple Prompt

Copy and paste this entire prompt into Claude Code, replacing `YOUR_API_KEY_HERE` with your actual Saturation API key:

```
Create a simple single-page React application called "saturation-hello" with:
- Vite as the build tool
- React with TypeScript
- @saturation-api/js SDK for API calls

Create a minimal app that:
1. Connects to the Saturation API
2. Fetches the list of projects
3. Displays "Hello World! You have X projects" where X is the actual count
4. Lists the project names as simple bullet points

Use this Saturation API configuration:
- API Key: YOUR_API_KEY_HERE
- Base URL: https://api.saturation.io/api/v1

The entire app should be in a single App.tsx file with:
- No routing, no multiple pages
- No fancy UI libraries
- Just basic HTML and minimal inline styles
- Show "Loading..." while fetching
- Show any errors if they occur

Make it as simple as possible - like a true Hello World example.
Start the dev server and show me the output.
```

## What You'll Get

This prompt will create a minimal "Hello World" app with:

- ✨ **Simple Setup**: React + TypeScript + Vite (no complexity)
- 📝 **Basic Output**: Just text showing your project count and names
- 🔌 **API Integration**: Working connection to your Saturation workspace
- 🎯 **Learning Friendly**: Perfect for testing the SDK or starting development

## Before You Start

1. **Get Your API Key**: 
   - Log into Saturation
   - Go to Settings → API Keys
   - Create a new key and copy it

2. **Replace the Placeholder**:
   - Find `YOUR_API_KEY_HERE` in the prompt
   - Replace it with your actual API key

3. **Paste into Claude Code**:
   - Open Claude Code
   - Paste the entire prompt
   - Let Claude build your app!

## Next Steps

After Claude creates your Hello World app, you can expand it:

### Show More Project Details
```
Also display:
- Project status (active/archived)
- Project labels
- Creation date
- Total budget for each project
```

### Add Budget Information
```
For each project, fetch and show:
- Total budget estimate
- Total actuals spent
- Remaining budget
```

### Add Basic Interactivity
```
Add a button to:
- Refresh the project list
- Filter to show only active projects
- Sort projects alphabetically
```

### Add a Simple Form
```
Add an input field to:
- Create a new project with a name
- Show success/error messages
```

## Building From Here

Once you have the Hello World working, you can build a real app:

### Add Tailwind CSS for Styling
```
Add Tailwind CSS and make it look better with:
- A centered container
- Card layout for projects
- Proper spacing and typography
- A header with your company name
```

### Create a Simple Dashboard
```
Transform it into a one-page dashboard showing:
- Project count summary
- List of projects with budgets
- Total workspace budget
- Recent actuals (last 10)
```

### Add React Router for Multiple Pages
```
Add routing and create separate pages for:
- Projects list
- Budget viewer (click a project to see its budget)
- Actuals list
Keep it simple with just these three pages.
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
- The API key is correct
- It's properly set in the code
- Show me the exact error message
```

### CORS Errors
```
I'm getting CORS errors in the browser.
Check if the API URL is correct (should be https://api.saturation.io/api/v1)
```

### No Projects Showing
```
The app says "You have 0 projects" but I have projects.
Try fetching both active and archived projects.
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