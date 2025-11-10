import { promises as fs } from 'fs';
import path from 'path';
import process from 'process';
import crypto from 'crypto';

// Tek kaynak: paylaşılan promptlar
import { CATEGORY_SYSTEM_PROMPTS } from '../shared/exam-config';

// ---------- Config ----------
type CheckContext = 'frontend' | 'edge';

const repoRoot = process.cwd();
const configs: Array<{ root: string; context: CheckContext }> = [
  { root: path.join(repoRoot, 'src'), context: 'frontend' },
  { root: path.join(repoRoot, 'supabase', 'functions'), context: 'edge' },
];

const ignoredDirectories = new Set([
  'node_modules', '.git', '.next', 'dist', 'build', 'out', '.turbo', '.vercel',
]);

const SHARED_RELATIVE = normalizePath(path.join('shared', 'exam-config.ts'));

const FRONTEND_ALLOWED_IMPORTS = new Set([
  '@/shared/exam-config',
  '@shared/exam-config',
  '@/../shared/exam-config',
]);

const INLINE_PROMPT_ALLOW = new Set([
  normalizePath(path.join('src', 'app', 'api', 'evaluate', 'route.ts')),
  normalizePath(path.join('shared', 'scoring-config.ts')),
]);

const CATEGORY_TOKENS = [
  'CATEGORY_SYSTEM_PROMPTS',
  'SESSION_CONFIGS',
  'getCategoryDisplayName',
];

// ---------- State ----------
const usageFiles = new Set<string>(); // files that actually reference shared constants
const duplicatePromptDefinitions: string[] = [];
const duplicateDisplayNameDefinitions: string[] = [];
const importErrors: string[] = [];

// ---------- Utils ----------
function normalizePath(p: string): string {
  return p.split(path.sep).join('/');
}

async function walkDir(root: string): Promise<string[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    if (ignoredDirectories.has(e.name)) continue;
    const full = path.join(root, e.name);
    if (e.isDirectory()) files.push(...(await walkDir(full)));
    else if (e.isFile() && /\.(ts|tsx|mts|cts|js|jsx)$/.test(e.name)) files.push(full);
  }
  return files;
}

function recordUsage(relativePath: string) {
  usageFiles.add(relativePath);
}

function checkForDuplicateDefinitions(relativePath: string, contents: string) {
  if (INLINE_PROMPT_ALLOW.has(relativePath)) {
    return;
  }

  const hasCategoryObject =
    /CATEGORY_SYSTEM_PROMPTS\s*:\s*Record<[^>]+>\s*=\s*\{[\s\S]*?(introduction:)[\s\S]*?(aviation:)[\s\S]*?(situational:)[\s\S]*?(cultural:)[\s\S]*?(professional:)[\s\S]*?\}/m.test(
      contents
    ) ||
    /const\s+CATEGORY_SYSTEM_PROMPTS\s*=\s*\{[\s\S]*?(introduction:)[\s\S]*?(aviation:)[\s\S]*?(situational:)[\s\S]*?(cultural:)[\s\S]*?(professional:)[\s\S]*?\}/m.test(
      contents
    );

  if (hasCategoryObject) {
    duplicatePromptDefinitions.push(
      `${relativePath}: inline CATEGORY_SYSTEM_PROMPTS detected; use shared import`
    );
  }

  const hasLocalDisplayName =
    /function\s+getCategoryDisplayName\s*\(|export\s+function\s+getCategoryDisplayName\s*\(/.test(contents);

  if (hasLocalDisplayName) {
    duplicateDisplayNameDefinitions.push(
      `${relativePath}: local getCategoryDisplayName() found (should import from shared)`
    );
  }
}

function hasAllowedFrontendImport(contents: string): boolean {
  for (const allowed of FRONTEND_ALLOWED_IMPORTS) {
    if (
      contents.includes(`from '${allowed}'`) ||
      contents.includes(`from "${allowed}"`)
    ) {
      return true;
    }
  }
  return false;
}

function checkImportPaths(relativePath: string, contents: string, context: CheckContext) {
  if (context === 'frontend') {
    if (!hasAllowedFrontendImport(contents)) {
      importErrors.push(`${relativePath}: missing shared exam-config import on FE`);
    }
    return;
  }

  if (context === 'edge') {
    const importMatches = contents.matchAll(/from\s+['"]([^'"]+)['"]/g);
    let ok = false;

    for (const [, rawImport] of importMatches) {
      const normalized = rawImport.replace(/\\/g, '/');
      if (normalized.endsWith('shared/exam-config.ts')) {
        ok = true;
        break;
      }
    }

    if (!ok) {
      importErrors.push(
        `${relativePath}: missing shared exam-config import on Edge`
      );
    }
  }
}

function sha10(s: string) {
  return crypto.createHash('sha1').update(s, 'utf8').digest('hex').slice(0, 10);
}

// ---------- Main ----------
async function main() {
  for (const { root, context } of configs) {
    let files: string[] = [];
    try {
      files = await walkDir(root);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') continue;
      throw error;
    }

    for (const file of files) {
      const relativePath = normalizePath(path.relative(repoRoot, file));
      if (!relativePath || relativePath.endsWith(SHARED_RELATIVE)) continue;
      if (relativePath.includes('/_shared/')) continue;

      const contents = await fs.readFile(file, 'utf8');

      const usesCategory = CATEGORY_TOKENS.some((token) =>
        contents.includes(token)
      );

      if (usesCategory) {
        recordUsage(relativePath);
        checkImportPaths(relativePath, contents, context);
      }

      checkForDuplicateDefinitions(relativePath, contents);
    }
  }

  const usageList = Array.from(usageFiles).sort();

  if (usageList.length > 0) {
    console.log('=== CATEGORY_SYSTEM_PROMPTS Usage ===');
    for (const f of usageList) console.log(`- ${f}`);
    console.log('');
  }

  console.log('=== Shared Prompt Fingerprints ===');
  for (const [key, prompt] of Object.entries(CATEGORY_SYSTEM_PROMPTS)) {
    const normalized = prompt.replace(/\s+/g, ' ').trim();
    const fp = sha10(normalized);
    const preview = normalized.length > 200 ? `${normalized.slice(0, 200)}…` : normalized;
    console.log(`- ${key}: ${fp}  (first200: ${preview})`);
  }
  console.log('');

  const issues = [
    ...duplicatePromptDefinitions,
    ...duplicateDisplayNameDefinitions,
    ...importErrors,
  ];

  if (issues.length > 0) {
    console.log('Result: ❌ MISMATCHES FOUND\n');
    console.log('Details:');
    for (const issue of issues.sort()) console.log(` - ${issue}`);
    process.exit(1);
  } else {
    console.log('Result: ✅ ALL USING SHARED PROMPTS');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

