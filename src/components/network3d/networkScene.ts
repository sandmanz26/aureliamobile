import * as THREE from 'three'
import { Line2 } from 'three/examples/jsm/lines/Line2.js'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import headUrl from './head.png'
import headDepthUrl from './head-depth.png'
import { ART, EDGES, NODES } from './networkData'
import type { End, NetNode } from './networkData'

/**
 * The Home closing-CTA artwork (`aurelia-network.png`) rebuilt as a real
 * Three.js scene (U035) so it can move.
 *
 * Fidelity first: at rest, seen from the front, it is meant to be the PNG.
 * - Every node position, radius and edge softness, every line, its dashing
 *   and its opacity, was measured from the PNG (networkData.ts).
 * - Colours are the PNG's own sRGB values and nothing converts them: colour
 *   management is off for this chunk and output is written untouched.
 * - The figure *is* the PNG's pixels — cut out (head.png) and wrapped over a
 *   relief inflated from its silhouette (head-depth.png) — so its gradient
 *   cannot drift from the artwork's.
 * - Things sit at different depths (bokeh nodes near the camera, faint dots
 *   far behind, the figure in between) but are scaled so that from the rest
 *   pose each projects exactly where the PNG has it. Depth only shows once
 *   the camera moves — which is the point of rebuilding it.
 */

THREE.ColorManagement.enabled = false

/** World units are the artwork's pixels; this is the camera's distance for a
 *  30° vertical field of view to frame its 155px height exactly. */
const FOV = 30
const D = ART.height / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2))

const HEAD = { x0: 114, y0: 30, w: 142, h: 125, z: -8, relief: 26 }

/** Depth per node kind (positive = toward the camera). Dots go further back
 *  the paler they are, which is how the artwork reads them. */
function depthOf(node: NetNode) {
  if (node.kind === 'hub') return 0
  if (node.kind === 'bokeh') return 46
  const g = parseInt(node.color.slice(3, 5), 16)
  return -18 - ((g - 197) / 28) * 52
}

/** Artwork pixel (x down-right, y down) at depth z → world position that
 *  projects back onto that same pixel from the rest pose. */
function place(x: number, y: number, z: number) {
  const k = (D - z) / D
  return new THREE.Vector3((x - ART.width / 2) * k, (ART.height / 2 - y) * k, z)
}

const nodeVertex = /* glsl */ `
  varying vec2 vP;
  uniform float uHalf;
  void main() {
    vP = (uv * 2.0 - 1.0) * uHalf;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/* Hubs: the colour is a quadratic fit to the five hub discs in the PNG
   (sRGB, mean error under 5/255), then a soft edge and the halo ring.
   Bokeh and dots: flat colour, soft edge. Output is premultiplied. */
const nodeFragment = /* glsl */ `
  varying vec2 vP;
  uniform vec3 uColor;
  uniform float uR;
  uniform float uSoft;
  uniform float uHub;
  uniform float uRingR;
  uniform float uRingA;
  uniform float uOpacity;
  void main() {
    float d = length(vP);
    float disc = 1.0 - smoothstep(uR - uSoft * 0.5, uR + uSoft * 0.5, d);
    vec3 col = uColor;
    if (uHub > 0.5) {
      // Measured from the five hub discs (median per pixel): a warm base
      // that cools left→right, a cream highlight just off centre, a coral
      // bruise low on the right and a slight dip left of centre.
      vec2 q = vec2(vP.x, -vP.y); // artwork px, y down, centre = 0
      float g = 170.0 - 1.8 * q.x;
      float bl = 114.0;
      float hi = exp(-dot(q - vec2(0.6, 0.6), q - vec2(0.6, 0.6)) / 2.4);
      float coral = exp(-dot(q - vec2(3.2, 2.3), q - vec2(3.2, 2.3)) / 5.0);
      float dip = exp(-dot(q - vec2(-1.6, 0.6), q - vec2(-1.6, 0.6)) / 2.0);
      g += 9.0 * hi - 27.0 * coral - 8.0 * dip;
      bl += 12.0 * hi - 8.0 * coral - 9.0 * dip;
      col = vec3(253.0 - 2.0 * coral, g, bl) / 255.0;
      float ring = exp(-pow((d - uRingR) / 0.5, 2.0)) * uRingA;
      vec3 ringCol = vec3(253.0, 197.0, 158.0) / 255.0;
      float a = disc + ring * (1.0 - disc);
      vec3 c = (col * disc + ringCol * ring * (1.0 - disc)) / max(a, 1e-4);
      gl_FragColor = vec4(c * a * uOpacity, a * uOpacity);
      return;
    }
    gl_FragColor = vec4(col * disc * uOpacity, disc * uOpacity);
  }
