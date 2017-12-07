import chalk from 'chalk';
import * as fs from 'fs';
import { runAsPromise } from './utils/process';

const yargs = require('yargs');

const {
	'release': releaseVersion,
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

async function command(bin: string, args: string[], options: any = {}, executeOnDryRun = false) {
	if (dryRun && !executeOnDryRun) {
		if (options.cwd) {
			console.log(chalk.gray(`(from ${options.cwd}) ${bin} ${args.join(' ')}`));
		}
		else {
			console.log(chalk.gray(`${bin} ${args.join(' ')}`));
		}
		return Promise.resolve('');
	}

	console.log(chalk.green(`${bin} ${args.join(' ')}...`));

	return runAsPromise(bin, args, options);
}

(async function () {
	console.log(chalk.yellow(`Version: ${releaseVersion}`));
	console.log(chalk.yellow(`Next Version: ${nextVersion}`));
	console.log(chalk.yellow(`Dry Run: ${dryRun}`));

	// run the release command
	await command('npm', ['version', releaseVersion], { cwd: 'dist/all' }, false);

	// run the post release command
	const packageJson = JSON.parse(fs.readFileSync('package.json').toString());

	if (nextVersion) {
		packageJson.version = nextVersion;
	}

	if (dryRun) {
		console.log(chalk.gray(`would be setting package.json version to ${nextVersion}...`));
	}
	else {
		fs.writeFileSync('package.json', nextVersion);
	}

	await command('git', ['commit', '-am', `"Update package metadata"`], false);
	await command('git', ['push', 'dojo', 'master'], false);
	await command('git', ['push', 'dojo', '--tags'], false);
})();
