#!/usr/bin/env node
import { execSync } from 'child_process';
import { existsSync, cpSync, mkdirSync } from 'fs';
import { join } from 'path';

console.log('🔍 Building site for Pagefind indexing...');

try {
  // Build the site
  console.log('📦 Building Astro site...');
  execSync('astro build --mode development', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Check if dist directory exists
  const distPath = join(process.cwd(), 'dist');
  if (!existsSync(distPath)) {
    console.warn('⚠️  dist directory not found after build');
    process.exit(0);
  }

  // Run Pagefind
  console.log('🔍 Indexing site with Pagefind...');
  execSync('pagefind --site dist', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

  // Copy Pagefind files to public directory so dev server can serve them
  const pagefindDist = join(distPath, 'pagefind');
  const pagefindPublic = join(process.cwd(), 'public', 'pagefind');
  
  if (existsSync(pagefindDist)) {
    console.log('📋 Copying Pagefind files to public directory...');
    // Remove old pagefind directory if it exists
    if (existsSync(pagefindPublic)) {
      execSync(`rm -rf "${pagefindPublic}"`, { cwd: process.cwd() });
    }
    // Ensure public directory exists
    mkdirSync(join(process.cwd(), 'public'), { recursive: true });
    // Copy pagefind files
    cpSync(pagefindDist, pagefindPublic, { recursive: true });
    console.log('✅ Search index created and copied to public directory!');
  } else {
    console.warn('⚠️  Pagefind directory not found in dist');
  }
} catch (error) {
  console.warn('⚠️  Failed to create search index (this is OK in dev mode):', error.message);
  // Don't fail the process - search will work after a full build
  process.exit(0);
}