`

const headVertex = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uRelief;
  uniform float uD;
  uniform float uZ;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float h = texture2D(uDepth, uv).r;
    vec3 p = position;
    p.z = h * uRelief;
    // Pull each vertex in by its own depth so the rest pose matches the
    // flat artwork pixel for pixel, relief and all.
    p.xy *= (uD - (uZ + p.z)) / uD;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const headFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform float uOpacity;
  varying vec2 vUv;
  void main() {
    vec4 t = texture2D(uMap, vUv); // premultiplied on upload
    gl_FragColor = t * uOpacity;
  }
`

export interface NetworkSceneOptions {
  motion: boolean
}

export interface NetworkScene {
  setMotion: (on: boolean) => void
  setVisible: (on: boolean) => void
  dispose: () => void
}

export function createNetworkScene(host: HTMLElement, options: NetworkSceneOptions): NetworkScene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true })
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace
  renderer.setClearColor(0x000000, 0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  const canvas = renderer.domElement
  canvas.style.display = 'block'
  canvas.style.width = '100%'
  canvas.style.height = '100%'
  host.appendChild(canvas)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(FOV, ART.width / ART.height, 1, 2000)
  camera.position.set(0, 0, D)
  camera.lookAt(0, 0, 0)

  const disposables: { dispose: () => void }[] = []
  const lineMaterials: LineMaterial[] = []

  // ── Lines (painted first, like the artwork) ───────────────────────────
  // A free end sits at the depth of the node it leaves; an end on the
  // figure's outline sits at the figure's depth.
  const endPoint = (end: End, other: End, onHead: boolean) => {
    if (typeof end === 'number') {
      const n = NODES[end]
      return place(n.x, n.y, depthOf(n))
    }
    const z = onHead ? HEAD.z : typeof other === 'number' ? depthOf(NODES[other]) : 0
    return place(end[0], end[1], z)
  }
  EDGES.forEach((edge, i) => {
    const a = endPoint(edge.a, edge.b, !!edge.head)
    const b = endPoint(edge.b, edge.a, !!edge.head)
    const geometry = new LineGeometry()
    geometry.setPositions([a.x, a.y, a.z, b.x, b.y, b.z])
    const material = new LineMaterial({
      color: edge.dashed ? 0xfeb377 : 0xffcba8,
      linewidth: edge.dashed ? 0.9 : 0.8,
      worldUnits: true,
      transparent: true,
      opacity: Math.min(1, edge.dashed ? edge.opacity : edge.opacity / 0.9),
      dashed: edge.dashed,
      dashSize: 1.9,
      gapSize: 1.7,
      depthTest: false,
      depthWrite: false,
    })
    const line = new Line2(geometry, material)
    line.computeLineDistances()
    line.renderOrder = 0
    line.userData.index = i
    scene.add(line)
    lineMaterials.push(material)
    disposables.push(geometry, material)
  })

  // ── The figure ────────────────────────────────────────────────────────
  const loader = new THREE.TextureLoader()
  const headMap = loader.load(headUrl, () => render())
  headMap.colorSpace = THREE.NoColorSpace
  headMap.premultiplyAlpha = true
  const headDepth = loader.load(headDepthUrl, () => render())
  headDepth.colorSpace = THREE.NoColorSpace
  const headMaterial = new THREE.ShaderMaterial({
    vertexShader: headVertex,
    fragmentShader: headFragment,
    uniforms: {
      uMap: { value: headMap },
      uDepth: { value: headDepth },
      uRelief: { value: HEAD.relief },
      uD: { value: D },
      uZ: { value: HEAD.z },
      uOpacity: { value: 1 },
    },
    transparent: true,
    premultipliedAlpha: true,
    depthTest: false,
    depthWrite: false,
  })
  const headGeometry = new THREE.PlaneGeometry(HEAD.w, HEAD.h, HEAD.w, HEAD.h)
  const head = new THREE.Mesh(headGeometry, headMaterial)
  const headCentre = place(HEAD.x0 + HEAD.w / 2, HEAD.y0 + HEAD.h / 2, 0)
  head.position.set(headCentre.x, headCentre.y, HEAD.z)
  head.renderOrder = 1
  scene.add(head)
  disposables.push(headMap, headDepth, headMaterial, headGeometry)

  // ── Nodes (billboards, painted last) ──────────────────────────────────
  const quad = new THREE.PlaneGeometry(1, 1)
  disposables.push(quad)
  const nodes = NODES.map((node, i) => {
    const z = depthOf(node)
    const hub = node.kind === 'hub'
    const half = hub ? 10.5 : node.r + node.soft + 1
    const material = new THREE.ShaderMaterial({
      vertexShader: nodeVertex,
      fragmentShader: nodeFragment,
      uniforms: {
        uHalf: { value: half },
        uColor: { value: new THREE.Color(node.color) },
        uR: { value: hub ? 6.6 : node.r },
        uSoft: { value: hub ? 1.1 : node.soft },
        uHub: { value: hub ? 1 : 0 },
        uRingR: { value: 8.6 },
        uRingA: { value: 0.27 },
        uOpacity: { value: 1 },
      },
      transparent: true,
      premultipliedAlpha: true,
      depthTest: false,
      depthWrite: false,
    })
    const mesh = new THREE.Mesh(quad, material)
    const k = (D - z) / D
    mesh.position.copy(place(node.x, node.y, z))
    mesh.scale.setScalar(half * 2 * k)
    mesh.renderOrder = hub ? 3 : 2
    mesh.userData = { base: mesh.position.clone(), i }
    scene.add(mesh)
    disposables.push(material)
    return mesh
  })

  // ── Sizing ────────────────────────────────────────────────────────────
  const size = new THREE.Vector2()
  const resize = () => {
    const w = host.clientWidth || 1
    const h = host.clientHeight || 1
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    // Keep the artwork's full width in frame if the box is narrower.
    const fitWidth = ART.width / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2)) / camera.aspect
    camera.position.setLength(Math.max(D, fitWidth))
    camera.updateProjectionMatrix()
    renderer.getDrawingBufferSize(size)
    for (const m of lineMaterials) m.resolution.set(size.x, size.y)
    render()
  }

  // ── Motion ────────────────────────────────────────────────────────────
  let motion = options.motion
  let visible = true
  let frame = 0
  const pointer = new THREE.Vector2()
  const eased = new THREE.Vector2()
  const clock = new THREE.Clock()
  const onPointer = (e: PointerEvent) => {
    const r = host.getBoundingClientRect()
    pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, ((e.clientY - r.top) / r.height) * 2 - 1)
  }
  window.addEventListener('pointermove', onPointer, { passive: true })

  function pose(t: number) {
    // A slow orbit with the pointer leaning on it; dashes flow toward the
    // figure; halos breathe; the near bokeh drifts. All small — the artwork
    // should still be recognisably itself at every frame.
    eased.lerp(pointer, 0.05)
    const yaw = Math.sin(t * 0.23) * 0.09 + eased.x * 0.07
    const pitch = Math.sin(t * 0.17) * 0.04 - eased.y * 0.04
    const dist = camera.position.length()
    camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist)
    camera.lookAt(0, 0, 0)
    for (const m of lineMaterials) if (m.dashed) m.dashOffset = -t * 2.4
    for (const mesh of nodes) {
      const { base, i } = mesh.userData as { base: THREE.Vector3; i: number }
      const node = NODES[i]
      const u = (mesh.material as THREE.ShaderMaterial).uniforms
      if (node.kind === 'hub') {
        u.uRingR.value = 8.6 + Math.sin(t * 1.3 + i * 1.7) * 0.7
        u.uRingA.value = 0.27 * (0.75 + 0.25 * Math.sin(t * 1.3 + i * 1.7 + 1))
      } else if (node.kind === 'bokeh') {
        mesh.position.set(base.x + Math.sin(t * 0.5 + i) * 1.6, base.y + Math.cos(t * 0.4 + i * 2) * 1.2, base.z)
      }
    }
  }

  function rest() {
    camera.position.set(0, 0, camera.position.length())
    camera.lookAt(0, 0, 0)
    for (const m of lineMaterials) m.dashOffset = 0
    for (const mesh of nodes) {
      const { base, i } = mesh.userData as { base: THREE.Vector3; i: number }
      mesh.position.copy(base)
      const u = (mesh.material as THREE.ShaderMaterial).uniforms
      if (NODES[i].kind === 'hub') {
        u.uRingR.value = 8.6
        u.uRingA.value = 0.27
      }
    }
  }

  function render() {
    for (const mesh of nodes) mesh.quaternion.copy(camera.quaternion)
    renderer.render(scene, camera)
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
  function loop() {
    frame = 0
    if (!motion || !visible || reduced.matches) return
    pose(clock.getElapsedTime())
    render()
    frame = requestAnimationFrame(loop)
  }
  function restart() {
    cancelAnimationFrame(frame)
    frame = 0
    if (motion && visible && !reduced.matches) frame = requestAnimationFrame(loop)
    else {
      rest()
      render()
    }
  }

  const observer = new ResizeObserver(resize)
  observer.observe(host)
  resize()
  restart()
  reduced.addEventListener('change', restart)

  return {
    setMotion(on) {
      motion = on
      restart()
    },
    setVisible(on) {
      visible = on
      restart()
    },
    dispose() {
      cancelAnimationFrame(frame)
      observer.disconnect()
      reduced.removeEventListener('change', restart)
      window.removeEventListener('pointermove', onPointer)
      for (const d of disposables) d.dispose()
      renderer.dispose()
      canvas.remove()
    },
  }
}
