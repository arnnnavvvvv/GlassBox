# GlassBox Demo

`scenario.json` is a fixed, scripted sequence of BTC-USD price ticks -- not
random -- so the recorded demo hits the same beats every take, including one
engineered breakout tick designed to push the trading agent toward a
position large enough to trip the risk agent's hard cap, guaranteeing a
rejection.

## Run

Requires the backend running (`uvicorn app.main:app` in `/backend`) and a
deployed + registered contract.

```bash
pip install -r ../agents/requirements.txt
python run_demo.py --delay 2
```

Each tick prints the trading agent's proposal, the risk agent's verdict, and
the resulting onchain commit (tx hash + decision hash) as it happens. If any
commit fails, the run halts immediately (`GateBlockedError`) rather than
continuing as if nothing happened.
