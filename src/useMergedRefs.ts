import { useCallback, Ref, MutableRefObject } from 'react'

const useMergedRefs = <T>(ref1: Ref<T>, ref2: Ref<T>) =>
	useCallback(
		(instance: T) =>
			[ref1, ref2].forEach(ref => {
				if (ref) {
					typeof ref === 'function' ? ref(instance) : ((ref as MutableRefObject<T>).current = instance)
				}
			}),
		[ref1, ref2],
	)

export default useMergedRefs

// Combines two refs into one
// Fork of implementations by eps1lon and voliva
// straight from this issue: https://github.com/facebook/react/issues/13029
