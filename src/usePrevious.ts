import { useRef, useEffect } from 'react'

const usePrevious = <T>(value: T): T | undefined => {
	const previous = useRef<T>()
	useEffect(() => {
		previous.current = value
	}, [value])
	return previous.current
}

export default usePrevious
