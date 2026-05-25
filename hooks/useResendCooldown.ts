import { useCallback, useEffect, useState } from 'react'

const DEFAULT_SECONDS = 60

export function useResendCooldown(initialSeconds = DEFAULT_SECONDS) {
  const [secondsLeft, setSecondsLeft] = useState(0)

  const startCooldown = useCallback(
    (seconds = initialSeconds) => {
      setSecondsLeft(seconds)
    },
    [initialSeconds],
  )

  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 1 ? 0 : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [secondsLeft])

  return {
    secondsLeft,
    canResend: secondsLeft === 0,
    startCooldown,
  }
}
