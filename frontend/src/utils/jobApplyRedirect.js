export function startJobApplyRedirect(redirect, onTick, delaySeconds = 10) {
  let secondsRemaining = delaySeconds
  onTick(secondsRemaining)

  const intervalId = globalThis.setInterval(() => {
    secondsRemaining -= 1
    onTick(secondsRemaining)
    if (secondsRemaining <= 0) {
      globalThis.clearInterval(intervalId)
      redirect()
    }
  }, 1000)

  return () => globalThis.clearInterval(intervalId)
}
