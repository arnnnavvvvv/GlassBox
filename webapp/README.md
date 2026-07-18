# GlassBox Webapp

Landing page, live feed, and Verify modal (Next.js App Router).

- `app/page.tsx` -- landing page, hero built around the glass-box motif.
- `app/feed/page.tsx` + `components/FeedView.tsx` -- stat cards, price chart with
  decision markers, and the scrollable decision list.
- `components/VerifyModal.tsx` -- fetches a decision's raw payload, recomputes
  its hash client-side (`lib/canonical.ts`), reads the committed hash directly
  from Monad via RPC (`lib/chain.ts`, not through the backend), and shows the
  two side by side.

`lib/canonical.ts` mirrors `gate/glassbox_gate/canonical.py` -- change one,
change the other. By the time a payload is fetched here its numbers are
already fixed-precision strings (canonicalized upstream by the gate), so this
file mainly sorts keys and serializes compactly before hashing.

## Setup

```bash
npm install
cp .env.example .env.local
```

Fill in `.env.local`:
- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_RPC_URL` -- Monad testnet RPC
- `NEXT_PUBLIC_CONTRACT_ADDRESS` -- from `contracts/deployments/<network>.json`
- `NEXT_PUBLIC_EXPLORER_TX_URL`

```bash
npm run dev
```
