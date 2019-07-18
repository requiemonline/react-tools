/* eslint-disable */
import useMergedRefs from '../src/useMergedRefs'
import { forwardRef, useRef } from 'react'

const Example = forwardRef<HTMLDivElement, {}>((props, ref) => {
	const secondRef = useRef<HTMLDivElement>(null)
	const mergedRefs = useMergedRefs(ref, secondRef)
	return <div ref={mergedRefs}>...</div>
})
