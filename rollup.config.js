import typescript from 'rollup-plugin-typescript2'
import pkg from './package.json'
import clear from 'rollup-plugin-clear'

const firstPlugins = [
	clear({
		targets: ['dist'],
		watch: true,
	}),
]

const plugins = [
	typescript({
		module: 'ESNext',
		tsconfigOverride: { compilerOptions: { declaration: true } },
	}),
]

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

export default {
	input: `src/index.ts`,
	output: [{ file: pkg.module, format: 'esm' }, { file: pkg.main, format: 'cjs' }],
	plugins: [...firstPlugins, ...plugins],
	external,
}
