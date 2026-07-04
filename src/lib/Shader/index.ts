export const Shader = {
    vertexShader: `
        uniform float uTime;
        uniform float uBloom;
        varying vec2 vUv;
        varying float vIntensity;
        
        float sinNoise(vec3 p) {
            return sin(p.x * 2.0 + uTime) * cos(p.y * 2.0 + uTime) * sin(p.z * 2.0 + uTime);
        }
        
        void main() {
            vUv = uv;
            vec3 basePosition = (instanceMatrix * vec4(position, 1.0)).xyz;
            vec3 closedState = normalize(basePosition) * 0.4;
            
            vec3 bloomState = basePosition;
            float noise = sinNoise(basePosition * 1.5) * 0.25;
            bloomState.z += sin(length(basePosition.xy) * 4.0 - uTime * 2.0) * 0.3 + noise;
            vec3 mixedPosition = mix(closedState, bloomState, uBloom);
            vIntensity = smoothstep(-1.0, 1.0, mixedPosition.z);
            vec4 modelViewPosition = modelViewMatrix * vec4(mixedPosition, 1.0);
            
            gl_Position = projectionMatrix * modelViewPosition;
        }
    `,
    fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying float vIntensity;
        
        void main() {
            vec2 center = vUv - 0.5;
            float dist = length(center);
            
            float radius = 0.15 + (vIntensity * 0.2);
            float alpha = smoothstep(radius, radius - 0.02, dist);
      
            if (alpha < 0.1) discard;
            vec3 color = mix(vec3(0.596, 0.502, 0.961), vec3(1.0, 1.0, 1.0), vIntensity);
      
            gl_FragColor = vec4(color, alpha);
        }
    `
};