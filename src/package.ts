import * as fs from 'fs';
import * as path from 'path';
import { ContentTransform, copy, glob, parseWithFullExtension } from './utils/file';

const extensionMapByDir: { [key: string]: { [key: string]: string } } = {
	esm: {
		'.js': '.mjs',
		'.js.map': '.mjs.map'
	}
};

const contentTransformsByDir: { [key: string]: { [key: string]: ContentTransform } } = {
	testing: {
		'.js.map': fixSourceMap
	},
	esm: {
		'.mjs': remapMjsSourceMap,
		'.mjs.map': fixSourceMap
	}
};

copyDirectory('testing');

try {
	if (fs.statSync(path.join('dist', 'esm')).isDirectory()) {
		copyDirectory('esm');
	}
} catch (e) { }

// copy package.json
const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
['private', 'scripts', 'files'].forEach(k => delete packageJson[k]);

fs.writeFileSync(path.join('dist', 'release', 'package.json'), JSON.stringify(packageJson, undefined, 4));

function copyDirectory(sourceDir: string) {
	const sourceDirFullPath = path.join('dist', sourceDir, 'src');
	const extensionMap = extensionMapByDir[sourceDir] || {};
	const transformMap = contentTransformsByDir[sourceDir] || {};

	glob(sourceDirFullPath).forEach(file => {
		const sourceFile = path.join(sourceDirFullPath, file);
		const parsed = parseWithFullExtension(file);

		if (extensionMap[parsed.extension]) {
			parsed.extension = extensionMap[parsed.extension];
		}

		const destFile = path.join('dist', 'release', parsed.path, parsed.file + parsed.extension);

		copy(sourceFile, destFile, transformMap[parsed.extension]);
	});
}

function remapMjsSourceMap(contents: string): string {
	return contents.replace(/(\/\/.*sourceMappingURL=.*?)(\.js\.map)/g, '$1.mjs.map');
}

function fixSourceMap(contents: string, destFile: string): string {
	const json = JSON.parse(contents);

	if (json.sources) {
		// Rewrite source array so the debugger thinks our source files are
		// siblings of the JS file
		json.sources = json.sources.map((source: string) => path.basename(source));
	}

	if (json.file && destFile.match(/\.mjs\.map$/)) {
		json.file = json.file.replace(/\.js$/g, '.mjs');
	}

	return JSON.stringify(json);
}
