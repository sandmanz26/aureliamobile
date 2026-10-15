# network3d — measuring the Home network artwork (U035)

`src/components/network3d/` rebuilds `src/assets/aurelia-network.png` in
Three.js. Its inputs are measured from that PNG by these scripts, run from
the repo root (Python 3 with numpy, scipy, scikit-image, Pillow):

```bash
python3 scripts/network3d/extract.py   # node blobs        -> scripts/network3d/nodes.json
python3 scripts/network3d/soft.py      # radius/softness   -> scripts/network3d/soft.json
python3 scripts/network3d/head.py      # figure cut-out + relief -> head.png, head-depth.png
python3 scripts/network3d/gen.py       # -> src/components/network3d/networkData.ts
```

The edge list in `gen.py` (`D` dashed, `S` solid) was read off the artwork by
tracing from each node and a Hough pass, then checked by rendering the scene
at rest and pixel-diffing it against the PNG (mean |Δ| ≈ 0.9/255 at 778px).
If the artwork changes, re-run all four and re-check the edge list.
