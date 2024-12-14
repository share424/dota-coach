# 🎮 Dota Coach

Your AI-powered companion for mastering Dota 2 drafts. Get real-time analysis and insights to make better strategic decisions during the crucial drafting phase.

![Dota Coach Screenshot](./public/screenshot.png)

## ✨ Features

### 🎯 Counter Pick Analysis
Get intelligent suggestions for counter picks against enemy heroes, complete with detailed explanations of why they work and how to use them effectively.

### 🛣️ Lane Strategy
Optimize your lane setups with smart recommendations based on both team compositions. Understand lane matchups and early game priorities.

### 🎒 Item & Strategy Guide
Receive personalized recommendations for item builds, power spikes, and gameplay strategies based on both team compositions. Get insights on core items, situational pickups, and timing windows.

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/dota-coach.git

# Install dependencies
npm install

# Add your API keys to .env
cp .env.example .env
```

Add your API keys to the `.env` file:
```env
GROQ_API_KEY=your-groq-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

Then start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using Dota Coach.

## 🛠️ Built With

- **Next.js** - React framework for production
- **Tailwind CSS** - For styling
- **LangChain** - For AI interactions
- **Groq** - High-performance LLM provider

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

Dota Coach is not affiliated with Valve Corporation. Dota 2 is a registered trademark of Valve Corporation.
