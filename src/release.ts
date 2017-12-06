import * as fs from 'fs';
import { runAsPromise } from './utils/process';

const yargs = require('yargs');

const {
	'version': releaseVersion,
	'next': nextVersion,
	'dry-run': dryRun
} = yargs
	.option('release', {
		type: 'string'
	})
	.option('next', {
		type: 'string'
	})
	.option('dry-run', {
		type: 'boolean',
		default: false
	})
	.argv;

async function command(bin: string, args: string[], executeOnDryRun = false) {
	if (dryRun && !executeOnDryRun) {
		console.log(`would be executing but it's a dry run, ${bin} ${args.join(' ')}`);
		return Promise.resolve('');
	}

	return runAsPromise(bin, args);
}

(async function () {
	// run the release command
	console.log(`Releasing ${releaseVersion}`);
	await command('npm', ['version', releaseVersion], false);

	// run the post release command
	const packageJson = JSON.parse(fs.readFileSync('package.json').toString());

	if (nextVersion) {
		packageJson.version = nextVersion;
	}

	if (dryRun) {
		console.log(`Would be setting package.json version to ${nextVersion}`);
	}
	else {
		fs.writeFileSync('package.json', nextVersion);
	}

	await command('git', ['commit', '-am', `"Update package metadata"`], false);
	await command('git', ['push', 'dojo', 'master'], false);
	await command('git', ['push', 'dojo', '--tags'], false);
})();
