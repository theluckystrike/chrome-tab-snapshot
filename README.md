# chrome-tab-snapshot — Tab State Snapshots
> **Built by [Zovo](https://zovo.one)** | `npm i chrome-tab-snapshot`

Capture tab states, diff snapshots, restore tabs, and persist history.

```typescript
import { TabSnapshot } from 'chrome-tab-snapshot';
const snap = new TabSnapshot();
const before = await snap.take('morning');
const after = await snap.take('evening');
const changes = snap.diff(before, after);
```
MIT License
