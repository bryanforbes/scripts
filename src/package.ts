import * as fs from 'fs';
import * as path from 'path';
import { ContentTransform, copy, glob, parseWithFullExtension } from './utils/file';

const target = 'all';

// find all the directories in dist
const sources = fs.readdirSync('dist')
	.filter(file => file.indexOf('all') < 0)
	.filter(file => fs.statSync(path.join('dist', file)).isDirectory());

const extensionMapByDir: { [key: string]: { [key: string]: string } } = {
	esm: {
		'.js': '.mjs',
		'.js.map': '.mjs.map'
	}
};

const contentTransformsByDir: { [key: string]: { [key: string]: ContentTransform } } = {
	esm: {
		'.mjs': remapMjsSourceMap,
		'.mjs.map': fixMjsSourceMap
	}
};

const destDirFullPath = path.join('dist', target);

sources.forEach(sourceDir => {
	const sourceDirFullPath = path.join('dist', sourceDir, 'src');
	const extensionMap = extensionMapByDir[sourceDir] || {};
	const transformMap = contentTransformsByDir[sourceDir] || {};

	glob(sourceDirFullPath).forEach(file => {
		const sourceFile = path.join(sourceDirFullPath, file);
		const parsed = parseWithFullExtension(file);

		if (extensionMap[parsed.extension]) {
			parsed.extension = extensionMap[parsed.extension];
		}

		const destFile = path.join(destDirFullPath, parsed.path, parsed.file + parsed.extension);

		copy(sourceFile, destFile, transformMap[parsed.extension]);
	});
});

// copy package.json
const packageJson = JSON.parse(fs.readFileSync('package.json').toString());
['private', 'scripts', 'files'].forEach(k => delete packageJson[k]);

fs.writeFileSync(path.join(destDirFullPath, 'package.json'), JSON.stringify(packageJson, undefined, 4));


function remapMjsSourceMap(contents: string): string {
	return contents.replace(/(\/\/.*sourceMappingURL=.*?)(\.js\.map)/g, '$1.mjs.map');
}

function fixMjsSourceMap(contents: string): string {
	const json = JSON.parse(contents);

	if (json.file) {
		json.file = json.file.replace(/\.js$/g, '.mjs');
	}

	return JSON.stringify(json);
}
