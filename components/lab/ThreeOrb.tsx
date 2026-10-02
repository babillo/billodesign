"use client";

import { useEffect, useRef } from "react";

/*
 * Lab prototype (docs/orb-rebuild.md): the Spline orb scene rebuilt with plain
 * Three.js from data extracted from the Spline file (camera, transforms,
 * geometry, textures, material layers, events). Not used on the live pages.
 *
 * Material maths follows Spline's compiled shaders: each material is a stack of
 * layers (colour, fresnel, matcap, texture, lighting) mixed with normal /
 * multiply / screen / overlay blends, on top of Three.js' Phong or physical
 * lighting. Colours are raw values and reach the screen without sRGB encoding
 * or tone mapping, like the Spline renderer.
 */

type Vec3 = [number, number, number];
type SceneData = {
  camera: { fov: number; near: number; far: number; position: Vec3; target: Vec3; hoverLimit: number };
  geometry: Record<"mountain" | "eye", { vertices: number; indices: number; normalBytes: number }>;
  matrices: Record<"glassBall" | "eyes" | "eyeL" | "eyeR" | "clearSphere" | "mountain" | "sphere", number[]>;
  glassBall: { radius: number; scrollTo: Vec3; scrollDistance: number };
  sphere: { radius: number };
  lights: {
    pl: { position: Vec3; color: Vec3; intensity: number; distance: number; decay: number; shadow: { mapSize: number; near: number; far: number } };
    pl2: { position: Vec3; color: Vec3; intensity: number; distance: number; decay: number };
  };
  particles: { center: Vec3; radius: number; scale: number; rate: number; life: number; size: number; color1: Vec3; color2: Vec3; gravity: number };
};

export type OrbStats = { firstFrameMs: number; programs: number; drawCalls: number; triangles: number; textures: number };

const BASE = "/lab/orb/";

// Spline layer blend modes (spe_blend).
const BLEND_GLSL = /* glsl */ `
vec3 bNormal(vec3 a, vec3 b, float t) { return mix(a, b, t); }
vec3 bMultiply(vec3 a, vec3 b, float t) { return mix(a, a * b, t); }
vec3 bScreen(vec3 a, vec3 b, float t) { return mix(a, 1.0 - (1.0 - a) * (1.0 - b), t); }
vec3 bOverlay(vec3 a, vec3 b, float t) {
  vec3 o = mix(1.0 - 2.0 * (1.0 - a) * (1.0 - b), 2.0 * a * b, step(a, vec3(0.5)));
  return clamp(mix(a, o, t), 0.0, 1.0);
}
vec2 matcapUv(vec3 viewPos, vec3 n) {
  vec3 v = normalize(viewPos);
  vec3 x = normalize(vec3(v.z, 0.0, -v.x));
  vec3 y = cross(v, x);
  return vec2(dot(x, n), dot(y, n)) * 0.495 + 0.5;
}
`;

// Spline keeps Three.js' legacy point-light falloff (linear to the light's
// distance), much brighter at these ranges than the current physical falloff.
const legacyLights = (fragmentShader: string, chunk: string) =>
  fragmentShader.replace(
    "#include <lights_pars_begin>",
    chunk.replace(
      /float getDistanceAttenuation\([\s\S]*?\n}\n/,
      `float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
  if ( cutoffDistance > 0.0 && decayExponent > 0.0 ) return pow( saturate( - lightDistance / cutoffDistance + 1.0 ), decayExponent );
  return 1.0;
}
`,
    ),
  );

