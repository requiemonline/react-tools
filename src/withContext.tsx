import React, { useContext, FC, ComponentClass, Context } from 'react'

type withContextT = <
	P extends {},
	EP extends {}, 
	V
>(
	context: Context<V>,
	getProps: (value: V, props: EP) => P,
	WrappedComponent: FC<P> | ComponentClass<P>,
) => FC<EP>

const withContext: withContextT = (context, getProps, WrappedComponent) => props => {
	const contextValue = useContext(context)

	if (process.env.NODE_ENV === 'development') {
		if (contextValue === undefined) { throw new Error(`withContext must be used within a proper ContextProvider`) }
	}

	const newProps = getProps(contextValue, props)

	return <WrappedComponent {...newProps} />
}

export default withContext