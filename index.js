const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Enhanced console logging
const log = {
  info: (msg) => console.log(`\x1b[36m[INFO]\x1b[0m ${new Date().toISOString()} - ${msg}`),
  error: (msg) => console.error(`\x1b[31m[ERROR]\x1b[0m ${new Date().toISOString()} - ${msg}`),
  success: (msg) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${new Date().toISOString()} - ${msg}`),
  warning: (msg) => console.warn(`\x1b[33m[WARNING]\x1b[0m ${new Date().toISOString()} - ${msg}`),
  api: (msg) => console.log(`\x1b[35m[API]\x1b[0m ${new Date().toISOString()} - ${msg}`)
};

// Web scraping endpoint - access any website
app.post('/api/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    log.info(`🌐 Scraping request for: ${url}`);

    if (!url) {
      log.error('No URL provided');
      return res.status(400).json({ error: 'URL is required' });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      log.error(`Failed to scrape: HTTP ${response.status}`);
      return res.status(response.status).json({ error: `Failed to fetch: ${response.status}` });
    }

    const html = await response.text();
    
    // Extract clean text content
    const cleanText = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    log.success(`✓ Scraped ${cleanText.length} characters from ${url}`);
    res.json({ 
      content: cleanText.substring(0, 15000),
      fullLength: cleanText.length,
      url: url
    });
  } catch (error) {
    log.error(`Scraping failed: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Steam game guide via Wikipedia
app.post('/api/game-guide', async (req, res) => {
  try {
    const { gameName } = req.body;
    log.info(`🎮 Game guide request: "${gameName}"`);

    if (!gameName) {
      return res.status(400).json({ error: 'Game name is required' });
    }

    // Search Wikipedia for the game
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(gameName + ' video game')}&format=json&origin=*`;
    log.api(`Searching Wikipedia for: ${gameName}`);
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.query || !searchData.query.search.length) {
      log.warning(`No Wikipedia results for: ${gameName}`);
      return res.json({ 
        content: `No Wikipedia page found for "${gameName}". Try a different name or check spelling.`,
        found: false
      });
    }

    const pageTitle = searchData.query.search[0].title;
    log.info(`Found Wikipedia page: ${pageTitle}`);
    
    // Get full page content
    const contentUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=false&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const contentResponse = await fetch(contentUrl);
    const contentData = await contentResponse.json();

    const pages = contentData.query.pages;
    const pageId = Object.keys(pages)[0];
    const extract = pages[pageId].extract || 'No content available.';

    // Clean HTML tags
    const cleanText = extract
      .replace(/<[^>]+>/g, '\n')
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    log.success(`✓ Retrieved ${cleanText.length} chars for "${pageTitle}"`);
    
    res.json({ 
      title: pageTitle,
      content: cleanText,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`,
      found: true
    });
  } catch (error) {
    log.error(`Game guide error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Code validation and bug checking
app.post('/api/validate-code', async (req, res) => {
  try {
    const { code, language } = req.body;
    log.info(`🔍 Validating ${language} code (${code.length} chars)`);

    const issues = [];
    const warnings = [];
    const suggestions = [];

    if (language === 'javascript' || language === 'js') {
      // Syntax checks
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      const openBrackets = (code.match(/\[/g) || []).length;
      const closeBrackets = (code.match(/\]/g) || []).length;

      if (openBraces !== closeBraces) {
        issues.push(`⚠️ Unmatched braces: ${openBraces} open, ${closeBraces} close`);
      }
      if (openParens !== closeParens) {
        issues.push(`⚠️ Unmatched parentheses: ${openParens} open, ${closeParens} close`);
      }
      if (openBrackets !== closeBrackets) {
        issues.push(`⚠️ Unmatched brackets: ${openBrackets} open, ${closeBrackets} close`);
      }

      // Common mistakes
      if (code.includes('console.log') && code.match(/console\.log\s*[^(]/)) {
        issues.push('❌ Missing parentheses in console.log()');
      }
      if (code.match(/const\s+\w+\s*;/)) {
        issues.push('❌ const declaration without initialization');
      }
      if (code.match(/if\s*\([^)]+\)\s*;/)) {
        warnings.push('⚡ Empty if statement detected');
      }
      if (code.match(/function\s+\w+\s*\([^)]*\)\s*{\s*}/)) {
        warnings.push('⚡ Empty function detected');
      }
      if (!code.includes('use strict') && code.length > 100) {
        suggestions.push('💡 Consider adding "use strict" for better error catching');
      }
      if (code.includes('var ')) {
        suggestions.push('💡 Use const/let instead of var for better scoping');
      }

    } else if (language === 'python' || language === 'py') {
      // Python checks
      if (code.match(/print\s+[^(]/)) {
        issues.push('❌ Missing parentheses in print() - Python 3 syntax');
      }
      if (code.match(/def\s+\w+\([^)]*\):\s*$/m)) {
        issues.push('❌ Empty function definition');
      }
      const indentIssues = code.match(/^\s+\w+/gm);
      if (indentIssues && indentIssues.some(line => line.match(/^\s+/) && !line.match(/^\s{4}/) && !line.match(/^\t/))) {
        warnings.push('⚡ Inconsistent indentation detected');
      }

    } else if (language === 'html') {
      // HTML checks
      if (!code.includes('<!DOCTYPE html>') && !code.includes('<!doctype html>')) {
        warnings.push('⚡ Missing DOCTYPE declaration');
      }
      if (!code.includes('<html') && code.length > 50) {
        warnings.push('⚡ Missing <html> tag');
      }
      
      // Check for unclosed tags
      const tags = code.match(/<(\w+)[^>]*>/g) || [];
      const closeTags = code.match(/<\/(\w+)>/g) || [];
      const selfClosing = ['img', 'br', 'hr', 'input', 'meta', 'link'];
      
      tags.forEach(tag => {
        const tagName = tag.match(/<(\w+)/)[1].toLowerCase();
        if (!selfClosing.includes(tagName)) {
          const openCount = (code.match(new RegExp(`<${tagName}[^>]*>`, 'gi')) || []).length;
          const closeCount = (code.match(new RegExp(`<\/${tagName}>`, 'gi')) || []).length;
          if (openCount !== closeCount) {
            issues.push(`❌ Unclosed <${tagName}> tag: ${openCount} open, ${closeCount} close`);
          }
        }
      });

    } else if (language === 'css') {
      // CSS checks
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      if (openBraces !== closeBraces) {
        issues.push(`⚠️ Unmatched braces in CSS: ${openBraces} open, ${closeBraces} close`);
      }
      if (code.match(/[^:]\s*;/g)) {
        warnings.push('⚡ Possible missing property value');
      }
    }

    const result = {
      valid: issues.length === 0,
      issues: issues,
      warnings: warnings,
      suggestions: suggestions,
      summary: issues.length === 0 ? '✅ Code looks good!' : `Found ${issues.length} issue(s)`
    };

    if (issues.length > 0) {
      log.warning(`Found ${issues.length} issues, ${warnings.length} warnings`);
    } else {
      log.success('✓ Code validation passed');
    }

    res.json(result);
  } catch (error) {
    log.error(`Validation error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

// Main chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, system, max_tokens = 4096 } = req.body;

    log.info(`💬 Chat request received (${messages.length} messages)`);

    if (!process.env.ANTHROPIC_API_KEY) {
      log.error('❌ API key not configured in environment');
      return res.status(500).json({ error: 'API key not configured' });
    }

    log.api('Sending request to Claude API...');

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
        system,
        messages
      })
    });

    if (!response.ok) {
      const error = await response.text();
      log.error(`API request failed: ${response.status}`);
      return res.status(response.status).json({ error: 'API failed', details: error });
    }

    const data = await response.json();
    log.success(`✓ Response received (${data.content?.[0]?.text?.length || 0} chars)`);
    res.json(data);
  } catch (error) {
    log.error(`Chat error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  log.success(`🚀 Lil Cuh AI Server is running!`);
  log.info(`📡 Port: ${PORT}`);
  log.info(`🌍 Access at: http://localhost:${PORT}`);
  log.info(`🔑 API Key: ${process.env.ANTHROPIC_API_KEY ? '✓ Configured' : '❌ Missing'}`);
  console.log('='.repeat(50) + '\n');
  log.info('Available endpoints:');
  log.info('  POST /api/chat - Main AI chat');
  log.info('  POST /api/scrape - Web scraping');
  log.info('  POST /api/game-guide - Steam game guides');
  log.info('  POST /api/validate-code - Code validation');
  console.log('\n' + '='.repeat(50) + '\n');
});
