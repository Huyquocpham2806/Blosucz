"""Check the rendered lattice and full-stage framing, not camera implementation."""
from __future__ import annotations

import pytest

pytestmark = pytest.mark.e2e


@pytest.mark.parametrize("viewport", [(1440, 900), (1280, 720), (390, 844)])
def test_reference_projection_and_all_stage_bounds(page, viewport):
    page, errors = page
    page.set_viewport_size({"width": viewport[0], "height": viewport[1]})
    results = page.evaluate("""async () => {
      const {Vector3} = await import('/vendor/three.module.js');
      const g = window.__bloxorz, results = [];
      for (let id = 1; id <= 15; id++) {
        await g.load(id);
        const camera = g.scene.camera;
        const rect = g.scene.renderer.domElement.getBoundingClientRect();
        const project = (x,y,z) => new Vector3(x,y,z).project(camera);
        const o = project(0,0,0), c = project(1,0,0), r = project(0,0,1);
        const slope = p => -(p.y-o.y)*rect.height / ((p.x-o.x)*rect.width);
        let maxX = 0, maxY = 0;
        g.level.grid.forEach((row,r) => [...row].forEach((ch,c) => {
          if (g.level.legend[ch] === 'void') return;
          for (const dx of [-.5,.5]) for (const dz of [-.5,.5])
            for (const y of [-.35,2.15]) {
              const p = project(c+dx,y,r+dz);
              maxX = Math.max(maxX,Math.abs(p.x));
              maxY = Math.max(maxY,Math.abs(p.y));
            }
        }));
        results.push({id, maxX, maxY, columnSlope:slope(c), rowSlope:slope(r)});
      }
      return results;
    }""")
    for result in results:
        assert result["maxX"] <= 0.861, result
        assert result["maxY"] <= 0.721, result
        assert result["columnSlope"] == pytest.approx(-5 / 32, abs=1e-6)
        assert result["rowSlope"] == pytest.approx(16 / 10, abs=1e-6)
    assert not errors
