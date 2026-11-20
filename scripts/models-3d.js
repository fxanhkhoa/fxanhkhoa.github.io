/* ==========================================================================
   Portfolio 3D Studio Catalog (Single Source of Truth)
   --------------------------------------------------------------------------
   To add a new 3D object to every portfolio page and the 3D Studio page:
   1. Export your Blender asset to `blender/<your-object>.glb`
   2. Append a new entry to `window.PORTFOLIO_3D_MODELS` below:
      {
        id: 'cyber-desk',
        title: 'Cyber Desk Setup',
        category: 'Props & Interior',
        src: 'blender/cyber-desk.glb',
        alt: '3D Cyber Desk modeled in Blender',
        summary: 'Short description of the 3D object, materials, and modeling focus.',
        highlights: [
          'Key modeling or topology highlight',
          'Material / PBR shading highlight',
          'Exported from .blend to web-ready .glb'
        ],
        tags: ['Blender', 'PBR', 'glTF / GLB'],
        cameraOrbit: '45deg 65deg auto'
      }
   ========================================================================== */

window.PORTFOLIO_3D_MODELS = [
  {
    id: 'house-study',
    title: '3D House Study',
    category: 'Architecture',
    src: 'blender/house.glb',
    alt: '3D House modeled in Blender',
    summary:
      'An interactive 3D house model built in Blender as part of my 3D modeling learning journey, exported to glTF Binary (.glb) for real-time web rendering.',
    highlights: [
      'Modeled architectural structure & proportions in Blender',
      'Applied materials and lighting for real-time PBR rendering',
      'Optimized and exported from .blend to web-ready .glb'
    ],
    tags: ['Blender', '3D Modeling', 'glTF / GLB', 'model-viewer'],
    cameraOrbit: '45deg 65deg auto'
  }
];
