# 🚀 Ollama Setup Guide for CV Intelligence

This guide will help you set up Ollama for local LLM-powered CV analysis.

## 📥 Installation

### 1. Install Ollama

**macOS:**
```bash
# Download and install from official website
curl -fsSL https://ollama.ai/install.sh | sh

# Or using Homebrew
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [https://ollama.ai/download](https://ollama.ai/download)

### 2. Start Ollama Service

```bash
# Start Ollama service (runs on localhost:11434)
ollama serve
```

### 3. Pull Required Model

```bash
# Pull the recommended model for CV analysis
ollama pull llama3.1:8b

# Alternative models (if you have more RAM/GPU):
# ollama pull llama3.1:70b  # Better quality, requires more resources
# ollama pull mistral:7b    # Good alternative
# ollama pull codellama:7b  # Good for technical CV analysis
```

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Ollama Configuration
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

### Verify Installation

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# Test model generation
ollama run llama3.1:8b "Hello, how are you?"
```

## 🎯 CV Intelligence Features with LLM

### What the LLM Provides:

1. **Advanced CV Parsing:**
   - Accurate name, email, phone extraction
   - Comprehensive skill identification
   - Detailed work experience analysis
   - Education background parsing
   - Professional summary generation

2. **Intelligent Job Description Analysis:**
   - Position requirements extraction
   - Technical skills identification
   - Experience level requirements
   - Responsibility analysis

3. **Smart Candidate Matching:**
   - Contextual skill matching
   - Experience relevance assessment
   - Cultural fit evaluation
   - Growth potential analysis
   - Detailed recommendations

### Fallback Behavior:

If Ollama is not available, the system automatically falls back to:
- Basic regex-based parsing
- Keyword matching
- Simple scoring algorithms
- Clear indicators that LLM analysis is unavailable

## 🚀 Performance Tips

### Model Selection:
- **llama3.1:8b** - Recommended for most users (4-8GB RAM)
- **llama3.1:70b** - Best quality (32GB+ RAM recommended)
- **mistral:7b** - Good alternative, faster inference

### System Requirements:
- **Minimum**: 8GB RAM for 7B models
- **Recommended**: 16GB RAM for optimal performance
- **GPU**: Optional but significantly improves speed

### Optimization:
```bash
# Set model parameters for faster inference
export OLLAMA_NUM_PARALLEL=1
export OLLAMA_MAX_LOADED_MODELS=1
```

## 🔍 Troubleshooting

### Common Issues:

1. **Ollama not responding:**
   ```bash
   # Restart Ollama service
   pkill ollama
   ollama serve
   ```

2. **Model not found:**
   ```bash
   # List available models
   ollama list
   
   # Pull missing model
   ollama pull llama3.1:8b
   ```

3. **Out of memory:**
   ```bash
   # Use smaller model
   ollama pull mistral:7b
   
   # Update OLLAMA_MODEL in .env
   OLLAMA_MODEL=mistral:7b
   ```

4. **Slow performance:**
   - Use GPU acceleration if available
   - Reduce model size
   - Increase system RAM

## 📊 Expected Results

### With LLM (Ollama):
- **Accuracy**: 90-95% for CV parsing
- **Detail**: Comprehensive analysis with context
- **Matching**: Intelligent, nuanced candidate scoring
- **Speed**: 2-5 seconds per CV (depending on model)

### Without LLM (Fallback):
- **Accuracy**: 60-70% for basic parsing
- **Detail**: Limited to regex patterns
- **Matching**: Simple keyword matching
- **Speed**: <1 second per CV

## 🎉 Success Indicators

When Ollama is working correctly, you'll see:

1. **Console Logs:**
   ```
   ✅ Ollama available with model: llama3.1:8b
   🧠 Analyzing CV with local LLM...
   ✅ LLM CV analysis completed
   ```

2. **Enhanced Results:**
   - Detailed personal information extraction
   - Comprehensive skill lists
   - Rich experience descriptions
   - Intelligent matching insights

3. **Better Candidate Profiles:**
   - Professional summaries
   - Growth potential assessments
   - Cultural fit evaluations
   - Actionable hiring recommendations

## 🔄 Updates

Keep Ollama and models updated:

```bash
# Update Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Update models
ollama pull llama3.1:8b
```

---

**Need Help?** 
- Check Ollama docs: [https://ollama.ai/docs](https://ollama.ai/docs)
- Join Ollama Discord: [https://discord.gg/ollama](https://discord.gg/ollama)
- CV Intelligence will work with basic analysis even without Ollama!
