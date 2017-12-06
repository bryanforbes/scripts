# dojo-scripts


[![Build Status](https://travis-ci.org/dojo/scripts.svg?branch=master)](https://travis-ci.org/dojo/scripts )
[![npm version](https://badge.fury.io/js/dojo-scripts.svg)](http://badge.fury.io/js/dojo-scripts)

A package of scripts to aid with Dojo 2 package development.

## Features

### Packaging

The provided `package.js` script will take all of the directories in the `dist` directory and merge the `src` subdirecotires together into a combined `dist/all` folder. A modified `package.json` will also be copied into `dist/all/package.json`.

Once in this format, you can easily create a `.tar.gz` of your package with `npm pack dist/all`.

### Releasing

Several scripts are provided to ease the release process.

#### Can Publish Checks

To check if the user is allowed to publish, run the `can-publish-check.js` script. The script will fail with a `1` exit code if the user cannot publish.

#### Clean Repo Checks

A safe release is a clean release. To check if there are no uncommitted changes, and the user is `master`, run the `repo-is-clean-check.js` script. The script will fail with a `1` exit code if the repo is dirty.

#### Release

The `release.js` script can release a dojo package. The `dist/all` directory is what gets released. The script takes a number of arguments:

| Parameter  | Description                              |
| ---------- | ---------------------------------------- |
| `—version` | The version to release                   |
| `—next`    | The next version (`package.json` version gets set to this) |
| `—dry-run` | Shows the commands that will be run but does not run the commands. |

## How do I use this package?

Add this package as a dependency and reference the provided scripts from npm scripts.

For example,

```json
{
    "scripts": {
    "prepublish": "node node_modules/@dojo/scripts/install-peer-deps.js",
    "lint": "tslint \"src/**/*.ts\" \"tests/**/*.ts\"",
    "test": "npm run build:umd && intern",
    "test:local": "intern config=intern.json@local",
    "test:browserstack": "intern config=intern.json@browserstack",
    "test:saucelabs": "intern config=intern.json@saucelabs",
    "build:static": "copyfiles \"tests/**/*.html\" \"src/**/*.d.ts\"",
    "build:umd": "tsc -p . && npm run build:static -- dist/umd",
    "build:esm": "tsc -p ./node_modules/@dojo/scripts/tsconfig.esm.json && npm run build:static -- dist/esm",
    "clean": "rimraf dist",
    "dist": "npm run lint && npm run clean && npm run build:umd && npm run build:esm && npm run package",
    "package": "node node_modules/@dojo/scripts/package.js",
    "release": "node node_modules/@dojo/scripts/can-publish-check.js && node node_modules/@dojo/scripts/repo-is-clean-check.js && npm run dist && npm run package && node node_modules/@dojo/scripts/release.js"
  },
}
```

## How do I contribute?

We appreciate your interest!  Please see the [Dojo 2 Meta Repository](https://github.com/dojo/meta#readme) for the
Contributing Guidelines and Style Guide.

## Licensing information

© 2017 [JS Foundation](https://js.foundation/). [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.
