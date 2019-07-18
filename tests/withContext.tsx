/* eslint-disable */
import { Component, createContext, FC } from 'react'
import withContext from '../src/withContext'

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
	ClassComponent,
)

const FuncComponent: React.FC<PropsType> = ({ yo, testing }) => <div>{testing ? yo : 'bye'}</div>

// You can type external props (that accepts FuncTest) in two ways:
const FuncTest1 = withContext(
	TestContext,
	({ testing }, props: { yo: string }) => ({ ...props, testing }),
	FuncComponent,
)

const FuncTest2: React.FC<{ yo: string }> = withContext(
	TestContext,
	({ testing }, props) => ({ ...props, testing }),
	FuncComponent,
)

// case without component declaration
const FuncTest3: React.FC<{ yo: string }> = withContext(
	TestContext,
	({ testing }, props) => ({ ...props, testing }),
	({ testing, yo }) => <div>{testing ? yo : 'bye'}</div>,
)
