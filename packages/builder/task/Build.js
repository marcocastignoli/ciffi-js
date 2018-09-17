let chalk = require('chalk');
let fileExists = require('file-exists');
let exec = require('child_process').exec;
let Log = require('single-line-log').stdout;
let ConfigFile = process.env.PWD + '/.ciffisettings';

let Build = (function (env) {
	
	let _CONFIG;
	
	function Build() {
		this.build = build
		if (fileExists.sync(ConfigFile)) {
			_CONFIG = require(ConfigFile);
		} else {
			console.log(chalk.red.bold('☠️  Project build failed:') + ' ' + chalk.blue('can\'t find .ciffisettings file ☠️'));
			return console.log('');
		}
		
		if (fileExists.sync(process.env.PWD + '/src/scripts/config/env/' + env + '.js')) {
			this.build();
		} else {
			console.log(chalk.red.bold('☠️  Project build failed:') + ' ' + chalk.blue('can\'t find src/scripts/config/env/' + env + '.js file ☠️'));
			return console.log('');
		}

		this.getStatus = getStatus
		
	}

	function getStatus() {
		self = this
		return new Promise(function(resolve, reject){
			self._process.on('close', function(){
				self._asset_process.on('close', function(){
					resolve('Fatto')
				})
			})
		})
	}
	
	function build() {
		let _assetPath = _CONFIG.assetsPath;
		let _assetPathName = _CONFIG.assetsPathName;
		let _autoprefixerConfig = _CONFIG.autoprefixer || 'last 12 versions';
		let _concat = ' && ';
		let _createConfig = 'cp ' + _assetPathName + '/scripts/config/env/' + env + '.js ' + _assetPathName + '/scripts/config/config.js';
		let _cleanDist = 'rm -rf ' + _assetPath + '/*';
		let _css = './node_modules/.bin/node-sass ' + _assetPathName + '/styles/main.scss ' + _assetPath + '/' + _CONFIG.stylesOutputName;
		let _autoprefixer = './node_modules/.bin/postcss --use autoprefixer --autoprefixer.browsers \'' + _autoprefixerConfig + '\' -o ' + _assetPath + '/' + _CONFIG.stylesOutputName + ' ' + _assetPath + '/' + _CONFIG.stylesOutputName;
		let _cleancss = './node_modules/.bin/cleancss -o ' + _assetPath + '/' + _CONFIG.stylesOutputName + ' ' + _assetPath + '/' + _CONFIG.stylesOutputName;
		let _styles = _css + _concat + _autoprefixer + _concat + _cleancss;
		let _js = './node_modules/.bin/webpack --config build.config.js --progress';
		
		exec(_createConfig);
		
		console.log('');
		console.log(chalk.blue('🦄 Generate config for ') + env + ' ' + chalk.green.bold(' OK'));
		console.log('');
		console.log('');
		
		this._process = exec(_cleanDist + _concat + _styles + _concat + _js);
		
		this._process.stdout.on('data', function (res) {
			if (res.indexOf('ERROR in') >= 0 || res.indexOf('Error:') >= 0) {
				console.log(chalk.red(res));
			} else {
				Log('🏗  ' + chalk.blue(res));
			}
		});
		
		this._process.stderr.on('data', function (res) {
			if (res.indexOf('ERROR in') >= 0 || res.indexOf('Error:') >= 0) {
				console.log(chalk.red(res));
			} else {
				Log('🏗  ' + chalk.blue(res));
			}
		});
		
		self = this
		this._process.on('close', function (res) {
			if (res === 0) {
				Log(chalk.blue('🏗  Project build for ') + env + chalk.blue(' in ') + _assetPath + ' ' + chalk.green.bold(' OK'));
				let assetsInstance = require('./app-assets');
				self._asset_process = assetsInstance.getStatus()
			}
			console.log('');
		});
	}
	
	return new Build();
});

module.exports = Build;
