#!/usr/bin/env node

/**
 * 汎用 Gemini 画像生成スクリプト
 *
 * Usage:
 *   node .agents/skills/image-generation/scripts/generate_image.mjs --prompt "..." --output path/to/output.png [options]
 *
 * Options:
 *   --prompt, -p       画像生成プロンプト (必須)
 *   --output, -o       出力ファイルパス (必須, .png)
 *   --ref, -r          参照画像パス (複数指定可: --ref a.jpg --ref b.jpg)
 *   --model, -m        モデル名 (default: pro)
 *                        pro     = gemini-3-pro-image-preview
 *                        flash   = gemini-2.5-flash-image
 *                        flash31 = gemini-3.1-flash-image-preview
 *   --model-id         Gemini model IDを直接指定 (e.g. gemini-3.1-flash-image-preview)
 *   --aspect, -a       アスペクト比 (default: 4:3)
 *                        1:1, 9:16, 16:9, 3:4, 4:3, 3:2, 2:3, 5:4, 4:5, 21:9
 *   --help, -h         ヘルプ表示
 *
 * Examples:
 *   # 基本的な使い方
 *   node .agents/skills/image-generation/scripts/generate_image.mjs \
 *     -p "A cat sitting on a windowsill" \
 *     -o output/cat.png
 *
 *   # 参照画像付き（顔の一貫性）
 *   node .agents/skills/image-generation/scripts/generate_image.mjs \
 *     -p "A young man (use the face from the first reference image)..." \
 *     -r path/to/face1.jpg \
 *     -r path/to/face2.jpg \
 *     -o output/portrait.png
 *
 *   # Flash モデル + 16:9
 *   node .agents/skills/image-generation/scripts/generate_image.mjs \
 *     -p "A panoramic cityscape at sunset" -o output/city.png -m flash -a 16:9
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// ── 定数 ──────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..', '..', '..');

const MODELS = {
  pro: 'gemini-3-pro-image-preview',
  flash: 'gemini-2.5-flash-image',
  flash31: 'gemini-3.1-flash-image-preview',
};

const VALID_ASPECTS = ['1:1', '9:16', '16:9', '3:4', '4:3', '3:2', '2:3', '5:4', '4:5', '21:9'];

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// ── APIキー取得 ───────────────────────────────────

function loadApiKey() {
  // 1. 環境変数を優先
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_AI_API_KEY) return process.env.GOOGLE_AI_API_KEY;

  // 2. .mcp.json 内の全サーバーから GOOGLE_AI_API_KEY / GEMINI_API_KEY を探索
  const mcpPath = path.join(PROJECT_ROOT, '.mcp.json');
  if (fs.existsSync(mcpPath)) {
    try {
      const mcp = JSON.parse(fs.readFileSync(mcpPath, 'utf-8'));
      const servers = mcp?.mcpServers || {};
      for (const server of Object.values(servers)) {
        const env = server?.env || {};
        const key = env.GEMINI_API_KEY || env.GOOGLE_AI_API_KEY;
        if (key) return key;
      }
    } catch { /* ignore parse errors */ }
  }

  console.error('❌ API key not found. Set GEMINI_API_KEY env var or add it to .mcp.json');
  process.exit(1);
}

// ── 引数パース ────────────────────────────────────

function parseArgs(argv) {
  const args = {
    prompt: null,
    output: null,
    refs: [],
    model: 'pro',
    modelId: null,
    aspect: '4:3',
  };

  let i = 2; // skip node, script
  while (i < argv.length) {
    const arg = argv[i];
    switch (arg) {
      case '--prompt': case '-p':
        args.prompt = argv[++i];
        break;
      case '--output': case '-o':
        args.output = argv[++i];
        break;
      case '--ref': case '-r':
        args.refs.push(argv[++i]);
        break;
      case '--model': case '-m':
        args.model = argv[++i];
        break;
      case '--model-id':
        args.modelId = argv[++i];
        break;
      case '--aspect': case '-a':
        args.aspect = argv[++i];
        break;
      case '--help': case '-h':
        printHelp();
        process.exit(0);
      default:
        console.error(`⚠️  Unknown argument: ${arg}`);
        printHelp();
        process.exit(1);
    }
    i++;
  }

  // バリデーション
  if (!args.prompt) {
    console.error('❌ --prompt (-p) is required');
    printHelp();
    process.exit(1);
  }
  if (!args.output) {
    console.error('❌ --output (-o) is required');
    printHelp();
    process.exit(1);
  }
  if (!args.modelId && !MODELS[args.model]) {
    console.error(`❌ Invalid model: ${args.model}. Use: ${Object.keys(MODELS).join(', ')}`);
    process.exit(1);
  }
  if (!VALID_ASPECTS.includes(args.aspect)) {
    console.error(`❌ Invalid aspect: ${args.aspect}. Use: ${VALID_ASPECTS.join(', ')}`);
    process.exit(1);
  }

  return args;
}

