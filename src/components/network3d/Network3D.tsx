import { useEffect, useRef, useState } from 'react'
import type { NetworkScene } from './networkScene'

/**
 * The Home network artwork as a live Three.js scene (U035). Off by default —
 * /__demo's "3D network" card turns it on. Three.js is loaded only when this
 * mounts, so nobody downloads it while the flag is off.
 *
 * Until the scene has drawn (and if WebGL is unavailable) the original PNG
 * stays in place, so the box never jumps and the page never shows a hole.
 */
export function Network3D({ fallback, motion }: { fallback: string; motion: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const scene = useRef<NetworkScene | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    void import('./networkScene')
      .then(({ createNetworkScene }) => {
        if (cancelled || !host.current) return
        scene.current = createNetworkScene(host.current, { motion })
        setReady(true)
      })
      .catch(() => {
        /* no WebGL: the PNG stays */
      })
    return () => {
      cancelled = true
      scene.current?.dispose()
      scene.current = null
    }
    // The scene is built once; motion changes go through setMotion below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    scene.current?.setMotion(motion)
  }, [motion, ready])

  // Only animate while on screen.
  useEffect(() => {
    if (!ready || !host.current) return
    const io = new IntersectionObserver(([entry]) => scene.current?.setVisible(entry.isIntersecting))
    io.observe(host.current)
    return () => io.disconnect()
  }, [ready])

  return (
    <div className="relative w-full" style={{ aspectRatio: '362 / 155' }} data-network-3d="">
      {!ready && <img src={fallback} alt="" className="absolute inset-0 size-full" />}
      <div ref={host} className="absolute inset-0" aria-hidden="true" />
    </div>
  )
}
