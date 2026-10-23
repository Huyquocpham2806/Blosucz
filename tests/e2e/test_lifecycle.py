"""Normal-speed effects and cancellation use the same public controller pipeline."""
from __future__ import annotations

import json
import os
from pathlib import Path

import pytest

pytestmark = pytest.mark.e2e
ROOT = Path(__file__).resolve().parents[2]


def test_terminal_timing_and_input_lock(page):
    page, errors = page
    rows = page.evaluate("""async () => {
      const g = window.__bloxorz, rows = [];
      g.holdTerminal = false;
      let row;
      const originalEvent = g.event.bind(g), originalRequest = g.request.bind(g);
      g.event = async event => {
        const start = performance.now();
        if (['fall','win'].includes(event.type)) row.terminalStart = start;
        const effect = originalEvent(event);
        if (['fall','win'].includes(event.type)) {
          const moves = g.moves, mode = g.mode;
          g.input('UP');
          void g.solve('bfs');
          void g.undo();
          row.locked = ['LOSE_FX','WIN_FX'].includes(mode) && g.mode === mode &&
            g.moves === moves && document.querySelector('#undo').disabled;
        }
        await effect;
        row[event.type] = (performance.now()-start)/1000;
      };
      g.request = async (...args) => {
        const start = performance.now();
        const result = await originalRequest(...args);
        if (row) row.network += (performance.now()-start)/1000;
        return result;
      };
      try {
        for (const outcome of ['fall','win']) for (let trial=0; trial<3; trial++) {
          row = {outcome, trial, network:0};
          g.queue.reduced = true;
          await g.load(1);
          if (outcome === 'win') for (const a of ['RIGHT','DOWN','DOWN','RIGHT','RIGHT','DOWN'])
            await g.move(a);
          row.network = 0;
          g.queue.reduced = false;
          await g.move(outcome === 'fall' ? 'UP' : 'RIGHT');
          row.terminal_to_idle = (performance.now()-row.terminalStart)/1000;
          row.mode = g.mode;
          row.pending = g.queue.pending.size;
          delete row.terminalStart;
          rows.push(row);
        }
      } finally { g.event = originalEvent; g.request = originalRequest; }
      return rows;
    }""")
    for row in rows:
        assert row["mode"] == "IDLE" and row["pending"] == 0
        assert row["locked"], row
        assert 0.15 < row["roll"] < 2
        assert 0.5 < row["terminal_to_idle"] < 8
    output = os.environ.get("BLOXORZ_QA_TIMING")
    if output:
        Path(output).write_text(json.dumps(rows, indent=2) + "\n")
    assert not errors


@pytest.mark.parametrize("outcome", ["fall", "win"])
def test_cancel_during_terminal_effect(page, outcome):
    page, errors = page
    page.evaluate("window.__bloxorz.queue.reduced=true")
    if outcome == "win":
        for action in ["RIGHT", "DOWN", "DOWN", "RIGHT", "RIGHT", "DOWN"]:
            page.evaluate("(a)=>window.__bloxorz.move(a)", action)
    page.evaluate("window.__bloxorz.queue.reduced=false")
    page.evaluate("(a)=>{void window.__bloxorz.move(a)}", "UP" if outcome == "fall" else "RIGHT")
    mode = "LOSE_FX" if outcome == "fall" else "WIN_FX"
    page.wait_for_function("(mode)=>window.__bloxorz.mode === mode", arg=mode)
    page.evaluate("window.__bloxorz.queue.visibility(true)")
    assert page.locator("#undo").is_disabled()
    page.evaluate("window.__bloxorz.load(9)")
    assert page.evaluate("window.__bloxorz.level.id") == 9
    assert page.evaluate("window.__bloxorz.mode") == "IDLE"
    assert page.evaluate("window.__bloxorz.queue.pending.size") == 0
    assert page.evaluate("window.__bloxorz.block.check(window.__bloxorz.state)")
    assert not errors