export function ThreeOrb({ shadows = false, freezeAt, onStats }: { shadows?: boolean; freezeAt?: number; onStats?: (s: OrbStats) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    let disposed = false;
    let cleanup = () => {};
    const t0 = performance.now();

    (async () => {
      const THREE = await import("three");
      const [data, mountainBuf, eyeBuf] = await Promise.all([
        fetch(BASE + "scene.json").then((r) => r.json() as Promise<SceneData>),
        fetch(BASE + "mountain.bin").then((r) => r.arrayBuffer()),
        fetch(BASE + "eye.bin").then((r) => r.arrayBuffer()),
      ]);
      const loader = new THREE.TextureLoader();
      const [matcap, rock] = await Promise.all([loader.loadAsync(BASE + "matcap.webp"), loader.loadAsync(BASE + "rock.webp")]);
      if (disposed) return;

      // Spline passes colours through as raw values and converts the output to sRGB.
      THREE.ColorManagement.enabled = false;
      matcap.colorSpace = THREE.NoColorSpace;
      rock.colorSpace = THREE.NoColorSpace;
      rock.wrapS = rock.wrapT = THREE.RepeatWrapping;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
      // Spline's materials write linear values and its final copy pass doesn't
      // encode them, so the raw colour values reach the screen unchanged.
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
      renderer.toneMapping = THREE.NoToneMapping;
      renderer.setClearColor(0x000000, 1);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = shadows;
      renderer.shadowMap.type = THREE.BasicShadowMap;

      const scene = new THREE.Scene();
      const rgb = (c: Vec3) => new THREE.Color(c[0], c[1], c[2]);
      const mat4 = (m: number[]) => new THREE.Matrix4().fromArray(m);

      // ---------- geometry ----------
      const geometry = (buf: ArrayBuffer, l: SceneData["geometry"]["mountain"]) => {
        const g = new THREE.BufferGeometry();
        const pos = new Float32Array(buf, 0, l.vertices * 3);
        const nor = new Int8Array(buf, l.vertices * 12, l.vertices * 3);
        const idx = new Uint16Array(buf, l.vertices * 12 + l.normalBytes, l.indices);
        g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        g.setAttribute("normal", new THREE.BufferAttribute(nor, 3, true));
        g.setIndex(new THREE.BufferAttribute(idx, 1));
        return g;
      };

      // ---------- camera (Spline's camera, aimed at its orbit target) ----------
      const camera = new THREE.PerspectiveCamera(data.camera.fov, 1, data.camera.near, data.camera.far);
      const target = new THREE.Vector3(...data.camera.target);
      camera.position.set(...data.camera.position);
      camera.lookAt(target);

      // ---------- lights ----------
      const pl = new THREE.PointLight(rgb(data.lights.pl.color), data.lights.pl.intensity, data.lights.pl.distance, data.lights.pl.decay);
      pl.position.set(...data.lights.pl.position);
      if (shadows) {
        pl.castShadow = true;
        pl.shadow.mapSize.set(data.lights.pl.shadow.mapSize, data.lights.pl.shadow.mapSize);
        pl.shadow.camera.near = data.lights.pl.shadow.near;
        pl.shadow.camera.far = data.lights.pl.shadow.far;
      }
      const pl2 = new THREE.PointLight(rgb(data.lights.pl2.color), data.lights.pl2.intensity, data.lights.pl2.distance, data.lights.pl2.decay);
      pl2.position.set(...data.lights.pl2.position);
      scene.add(pl, pl2);
      const plBase = pl.position.clone();

      // ---------- mountain: colour #202020 → overlay matcap 50% → multiply rock (triplanar) 75%, physical light 65% ----------
      const mountainMat = new THREE.MeshStandardMaterial({ roughness: 0.77, metalness: 0 });
      mountainMat.onBeforeCompile = (s) => {
        s.fragmentShader = legacyLights(s.fragmentShader, THREE.ShaderChunk.lights_pars_begin);
        s.uniforms.uMatcap = { value: matcap };
        s.uniforms.uRock = { value: rock };
        s.vertexShader = s.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vLocalPos;\nvarying vec3 vLocalNrm;")
          .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLocalPos = position;\nvLocalNrm = normal;");
        s.fragmentShader = s.fragmentShader
          .replace(
            "#include <common>",
            `#include <common>\nuniform sampler2D uMatcap;\nuniform sampler2D uRock;\nvarying vec3 vLocalPos;\nvarying vec3 vLocalNrm;\n${BLEND_GLSL}
vec3 triplanar(vec3 p, vec3 n) {
  vec2 uv0 = p.xy * 2.0 + 0.5, uv1 = p.zy * 2.0 + 0.5, uv2 = p.xz * 2.0 + 0.5;
  vec3 w = pow(abs(normalize(n)), vec3(128.0));
  w /= dot(w, vec3(1.0));
  return texture2D(uRock, uv0).rgb * w.z + texture2D(uRock, uv1).rgb * w.x + texture2D(uRock, uv2).rgb * w.y;
}`,
          )
          .replace(
            "#include <color_fragment>",
            `#include <color_fragment>
{
  vec3 n0 = normalize(vNormal);
  vec3 c = vec3(0.12637);
  c = bOverlay(c, texture2D(uMatcap, matcapUv(vViewPosition, n0)).rgb, 0.5);
  c = bMultiply(c, triplanar(vLocalPos, vLocalNrm), 0.75);
  diffuseColor.rgb = c;
}`,
          )
          .replace("#include <opaque_fragment>", "outgoingLight = mix(diffuseColor.rgb, outgoingLight, 0.65);\n#include <opaque_fragment>");
      };
      const mountain = new THREE.Mesh(geometry(mountainBuf, data.geometry.mountain), mountainMat);
      mountain.matrixAutoUpdate = false;
      mountain.matrix.copy(mat4(data.matrices.mountain));
      mountain.receiveShadow = shadows;
      mountain.castShadow = shadows;
      scene.add(mountain);

      // ---------- cyan sphere: colour + fresnel rim, Phong light screened 28%, translucent; 5 s colour "breathing" ----------
      const sphereUniforms = {
        uColor: { value: new THREE.Color(0.12914, 0.41804, 0.79175) },
        uColorAlpha: { value: 0.5 },
        uAlphaOverride: { value: 0.9 },
      };
      const sphereMat = new THREE.MeshPhongMaterial({ specular: new THREE.Color(0.2, 0.2, 0.2), shininess: 5, transparent: true, depthWrite: false });
      sphereMat.onBeforeCompile = (s) => {
        s.fragmentShader = legacyLights(s.fragmentShader, THREE.ShaderChunk.lights_pars_begin);
        Object.assign(s.uniforms, sphereUniforms);
        s.fragmentShader = s.fragmentShader
          .replace("#include <common>", `#include <common>\nuniform vec3 uColor;\nuniform float uColorAlpha;\nuniform float uAlphaOverride;\n${BLEND_GLSL}`)
          .replace(
            "#include <color_fragment>",
            `#include <color_fragment>
float accum = uColorAlpha;
{
  float f = clamp(1.35 * pow(abs(1.0 + dot(normalize(-vViewPosition), normalize(vNormal))), 0.5), 0.0, 1.0);
  float ca = f / clamp(f + accum, 0.00001, 1.0);
  accum += (1.0 - accum) * f;
  diffuseColor.rgb = bNormal(uColor, vec3(0.27961, 0.89194, 1.0), ca);
}`,
          )
          .replace(
            "#include <opaque_fragment>",
            `{
  float lightAccu = clamp(length(reflectedLight.directSpecular + reflectedLight.indirectSpecular), 0.0, 1.0);
  accum += (1.0 - accum) * 0.28 * lightAccu;
  outgoingLight = bScreen(diffuseColor.rgb, outgoingLight, 0.28);
  diffuseColor.a = accum * uAlphaOverride;
}
#include <opaque_fragment>`,
          );
      };
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(data.sphere.radius, 64, 64), sphereMat);
      sphere.matrixAutoUpdate = false;
      const sphereBase = mat4(data.matrices.sphere);
      // Its "Start" loop also moves it up by 104.3 units (local y -104.3 → 0): the floating.
      const sphereLift = 104.29729;
      scene.add(sphere);

      // ---------- glass ball: overlay(screen(transmission, matcap), #bababa, 27%) ----------
      // Transmission (roughness 1, IOR 5) blurs what's behind the ball, which is
      // the black background, so it is taken as black instead of rendering the
      // scene a second time.
      const glassMat = new THREE.ShaderMaterial({
        uniforms: { uMatcap: { value: matcap } },
        vertexShader: /* glsl */ `
          varying vec3 vViewPos; varying vec3 vN;
          void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vViewPos = -mv.xyz; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D uMatcap; varying vec3 vViewPos; varying vec3 vN;
          ${BLEND_GLSL}
          void main() {
            vec3 c = bScreen(vec3(0.0), texture2D(uMatcap, matcapUv(vViewPos, normalize(vN))).rgb, 1.0);
            c = bOverlay(c, vec3(0.72815), 0.272);
            gl_FragColor = vec4(c, 1.0);
            #include <colorspace_fragment>
          }`,
      });
      const ball = new THREE.Group();
      ball.matrixAutoUpdate = false;
      const ballBase = mat4(data.matrices.glassBall);
      const ballInv = ballBase.clone().invert();
      const local = (m: number[]) => ballInv.clone().multiply(mat4(m));
      const glass = new THREE.Mesh(new THREE.SphereGeometry(data.glassBall.radius, 64, 64), glassMat);
      glass.matrixAutoUpdate = false;
      glass.matrix.copy(local(data.matrices.clearSphere));
      ball.add(glass);

      // ---------- eyes: flat #cefdfd with 20% Phong light; blink ----------
      const eyeMat = new THREE.MeshPhongMaterial({ color: new THREE.Color(0.80592, 0.99204, 0.99204), specular: new THREE.Color(0.2, 0.2, 0.2), shininess: 5 });
      eyeMat.onBeforeCompile = (s) => {
        s.fragmentShader = legacyLights(s.fragmentShader, THREE.ShaderChunk.lights_pars_begin).replace("#include <opaque_fragment>", "outgoingLight = mix(diffuseColor.rgb, outgoingLight, 0.2);\n#include <opaque_fragment>");
      };
      const eyes = new THREE.Group();
      const eyesLocal = local(data.matrices.eyes);
      eyes.matrixAutoUpdate = false;
      eyes.matrix.copy(eyesLocal);
      const eyesInv = mat4(data.matrices.eyes).invert();
      const eyeGeo = geometry(eyeBuf, data.geometry.eye);
      for (const m of [data.matrices.eyeL, data.matrices.eyeR]) {
        const eye = new THREE.Mesh(eyeGeo, eyeMat);
        eye.matrixAutoUpdate = false;
        eye.matrix.copy(eyesInv.clone().multiply(mat4(m)));
        eyes.add(eye);
      }
      ball.add(eyes);
      scene.add(ball);

      // ---------- particles: 10/s, 4 s life, soft dots in a sphere around the cyan orb ----------
      const P = data.particles;
      const count = Math.ceil(P.rate * P.life);
      const pGeo = new THREE.BufferGeometry();
      const seeds = new Float32Array(count * 4);
      for (let i = 0; i < count; i++) {
        const u = Math.random(), v = Math.random(), r = Math.cbrt(Math.random());
        const th = 2 * Math.PI * u, ph = Math.acos(2 * v - 1);
        seeds.set([Math.sin(ph) * Math.cos(th) * r, Math.cos(ph) * r, Math.sin(ph) * Math.sin(th) * r, Math.random()], i * 4);
      }
      pGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
      pGeo.setAttribute("seed", new THREE.BufferAttribute(seeds, 4));
      const pMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uCenter: { value: new THREE.Vector3(...P.center) },
          uRadius: { value: P.radius * P.scale },
          uLife: { value: P.life },
          uSize: { value: P.size * P.scale },
          uScale: { value: 1 },
          uC1: { value: rgb(P.color1) },
          uC2: { value: rgb(P.color2) },
        },
        vertexShader: /* glsl */ `
          attribute vec4 seed; uniform float uTime, uRadius, uLife, uSize, uScale; uniform vec3 uCenter;
          varying float vT; varying float vMix;
          void main() {
            // Each slot is reborn every uLife seconds at a fixed offset, with a new position per cycle.
            float age = mod(uTime + seed.w * uLife, uLife); vT = age / uLife;
            float cycle = floor((uTime + seed.w * uLife) / uLife);
            vec3 dir = normalize(seed.xyz + vec3(sin(cycle * 12.9898 + seed.w * 78.233), cos(cycle * 4.1414), sin(cycle * 7.77)) * 0.6) * length(seed.xyz);
            vec3 p = uCenter + dir * uRadius - vec3(0.0, 0.5 * 0.01 * age * age * 60.0, 0.0);
            vMix = fract(sin(dot(seed.xy + cycle, vec2(12.9898, 78.233))) * 43758.5453);
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            float s = 1.0 - abs(vT * 2.0 - 1.0);
            gl_PointSize = uSize * s * uScale / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uC1, uC2; varying float vT; varying float vMix;
          void main() {
            float d = length(gl_PointCoord - 0.5) * 2.0;
            float a = smoothstep(1.0, 0.0, d) * vT;
            gl_FragColor = vec4(mix(uC1, uC2, vMix), a);
            #include <colorspace_fragment>
          }`,
      });
      const points = new THREE.Points(pGeo, pMat);
      points.frustumCulled = false;
      scene.add(points);

      // ---------- interaction state ----------
      const pointer = new THREE.Vector2();
      let pointerActive = false;
      // Like Spline: pointer in the canvas's own coordinates (it can go past ±1
      // when the cursor is over the page outside the orb area).
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        pointerActive = true;
      };
      const onLeave = () => (pointerActive = false);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);

      const ballPos = new THREE.Vector3(), ballQuat = new THREE.Quaternion(), ballScale = new THREE.Vector3();
      ballBase.decompose(ballPos, ballQuat, ballScale);
      const baseQuat = ballQuat.clone();
      const lookQuat = new THREE.Quaternion();
      const helper = new THREE.Object3D();
      const ray = new THREE.Raycaster();
      const plane = new THREE.Plane();
      const hit = new THREE.Vector3();
      const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

      // ---------- size: like Spline, fill the parent and keep a vertical FOV ----------
      const resize = () => {
        const { clientWidth: w, clientHeight: h } = canvas.parentElement!;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        pMat.uniforms.uScale.value = h * renderer.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      };
      const ro = new ResizeObserver(resize);
      ro.observe(canvas.parentElement!);
      resize();

      const timer = new THREE.Timer();
      let first = true;
      const frame = () => {
        timer.update();
        const dt = Math.min(timer.getDelta(), 0.05);
        // freezeAt: fixed animation time for side-by-side screenshots (lab only).
        const t = freezeAt ?? timer.getElapsed();

        // The scene's orbit "hover rotate" and the ball's scroll animation have no
        // visible effect on the live page (fixed canvas, measured), so neither is
        // reproduced here.

        // Glass ball turns to look at the cursor (Spline LookAt, "distance 1000"):
        // the cursor's sideways offset on a plane 1000 units from the camera,
        // applied to a point 1000 units in front of the ball. Matches the live
        // orb's eye angles (measured at two cursor positions).
        if (pointerActive) {
          ray.setFromCamera(pointer, camera);
          const camDir = camera.getWorldDirection(new THREE.Vector3());
          const axisPoint = camera.position.clone().addScaledVector(camDir, 1000);
          plane.setFromNormalAndCoplanarPoint(camDir.clone().negate(), axisPoint);
          if (ray.ray.intersectPlane(plane, hit)) {
            const toCam = camera.position.clone().sub(ballPos).normalize();
            helper.position.copy(ballPos);
            helper.lookAt(ballPos.clone().addScaledVector(toCam, 1000).add(hit.sub(axisPoint)));
            lookQuat.copy(helper.quaternion);
          }
        } else lookQuat.copy(baseQuat);
        ballQuat.slerp(lookQuat, Math.min(1, dt * 4));
        ball.matrix.compose(ballPos, ballQuat, ballScale);

        // Blink: every 2.6 s the eyes squash to 15% height and back (300 ms each way).
        const c = t % 2.6;
        const blink = c < 2 ? 1 : c < 2.3 ? 1 - ((c - 2) / 0.3) * 0.85 : 0.15 + ((c - 2.3) / 0.3) * 0.85;
        eyes.matrix.copy(eyesLocal).multiply(new THREE.Matrix4().makeScale(1, blink, 1));

        // Cyan sphere: 5 s ping-pong to its second colour state.
        const k = ease(1 - Math.abs(((t / 5) % 2) - 1));
        sphereUniforms.uColor.value.setRGB(0.12914 + (0.12191 - 0.12914) * k, 0.41804 + (0.47997 - 0.41804) * k, 0.79175 + (0.69757 - 0.79175) * k);
        sphereUniforms.uColorAlpha.value = 0.5 + (0.631 - 0.5) * k;
        sphereUniforms.uAlphaOverride.value = 0.9 + (0.85 - 0.9) * k;
        sphere.matrix.copy(sphereBase).setPosition(sphereBase.elements[12], sphereBase.elements[13] + sphereLift * k, sphereBase.elements[14]);

        // Light "pl" follows the cursor on a plane through its home position.
        if (pointerActive) {
          ray.setFromCamera(pointer, camera);
          plane.setFromNormalAndCoplanarPoint(camera.getWorldDirection(new THREE.Vector3()).negate(), plBase);
          if (ray.ray.intersectPlane(plane, hit)) pl.position.lerp(hit, Math.min(1, dt * 5));
        } else pl.position.lerp(plBase, Math.min(1, dt * 5));

        pMat.uniforms.uTime.value = t;
        renderer.render(scene, camera);

        if (first) {
          first = false;
          const info = renderer.info;
          const stats: OrbStats = { firstFrameMs: Math.round(performance.now() - t0), programs: info.programs?.length ?? 0, drawCalls: info.render.calls, triangles: info.render.triangles, textures: info.memory.textures };
          (window as unknown as { __orbStats: OrbStats }).__orbStats = stats;
          onStats?.(stats);
        }
      };
      renderer.setAnimationLoop(frame);

      cleanup = () => {
        renderer.setAnimationLoop(null);
        ro.disconnect();
        window.removeEventListener("pointermove", onMove);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        renderer.dispose();
        scene.traverse((o) => {
          const m = o as import("three").Mesh;
          m.geometry?.dispose();
          (m.material as import("three").Material | undefined)?.dispose?.();
        });
        matcap.dispose();
        rock.dispose();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [shadows, freezeAt, onStats]);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />;
}
