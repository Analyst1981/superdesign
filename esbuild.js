const esbuild = require("esbuild");

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * @type {import('esbuild').Plugin}
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			result.errors.forEach(({ text, location }) => {
				console.error(`✘ [ERROR] ${text}`);
				console.error(`    ${location.file}:${location.line}:${location.column}:`);
			});
			console.log('[watch] build finished');
		});
	},
};

async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: 'silent',
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
		],
		// 性能优化配置
		incremental: true,
		metafile: true,
		define: {
			'process.env.NODE_ENV': production ? '"production"' : '"development"',
		},
		optimization: {
			// 常量折叠
			constants: true,
			// 去除未使用的代码
			unused: true,
			// 函数内联
			inline: true
		},
		// 分块配置
		splitting: false,
		chunkNames: 'chunks/[name]-[hash]',
		// 缓存配置
		assetNames: 'assets/[name]-[hash]',
		// 条件导入
		conditions: ['node', 'import'],
		// 别名配置
		alias: {
			// 可以添加模块别名以减少解析时间
		}
	});

	// Webview build context
	const webviewCtx = await esbuild.context({
		entryPoints: ['src/webview/index.tsx'],
		bundle: true,
		format: 'esm',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'dist/webview.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
		loader: {
		  '.css': 'text',
		  '.png': 'file',
		  '.jpg': 'file',
		  '.svg': 'file',
		},
		define: {
		  'process.env.NODE_ENV': production ? '"production"' : '"development"',
		},
		jsx: 'automatic', // This enables JSX support
		// 性能优化配置
		incremental: true,
		metafile: true,
		treeShaking: true,
		drop: production ? ['console', 'debugger'] : [],
		// 代码分割
		splitting: false,
		// 优化 CSS
		cssNamesPattern: '[name]-[hash]',
		// 缓存
		assetNames: 'assets/[name]-[hash]'
	});

	// Settings webview build context
	const settingsCtx = await esbuild.context({
		entryPoints: ['src/webview/settings.ts'],
		bundle: true,
		format: 'iife',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'browser',
		outfile: 'out/webview/settings.js',
		logLevel: 'silent',
		plugins: [esbuildProblemMatcherPlugin],
		loader: {
		  '.css': 'text',
		  '.png': 'file',
		  '.jpg': 'file',
		  '.svg': 'file',
		},
		define: {
		  'process.env.NODE_ENV': production ? '"production"' : '"development"',
		},
		// 性能优化配置
		incremental: true,
		metafile: true,
		treeShaking: true,
		drop: production ? ['console', 'debugger'] : []
	});

	if (watch) {
		await Promise.all([
			ctx.watch(),
			webviewCtx.watch(),
			settingsCtx.watch()
		]);
		console.log('Watching for changes...');
	} else {
		await Promise.all([
			ctx.rebuild(),
			webviewCtx.rebuild(),
			settingsCtx.rebuild()
		]);
		await ctx.dispose();
		await webviewCtx.dispose();
		await settingsCtx.dispose();
		
		// Copy Claude Code SDK to dist for runtime access (if exists)
		const fs = require('fs');
		const path = require('path');
		
		// Copy files helper function
		function copyDir(src, dest) {
			fs.mkdirSync(dest, { recursive: true });
			const entries = fs.readdirSync(src, { withFileTypes: true });
			for (let entry of entries) {
				const srcPath = path.join(src, entry.name);
				const destPath = path.join(dest, entry.name);
				entry.isDirectory() ? copyDir(srcPath, destPath) : fs.copyFileSync(srcPath, destPath);
			}
		}
		
		const srcPath = path.join(__dirname, 'node_modules', '@anthropic-ai', 'claude-code');
		const destPath = path.join(__dirname, 'dist', 'node_modules', '@anthropic-ai', 'claude-code');
		
		if (fs.existsSync(srcPath)) {
			// Create directory structure
			fs.mkdirSync(path.dirname(destPath), { recursive: true });
			copyDir(srcPath, destPath);
			console.log('Claude Code SDK copied to dist/');
		} else {
			console.log('Claude Code SDK not found at:', srcPath);
		}
		
		// Copy assets to dist folder
		const assetsSrcPath = path.join(__dirname, 'src', 'assets');
		const assetsDestPath = path.join(__dirname, 'dist', 'src', 'assets');
		
		if (fs.existsSync(assetsSrcPath)) {
			copyDir(assetsSrcPath, assetsDestPath);
			console.log('Assets copied to dist/src/assets/');
		} else {
			console.log('Assets directory not found at:', assetsSrcPath);
		}
		
		console.log('Build complete!');
	}
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