function printHelp() {
  const helpText = `
Usage: node scripts/generate_image.mjs --prompt "..." --output path.png [options]

Options:
  --prompt, -p   画像生成プロンプト (必須)
  --output, -o   出力ファイルパス (必須)
  --ref,    -r   参照画像パス (複数可)
  --model,  -m   モデル: pro (default) / flash / flash31
  --model-id     Gemini model ID (e.g. gemini-3.1-flash-image-preview)
  --aspect, -a   アスペクト比 (default: 4:3)
  --help,   -h   ヘルプ表示
`;
  console.log(helpText);
}

// ── 画像生成 ──────────────────────────────────────

function imageToBase64(imagePath) {
  const resolved = path.isAbsolute(imagePath) ? imagePath : path.resolve(PROJECT_ROOT, imagePath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ Reference image not found: ${resolved}`);
    process.exit(1);
  }
  return fs.readFileSync(resolved).toString('base64');
}

async function generateImage({ prompt, refs, output, model, modelId, aspect, apiKey }) {
  const modelName = modelId || MODELS[model];
  const url = `${GEMINI_API_BASE}/${modelName}:streamGenerateContent?key=${apiKey}`;

  const parts = [];

  // 参照画像
  for (const ref of refs) {
    const base64 = imageToBase64(ref);
    const ext = path.extname(ref).toLowerCase();
    const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
    parts.push({ inlineData: { mimeType: mime, data: base64 } });
  }

  // プロンプト
  parts.push({ text: prompt });

  const requestBody = {
    contents: [{ role: 'user', parts }],
    generationConfig: {
      responseModalities: ['IMAGE', 'TEXT'],
      imageConfig: { aspectRatio: aspect },
    },
  };

  console.log(`\n🎨 Model:  ${modelName}`);
  console.log(`📐 Aspect: ${aspect}`);
  console.log(`🖼️  Refs:   ${refs.length > 0 ? refs.join(', ') : '(none)'}`);
  console.log(`📝 Prompt: ${prompt.length > 120 ? prompt.substring(0, 120) + '...' : prompt}`);
  console.log(`📁 Output: ${output}`);
  console.log(`\n⏳ Generating...`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`\n❌ API Error: ${response.status}`);
    console.error(errorText.substring(0, 500));
    process.exit(1);
  }

  const responseText = await response.text();

  try {
    const chunks = JSON.parse(responseText);
    let imageData = null;
    let textResponse = '';

    for (const chunk of chunks) {
      const responseParts = chunk?.candidates?.[0]?.content?.parts || [];
      for (const part of responseParts) {
        if (part.inlineData?.data) imageData = part.inlineData.data;
        else if (part.text) textResponse += part.text;
      }
      const finishReason = chunk?.candidates?.[0]?.finishReason;
      if (finishReason && finishReason !== 'STOP') {
        console.error(`⚠️  Finish reason: ${finishReason}`);
      }
    }

    if (imageData) {
      const outputPath = path.isAbsolute(output) ? output : path.resolve(PROJECT_ROOT, output);
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
      console.log(`\n✅ Saved: ${outputPath}`);
      if (textResponse) console.log(`💬 Model: ${textResponse}`);
    } else {
      console.error(`\n❌ No image data returned.`);
      if (textResponse) console.error(`💬 Model: ${textResponse}`);
      process.exit(1);
    }
  } catch (e) {
    console.error(`\n❌ Parse error: ${e.message}`);
    process.exit(1);
  }
}

// ── メイン ────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv);
  const apiKey = loadApiKey();

  await generateImage({
    prompt: args.prompt,
    refs: args.refs,
    output: args.output,
    model: args.model,
    modelId: args.modelId,
    aspect: args.aspect,
    apiKey,
  });
}

main().catch((e) => {
  console.error(`\n❌ ${e.message}`);
  process.exit(1);
});
