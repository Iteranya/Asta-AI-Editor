# Asta AI Markdown Editor

Welcome to Asta AI Markdown Editor, where coding meets cuteness! ✨ This isn't just another boring Markdown editor—it's your new best friend for organizing projects, writing docs, and sprinkling a little AI magic into your workflow. Built with love on **FastAPI**, **SQLite**, and pure **Vanilla JS/CSS/HTML**, Asta is here to make your life easier—and way more fun.

![Asta](https://media.discordapp.net/attachments/1112015127873597452/1365732631005761578/image.png?ex=680e6121&is=680d0fa1&hm=586f78df3971cf560e94e108b909d396e94257b0f33d2c7db9704b8fdb9b0c95&=&format=webp&quality=lossless&width=1694&height=800)

---

## 🎉 Core Features That Make Asta Special

### ✏️ Markdown Mastery
**Split View Magic**
Write your raw Markdown on the left, and watch it come to life on the right! It's like having a tiny wizard in your browser, casting spells to turn your words into beautiful docs. The real-time preview ensures what you see is exactly what you'll get.

### 🤖 AI Integration

**AI Brainstorm Buddy**
Stuck? Let the AI take over! The bottom AI pane will continue your thoughts without messing up your work. It's like having a coding buddy who's always ready to help—but without the coffee breath. Just type "//" to summon your AI assistant and watch it complete your thoughts.

**Rewrite Wizardry**
Highlight some text, right-click, and boom! The AI will polish your words like a pro. Perfect for when you want to sound smart without actually trying. Just right click and type down what you want AI to do with that passage.

**Notes for Nerds**
Got extra context or random thoughts? Throw them into the Notes panel, and the AI will use them to make your writing even better. It's like giving your AI a cheat sheet!

### 📄 LaTeX Superpowers

**LaTeX Export System**
Transform your Markdown masterpiece into professional LaTeX documents with a single click! The exporter automatically generates a complete LaTeX project with all necessary configurations, properly formatted sections, and bibliography management.

**Image Integration**
No more manual image handling headaches! All images pasted or referenced in your Markdown automatically get packaged in your LaTeX export. The system intelligently handles image paths and figure environments.

**Overleaf Compatibility**
Get a neatly packaged zip file that's ready to upload directly to Overleaf. Collaborate with colleagues or submit your paper without fighting with configuration files or missing dependencies.

**Experimental LaTeX Viewer**
Preview your LaTeX output directly in Asta using our integrated Tectonic-powered renderer. While still in beta (expect some bugs!), it offers an immediate preview of how your document will look as a properly typeset PDF. Perfect for catching formatting issues before export.

### 🗂️ Project Management

**Workspace Wonderland**
Create new projects with a single click. No project? No problem! You can still work, but saving is disabled—so don't forget to create one before you get too deep into your genius ideas. Each project maintains its own directory structure, images, and settings.

**Intelligent File Management**
Asta automatically organizes your files, handling relationships between markdown document, images, and converted latex document.

### 🖼️ Media Handling

**Image Paste Party**
Copy-paste images directly into the editor, and they'll be saved in your project directory. It's like magic, but with fewer rabbits and more Markdown. Support for screenshots, web images, and local files means no more awkward image management workflows.

**Automatic Image Optimization**
Large images are automatically optimized for web viewing in the preview pane while preserving the original for export purposes. This ensures fast loading times without sacrificing quality in your final output.

### 💾 Data Protection

**Save & Autosave**
Your work is safe with Asta. Save manually or let autosave do its thing—either way, your genius won't be lost. Configure autosave intervals to match your working style—from "paranoid" (every minute) to "confident" (every 10 minutes).

**Local-First Philosophy**
All your data stays on your machine. No cloud dependencies or internet requirements mean you can work offline and maintain complete control over your intellectual property.

**Export Options**
Besides LaTeX, export your work as PDF, HTML, or plain Markdown with a single click. Perfect for sharing with colleagues who haven't yet discovered the joy of Asta.

---

## 🛠️ How to Get Started

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Iteranya/Asta-AI-Editor.git
   cd Asta-AI-Editor
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure AI (Optional)**
   Check out the example.config.json to configure your key, model, and system prompt
   ```
   {
    "system_note": "ONLY WRITE IN MARKDOWN FORMAT.",
    "ai_endpoint": "https://llm.chutes.ai/v1",
    "base_llm": "deepseek-ai/DeepSeek-V3-0324",
    "temperature": 0.5,
    "ai_key": "your-secret-key"
  }
   ```

4. **Run the Server**
   ```bash
   uvicorn main:app --reload --port 5452
   ```

5. **Open Your Browser**
   Head to `http://localhost:5452` and let the fun begin!

---

## 🧙‍♂️ Tech Stack

- **Backend**: FastAPI for lightning-fast API responses, SQLite for reliable data storage, OpenAI API for intelligent text generation
- **Frontend**: Pure Vanilla JavaScript, HTML, and CSS—no bloated frameworks, just clean, efficient code
- **LaTeX Engine**: Tectonic for local rendering (experimental), custom export system for Overleaf compatibility
- **Image Processing**: Pillow for automatic image optimization and formatting

---

## 📄 License

GPL-3 License. Use it, tweak it, build on it—just don't gatekeep it! We believe in open source and the power of community improvements.

---

## 🚀 Pro Tips

- Use keyboard shortcut `Ctrl+Space` to trigger AI suggestions anywhere in your document
- The LaTeX exporter supports custom preambles—add special packages in the project settings
- For mathematical content, Asta renders LaTeX math in the preview pane—just use `$` for inline and `$$` for display math
- Enable "Focus Mode" (F11) for distraction-free writing with just your content and the preview
- Try the "Dark Scholar" theme for late-night writing sessions that won't strain your eyes

---

## 🔮 Coming Soon

- Citation management with BibTeX integration
- Collaborative editing for team projects
- Custom themes and style options
- Extended template library for academic papers, reports, and more
