# react-tools
1. Hooks
   * [usePrevious](#useprevious)
2. HOCs
   * [withContext](#withcontext)

## usePrevious
Returns value given on previous render or `undefined` if it's first render.

```
import { usePrevious } from '@rqm/react-tools'

const Component = ({ count }) => {
	const prevCount = usePrevious(count) || 0 // on first render will be 0
	return <>
		<p>{`previous count: ${prevCount}`}</p>
		<p>{`current count: ${count}`}</p>
	</>
}
```

## withContext
Similar to [connect](https://react-redux.js.org/using-react-redux/connect-mapstate) from *Redux*, **`withContext`** used  for performant global state management but in combination with [React Hooks](https://reactjs.org/docs/hooks-intro.html) (`useReducer`/`useState`) and [React Context](https://reactjs.org/docs/context.html):

```
import { withContext } from '@rqm/react-tools'

const WrappedComponent = withContext(
	Context,
	getPropsFromContextValue,
	Component
)
```
* `Context`: React context.
* `getPropsFromContextValue`: Function that accepts context value as first argument and props passed to `WrappedComponent` as second. Should return object with props that goes to `Component`: `(contextValue, externalProps) => innerProps`. You cannot use React Hooks inside of it but everything else is allowed, for example [memoization](#usage-with-memoization) if you're calculating something expensive.
* `Component`: React Function Component, Class Component or something that returns JSX.

### Motivation
The role of this HOC is to **prevent unneccesery renders** when object in Context value changes, but not a property of that object which `Component` needs.

### Usage example

Somewhere in root of React components tree:
```
import React from 'react'

const UserDataContext = React.createContext({
	name: null,
	age: null
})

const userDataReducer = (state, { type, payload }) => {
	switch (type) {
		case 'setName':
			return { ...state, name: payload }
		case 'setAge':
			return { ...state, age: payload }
		default:
			throw new Error(`Bad action type "${type}" with payload=${payload} in userDataReducer.`)
	}
}

const UserDataProvider = ({ children }) => {
	const value = React.useReducer(userDataReducer, { name: null, age: false })
	return <UserDataContext.Provider value={value}>
		{children}
	</UserDataContext.Provider>
}
```
Wrapped component which accepts boolean prop `displayAd` from parent component and `name` from 	`UserDataContext`:
```
import React, { memo } from 'react'

const DisplayUserNameAndMaybeAd = withContext(
	UserDataContext,
	({ name }, props) => ({ ...props, name }),
	({ name, displayAd }) => 
		<div>
			<p>{`Hello, ${name}!`}</p>
			{
				displayAd 
				? <p>Subscribe to get full power!</p>
				: null
			}
		</div>
)
```
Now some other component dispatches action to change user age:
```
dispatch({ type: 'setAge', payload: 20 })
```
And `DisplayUserNameAndMaybeAd` component will not be rerendered, only `withContext` HOC.

### Nesting
You can nest `withContext` in another `withContext` as much times as you want, creating sequential logic pieces for data processing:
```
const Diagram = withContext(IdContext,
	({ id }, props) => ({ ...props, id }),
	withContext(GetDataContext,
		({ expensiveDataCalculation }, { id, ...props }) => 
			({ data: expensiveDataCalculation(id, props.hash), ...props }),
		({ data, ...otherProps }) => {
			return <div>
				{...}
			</div>
		}
	)
)
```

### Usage with memoization
Example from [Nesting](#nesting) have a few flaws, that leads to unneccesery rerenders and/or useless `data` prop recalculation:
1. `withContext` not wrapped by memo, and if parent of `Diagram` will be rerendered but props passed to `Diagram` not changed then render of nested `withContext` with expensive calculation of `data` will eat performance for nothing.
2. If one of `otherProps` not participating in `data` computation will be changed and passed to `Diagram` then there is no need in `expensiveDataCalculation` to execute.

Memoization comes to rescue:
1. Wrapping first `withContext` with `React.memo` will do the trick and nothing will be executed without a reason in case when parent was rerendered.
2. The goal here is to rerender component (because props it consumes still changed) but not to run `expensiveDataCalculation`. It can be achieved only with external memoization wrapper for expensive computations, but still easy enough:
```
import { memoize } from '@rqm/tools'

const GetDataProvider = ({ children }) => {
	const value = {
		expensiveButForAReason = memoize(expensiveDataCalculation)
	}
	return <GetDataContext.Provider value={value}>
		{children}
	</GetDataContext.Provider>
}
```
Thats how code looks with these optimizations:
```
const Diagram = React.memo(withContext(IdContext,
	({ id }, props) => ({ ...props, id }),
	withContext(GetDataContext,
		({ expensiveButForAReason }, { id, ...props }) => 
			({ data: expensiveButForAReason(id, props.hash), ...props }),
		({ data, ...otherProps }) => {
			return <div>
				{...}
			</div>
		}
	)
))
```


### Usage with Typescript

```
import React, { Component, createContext } from 'react'
import withContext from './withContext'

const TestContext = createContext({ testing: true })

type PropsType = { yo: string; testing: boolean }

class ClassComponent extends Component<PropsType> {
	render() {
		return <div>{this.props.testing ? this.props.yo : 'bye'}</div>
	}
}

const ClassTest: React.FC<{ yo: string }> = withContext(
	TestContext,
	({ testing }, props) => ({ ...props, testing }),
	ClassComponent
)

const FuncComponent: React.FC<PropsType> = 
	({ yo, testing }) => <div>{testing ? yo : 'bye'}</div>

// You can type external props (that accepts FuncTest) in two ways:
const FuncTest1 = withContext(TestContext,
	({ testing }, props: { yo: string }) => ({ ...props, testing }),
	FuncComponent
)

const FuncTest2: React.FC<{ yo: string }> = withContext(TestContext,
	({ testing }, props) => ({ ...props, testing }),
	FuncComponent
)

// case without component declaration
const FuncTest3: React.FC<{ yo: string }> = withContext(TestContext,
	({ testing }, props) => ({ ...props, testing }),
	({ testing, yo }) => <div>{testing ? yo : 'bye'}</div>
)
```