def test_visibility_and_replay_speed_reset(page):
    page, errors = page
    page.evaluate("""() => {
      const g = window.__bloxorz;
      g.queue.reduced = false;
      void g.move('RIGHT');
    }""")
    page.wait_for_function("window.__bloxorz.queue.pending.size > 0")
    page.evaluate("window.__bloxorz.queue.visibility(true)")
    assert page.evaluate("[...window.__bloxorz.queue.pending].every(i=>i.tween.paused())")
    page.evaluate("window.__bloxorz.queue.visibility(false)")
    page.wait_for_function("window.__bloxorz.mode === 'IDLE'")
    page.evaluate("window.__bloxorz.queue.speed=4")
    page.evaluate("window.__bloxorz.restart()")
    assert page.evaluate("window.__bloxorz.queue.speed") == 1
    assert page.locator("#speed").input_value() == "1"
    assert not errors


def test_normal_speed_split_and_merge(page):
    page, errors = page
    from core.constants import CODES

    level = json.loads((ROOT / "levels/level_08.json").read_text())
    page.evaluate("window.__bloxorz.load(8)")
    page.evaluate("window.__bloxorz.queue.reduced=false")
    events = []
    for code in level["meta"]["solution"]:
        page.evaluate("(a)=>window.__bloxorz.move(a)", CODES[code].value)
        events.extend(page.evaluate("window.__bloxorz.lastResult.events.map(e=>e.type)"))
    assert {"split", "merge", "win"} <= set(events)
    assert page.evaluate("window.__bloxorz.status") == "WON"
    assert not errors


@pytest.mark.parametrize("outcome", ["fall", "win"])
def test_terminal_block_does_not_remain_under_board(page, outcome):
    page, errors = page
    if outcome == "win":
        for action in ["RIGHT", "DOWN", "DOWN", "RIGHT", "RIGHT", "DOWN"]:
            page.evaluate("(a)=>window.__bloxorz.move(a)", action)
    page.evaluate("(a)=>window.__bloxorz.move(a)", "UP" if outcome == "fall" else "RIGHT")
    assert page.evaluate("window.__bloxorz.block.meshes.every(m=>!m.visible)")
    page.evaluate("window.__bloxorz.restart()")
    assert page.evaluate("window.__bloxorz.block.meshes.every(m=>m.visible)")
    assert not errors


def test_webgl_context_loss_message(page):
    page, errors = page
    available = page.evaluate("""() => {
      const gl = window.__bloxorz.scene.renderer.getContext();
      const extension = gl.getExtension('WEBGL_lose_context');
      if (!extension) return false;
      extension.loseContext();
      return true;
    }""")
    assert available, "Test Chromium must provide WEBGL_lose_context"
    page.locator("#context-error").wait_for(state="visible")
    assert not errors


def test_pointer_dpad_key_repeat_and_offline_assets(page):
    page, errors = page
    blocked = []

    def offline(route):
        if route.request.url.startswith("http://127.0.0.1:"):
            route.continue_()
        else:
            blocked.append(route.request.url)
            route.abort()

    page.route("**/*", offline)
    page.reload()
    page.wait_for_function("window.__bloxorz?.mode === 'IDLE'")
    page.evaluate("window.__bloxorz.holdTerminal=true")
    page.locator('[data-action="RIGHT"]').click()
    page.wait_for_function("window.__bloxorz.mode === 'IDLE' && window.__bloxorz.moves === 1")
    page.evaluate("""() => {
      for(let i=0;i<50;i++) window.dispatchEvent(new KeyboardEvent('keydown',
        {key:'ArrowDown',repeat:true}));
      const canvas=window.__bloxorz.scene.renderer.domElement;
      canvas.dispatchEvent(new PointerEvent('pointerdown',{clientX:100,clientY:100,pointerType:'touch'}));
      canvas.dispatchEvent(new PointerEvent('pointerup',{clientX:100,clientY:180,pointerType:'touch'}));
    }""")
    page.wait_for_function("window.__bloxorz.mode === 'IDLE' && window.__bloxorz.moves === 2")
    assert page.evaluate("window.__bloxorz.block.check(window.__bloxorz.state)")
    assert not blocked and not errors
