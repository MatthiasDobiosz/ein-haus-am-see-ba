import { DependencyList, EffectCallback, useEffect, useRef } from "react";

// custom hook to run use effect but not on initial render
// Taken from: https://stackoverflow.com/questions/53253940/make-react-useeffect-hook-not-run-on-initial-render
export const useDidMountEffect = (
  func: EffectCallback,
  deps: DependencyList
) => {
  const didMount = useRef(false);

  useEffect(() => {
    if (didMount.current) func();
    else didMount.current = true;
  }, deps);
};
