//@ts-check

"use strict"

const path = require("path")
const webpack = require("webpack")
var WebpackObfuscator = require("webpack-obfuscator")

// 混淆参考
// https://juejin.cn/post/7159431931975696397

//@ts-check
/** @typedef {import('webpack').Configuration} WebpackConfig **/

/** @type WebpackConfig */
let extensionConfig = {
	stats: {
		errorDetails: true,
	},
	target: "node", // vscode extensions run in a Node.js-context 📖 -> https://webpack.js.org/configuration/node/
	mode: "none", // this leaves the source code as close as possible to the original (when packaging we set this to 'production')

	entry: "./src/extension.ts", // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
	output: {
		// the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
		path: path.resolve(__dirname, "dist"),
		filename: "extension.js",
		libraryTarget: "commonjs2",
	},
	externals: {
		vscode: "commonjs vscode", // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
		// modules added here also need to be added in the .vscodeignore file
	},
	resolve: {
		// support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
		extensions: [".ts", ".js"],
	},
	plugins: [
		new webpack.IgnorePlugin({
			resourceRegExp: /(cpu-features|sshcrypto\.node)/u,
		}),
	],
	module: {
		//解决Critical dependency: require function is used in a way in which dependencies cannot be statically extracted的问题
		unknownContextCritical: false,
		//解决the request of a dependency is an expression
		exprContextCritical: false,
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "ts-loader",
					},
				],
			},
		],
	},
	devtool: "nosources-source-map",
	infrastructureLogging: {
		level: "log", // enables logging required for problem matchers
	},
}

// 在生产环境时添加 WebpackObfuscator 插件
if (process.env.NODE_ENV === "production") {
	extensionConfig.plugins &&
		extensionConfig.plugins.push(
			new WebpackObfuscator(
				{
					// 压缩代码
					compact: true,
					// 是否启用控制流扁平化(降低1.5倍的运行速度)
					controlFlowFlattening: true,
					// 应用概率;在较大的代码库中，建议降低此值，因为大量的控制流转换可能会增加代码的大小并降低代码的速度。
					controlFlowFlatteningThreshold: 0.75,
					// 随机的死代码块(增加了混淆代码的大小)
					deadCodeInjection: true,
					// 死代码块的影响概率
					deadCodeInjectionThreshold: 0.4,
					// 此选项几乎不可能使用开发者工具的控制台选项卡
					debugProtection: false,
					// 如果选中，则会在“控制台”选项卡上使用间隔强制调试模式，从而更难使用“开发人员工具”的其他功能。
					debugProtectionInterval: 10,
					// 通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。
					disableConsoleOutput: true,
					// 标识符的混淆方式 hexadecimal(十六进制) mangled(短标识符)
					identifierNamesGenerator: "hexadecimal",
					log: false,
					// 是否启用全局变量和函数名称的混淆
					renameGlobals: false,
					// 通过固定和随机（在代码混淆时生成）的位置移动数组。这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。
					rotateStringArray: true,
					// 混淆后的代码,不能使用代码美化,同时需要配置 cpmpat:true;
					selfDefending: true,
					// 删除字符串文字并将它们放在一个特殊的数组中
					stringArray: true,
					stringArrayEncoding: ["base64"],
					stringArrayThreshold: 0.75,
					transformObjectKeys: true,
					// 允许启用/禁用字符串转换为unicode转义序列。Unicode转义序列大大增加了代码大小，并且可以轻松地将字符串恢复为原始视图。建议仅对小型源代码启用此选项。
					unicodeEscapeSequence: false,
				},
				["node_modules/**/*", "src/lib/**/*"]
			)
		)
}

module.exports = [extensionConfig]
