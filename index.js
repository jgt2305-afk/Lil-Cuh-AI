const express = require('express');
const path = require('path');
const { VM } = require('vm2');
const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Console logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\x1b[36m[${timestamp}] ${req.method} ${req.path}\x1b[0m`);
  next();
});

// Enhanced system prompt for WAY better code generation
const ENHANCED_SYSTEM_PROMPT = `You are Lil Cuh AI - an ELITE programmer and ultra-intelligent assistant.

🔥 CRITICAL CODE GENERATION RULES 🔥
You are now operating at EXPERT level. Follow these rules strictly:

1. PLANNING PHASE (do this mentally before coding):
   - Break down the problem into logical steps
   - Identify edge cases and potential bugs
   - Choose optimal data structures and algorithms
   - Consider performance implications

2. CODE QUALITY STANDARDS:
   ✓ Clean, readable, self-documenting code
   ✓ Meaningful variable/function names (no x, y, temp, data)
   ✓ Proper error handling with try-catch blocks
   ✓ Input validation for all user data
   ✓ Comments explaining WHY, not what
   ✓ DRY principle - no repeated code
   ✓ Single Responsibility - one function, one purpose
   ✓ Modern ES6+ syntax (const/let, arrow functions, destructuring)

3. BUG PREVENTION:
   ✓ Check for null/undefined before accessing properties
   ✓ Validate array indices before access
   ✓ Handle async errors with try-catch
   ✓ Prevent division by zero
   ✓ Sanitize user inputs to prevent XSS/injection
   ✓ Use === instead of ==
   ✓ Close resources (files, connections, intervals)

4. PERFORMANCE OPTIMIZATION:
   ✓ Use efficient algorithms (avoid O(n²) when possible)
   ✓ Cache computed values
   ✓ Avoid unnecessary DOM manipulation
   ✓ Debounce/throttle event handlers
   ✓ Lazy load when appropriate

5. SPECIFIC LANGUAGE GUIDELINES:

   JavaScript/TypeScript:
   - Use const by default, let when needed, never var
   - Prefer map/filter/reduce over loops for arrays
   - Use async/await over .then() chains
   - Always handle Promise rejections
   - Avoid callback hell with proper async patterns
   - Use optional chaining (?.) and nullish coalescing (??)

   HTML:
   - Semantic HTML5 tags (header, nav, main, article, etc.)
   - Proper ARIA labels for accessibility
   - Include meta viewport for responsive design
   - Add alt text to all images

   CSS:
   - Mobile-first responsive design
   - Use CSS Grid/Flexbox for layouts
   - Avoid !important
   - Use CSS variables for theming
   - BEM or consistent naming convention

6. CODE STRUCTURE PATTERNS:
   - Factory pattern for object creation
   - Module pattern for encapsulation
   - Observer pattern for event handling
   - Singleton for global state (use sparingly)

7. DOCUMENTATION:
   - Brief description of what code does
   - Parameter types and return types
   - Usage examples
   - Edge cases and limitations

8. TESTING MINDSET:
   - Think about: "How could this break?"
   - Consider: null, undefined, empty strings, 0, NaN, Infinity
   - Test boundary conditions
   - Verify error handling paths

WHEN GENERATING CODE:
1. First explain your approach and reasoning
2. Then provide the complete, tested code
3. Add inline comments for complex logic
4. Include usage examples
5. Warn about potential gotchas
6. Suggest improvements if relevant

NEVER:
❌ Use eval() - major security risk
❌ Use innerHTML without sanitization
❌ Ignore error handling
❌ Write cryptic one-liners
❌ Hardcode sensitive data
❌ Use deprecated methods
❌ Create memory leaks (uncleared intervals/listeners)

YOU CAN ALSO:
🌐 Access any website and extract information
🎮 Provide Steam game guides using Wikipedia
📊 Analyze data and create visualizations  
🎨 Generate images, videos, and sounds
🍳 Share recipes and cooking tips
💊 Give health and fitness advice
📚 Explain complex topics simply

Always write code like you're coding for production - clean, tested, maintainable.`;

// Advanced code validation with actual execution
async function validateCode(code, language) {
  console.log(`\x1b[33m[CODE VALIDATOR] Analyzing ${language} code...\x1b[0m`);
  
  const errors = [];
  const warnings = [];
  const suggestions = [];
  
  try {
    if (language === 'javascript' || language === 'js') {
      // Run code in isolated VM to catch runtime errors
      const vm = new VM({
        timeout: 1000,
        sandbox: {}
      });
      
      try {
        vm.run(code);
        console.log(`\x1b[32m[CODE VALIDATOR] ✓ Code executes without errors\x1b[0m`);
      } catch (vmError) {
        errors.push(`Runtime Error: ${vmError.message}`);
        console.log(`\x1b[31m[CODE VALIDATOR] ✗ ${vmError.message}\x1b[0m`);
      }
      
      // Static analysis checks
      if (code.includes('var ')) {
        warnings.push('Using "var" - use "const" or "let" for block scoping');
      }
      if (code.match(/==(?!=)/g)) {
        warnings.push('Using "==" - use "===" for type-safe comparisons');
      }
      if (code.includes('eval(')) {
        errors.push('🚨 SECURITY RISK: eval() can execute malicious code');
      }
      if (/await\s/.test(code) && !/try\s*{/.test(code)) {
        warnings.push('Async/await without try-catch - errors won\'t be handled');
      }
      if (/\.then\(/.test(code) && !/\.catch\(/.test(code)) {
        warnings.push('Promise chain missing .catch() - rejections won\'t be handled');
      }
      if (code.includes('innerHTML') && !code.includes('sanitize')) {
        warnings.push('innerHTML without sanitization - potential XSS vulnerability');
      }
      if (/for\s*\(.*\.length/.test(code)) {
        suggestions.push('Cache array.length in variable for better performance');
      }
      if (/setTimeout|setInterval/.test(code) && !/clear/.test(code)) {
        warnings.push('Missing clearTimeout/clearInterval - potential memory leak');
      }
      if (/addEventListener/.test(code) && !/removeEventListener/.test(code)) {
        suggestions.push('Consider removing event listeners to prevent memory leaks');
      }
      if (code.split('\n').some(line => line.length > 120)) {
        suggestions.push('Some lines exceed 120 characters - consider breaking them up');
      }
      
    } else if (language === 'html') {
      if (!code.includes('<!DOCTYPE html>')) {
        errors.push('Missing <!DOCTYPE html> declaration');
      }
      if (!code.match(/<html[^>]*>/i) || !code.includes('</html>')) {
        errors.push('Missing <html> tags');
      }
      if (!code.includes('<head>')) {
        warnings.push('Missing <head> section');
      }
      if (!code.includes('<title>')) {
        warnings.push('Missing <title> - bad for SEO');
      }
      if (!code.includes('charset')) {
        warnings.push('Missing charset declaration - add <meta charset="UTF-8">');
      }
      if (!code.includes('viewport')) {
        suggestions.push('Add viewport meta tag for mobile responsiveness');
      }
      if (/<img\s[^>]*>/.test(code) && !/<img\s[^>]*alt=/.test(code)) {
        warnings.push('Images missing alt attributes - bad for accessibility');
      }
      
      const openTags = (code.match(/<[^/][^>]*>/g) || []).length;
      const closeTags = (code.match(/<\/[^>]*>/g) || []).length;
      if (Math.abs(openTags - closeTags) > 3) {
        warnings.push(`Tag mismatch: ${openTags} opening vs ${closeTags} closing tags`);
      }
      
      console.log(`\x1b[32m[CODE VALIDATOR] ✓ HTML structure validated\x1b[0m`);
      
    } else if (language === 'css') {
      const braceOpen = (code.match(/{/g) || []).length;
      const braceClose = (code.match(/}/g) || []).length;
      if (braceOpen !== braceClose) {
        errors.push(`Brace mismatch: ${braceOpen} opening vs ${braceClose} closing`);
      }
      
      if ((code.match(/!important/g) || []).length > 3) {
        warnings.push('Overusing !important makes CSS hard to maintain');
      }
      if (code.includes('float:') && !code.includes('clear')) {
        suggestions.push('Using floats without clear - consider Flexbox/Grid instead');
      }
      
      console.log(`\x1b[32m[CODE VALIDATOR] ✓ CSS syntax validated\x1b[0m`);
    }
    
    // Summary
    if (errors.length > 0) {
      console.log(`\x1b[31m[CODE VALIDATOR] ❌ ${errors.length} critical error(s) found\x1b[0m`);
    }
    if (warnings.length > 0) {
      console.log(`\x1b[33m[CODE VALIDATOR] ⚠️  ${warnings.length} warning(s) found\x1b[0m`);
    }
    if (suggestions.length > 0) {
      console.log(`\x1b[36m[CODE VALIDATOR] 💡 ${suggestions.length} suggestion(s)\x1b[0m`);
    }
    if (errors.length === 0 && warnings.length === 0) {
      console.log(`\x1b[32m[CODE VALIDATOR] 🎉 Code looks great!\x1b[0m`);
    }
    
  } catch (err) {
    console.log(`\x1b[31m[CODE VALIDATOR] Exception: ${err.message}\x1b[0m`);
    errors.push(`Validation error: ${err.message}`);
  }
  
  const score = Math.max(0, 100 - (errors.length * 25) - (warnings.length * 5) - (suggestions.length * 2));
  
  return { 
    errors, 
    warnings, 
    suggestions,
    isValid: errors.length === 0,
    score,
    grade: score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 70 ? 'C' : score >= 60 ? 'D' : 'F'
  };
}

// Web scraping - access ANY website
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    console.log(`\x1b[36m[WEB SCRAPER] 🌐 Fetching: ${url}\x1b[0m`);
    
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }
    
    try {
      new URL(url);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    if (!response.ok) {
      console.log(`\x1b[31m[WEB SCRAPER] ✗ HTTP ${response.status}\x1b[0m`);
      return res.status(response.status).json({ error: `HTTP ${response.status}` });
    }
    
    const html = await response.text();
    console.log(`\x1b[32m[WEB SCRAPER] ✓ Downloaded ${(html.length / 1024).toFixed(2)} KB\x1b[0m`);
    
    // Clean text extraction
    const textContent = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 20000);
    
    res.json({ 
      success: true,
      html, 
      textContent,
      url,
      size: html.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`\x1b[31m[WEB SCRAPER] ✗ ${error.message}\x1b[0m`);
    res.status(500).json({ error: error.message });
  }
});

// Steam game guides via Wikipedia
app.post('/api/steam-guide', async (req, res) => {
  try {
    const { gameName } = req.body;
    console.log(`\x1b[36m[STEAM GUIDE] 🎮 Searching: ${gameName}\x1b[0m`);
    
    if (!gameName) {
      return res.status(400).json({ error: 'Game name required' });
    }
    
    // Wikipedia search
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(gameName + ' video game')}&format=json&origin=*&srlimit=5`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.query || searchData.query.search.length === 0) {
      console.log(`\x1b[33m[STEAM GUIDE] ⚠️  No results for: ${gameName}\x1b[0m`);
      return res.json({ 
        found: false, 
        message: `No Wikipedia page found for "${gameName}"`
      });
    }
    
    const pageTitle = searchData.query.search[0].title;
    const pageId = searchData.query.search[0].pageid;
    
    console.log(`\x1b[32m[STEAM GUIDE] ✓ Found: ${pageTitle}\x1b[0m`);
    
    // Get full content
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&explaintext&pageids=${pageId}&inprop=url&format=json&origin=*`;
    
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();
    
    const page = contentData.query.pages[pageId];
    const extract = page.extract;
    const wikiUrl = page.fullurl || `https://en.wikipedia.org/?curid=${pageId}`;
    
    // Get sections (gameplay, story, etc.)
    const sectionsUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(pageTitle)}&prop=sections&format=json&origin=*`;
    const sectionsResponse = await fetch(sectionsUrl);
    const sectionsData = await sectionsResponse.json();
    
    const sections = sectionsData.parse?.sections?.map(s => s.line).slice(0, 15) || [];
    
    console.log(`\x1b[32m[STEAM GUIDE] ✓ Retrieved ${(extract.length / 1024).toFixed(1)} KB, ${sections.length} sections\x1b[0m`);
    
    res.json({
      found: true,
      title: pageTitle,
      content: extract.substring(0, 5000), // First 5k chars
      fullContent: extract,
      url: wikiUrl,
      sections: sections,
      relatedGames: searchData.query.search.slice(1, 4).map(r => r.title),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`\x1b[31m[STEAM GUIDE] ✗ ${error.message}\x1b[0m`);
    res.status(500).json({ error: error.message });
  }
});

// Code validation endpoint
app.post('/api/validate-code', async (req, res) => {
  try {
    const { code, language } = req.body;
    console.log(`\x1b[36m[API] 🔍 Validating ${language} code...\x1b[0m`);
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language required' });
    }
    
    const validation = await validateCode(code, language);
    
    console.log(`\x1b[${validation.isValid ? '32' : '31'}m[API] ${validation.isValid ? '✓' : '✗'} Score: ${validation.score}/100 (Grade: ${validation.grade})\x1b[0m`);
    
    res.json(validation);
    
  } catch (error) {
    console.error(`\x1b[31m[API] ✗ ${error.message}\x1b[0m`);
    res.status(500).json({ error: error.message });
  }
});

// Enhanced chat with better AI
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system, max_tokens = 4096 } = req.body;
    
    const userMessage = messages[messages.length - 1]?.content;
    const preview = typeof userMessage === 'string' ? userMessage.substring(0, 60) : '[file/image]';
    console.log(`\x1b[36m[CHAT] 💬 "${preview}..."\x1b[0m`);

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error(`\x1b[31m[CHAT] ✗ API key missing\x1b[0m`);
      return res.status(500).json({ error: 'API key not configured' });
    }

    const enhancedSystem = system || ENHANCED_SYSTEM_PROMPT;

    console.log(`\x1b[33m[CHAT] 🤖 Sending to Claude...\x1b[0m`);
    
    const startTime = Date.now();
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens,
        system: enhancedSystem,
        messages
      })
    });

    const responseTime = Date.now() - startTime;

    if (!response.ok) {
      const error = await response.text();
      console.error(`\x1b[31m[CHAT] ✗ API error: ${response.status}\x1b[0m`);
      return res.status(response.status).json({ error: 'API failed', details: error });
    }

    const data = await response.json();
    const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);
    
    console.log(`\x1b[32m[CHAT] ✓ Response: ${responseTime}ms, ${tokensUsed} tokens\x1b[0m`);
    
    res.json(data);
  } catch (error) {
    console.error(`\x1b[31m[CHAT] ✗ ${error.message}\x1b[0m`);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  const uptime = Math.floor(process.uptime());
  console.log(`\x1b[32m[HEALTH] ✓ System operational (${uptime}s uptime)\x1b[0m`);
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: uptime,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n\x1b[36m╔════════════════════════════════════════════╗\x1b[0m`);
  console.log(`\x1b[36m║  🚀 LIL CUH AI - ENHANCED EDITION 🚀      ║\x1b[0m`);
  console.log(`\x1b[36m╚════════════════════════════════════════════╝\x1b[0m`);
  console.log(`\x1b[32m✓ Server: http://localhost:${PORT}\x1b[0m`);
  console.log(`\x1b[32m✓ Code Validator: ACTIVE\x1b[0m`);
  console.log(`\x1b[32m✓ Web Scraper: ACTIVE\x1b[0m`);
  console.log(`\x1b[32m✓ Steam Guides: ACTIVE\x1b[0m`);
  console.log(`\x1b[32m✓ Enhanced AI: ACTIVE\x1b[0m`);
  console.log(`\x1b[36m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m\n`);
});
