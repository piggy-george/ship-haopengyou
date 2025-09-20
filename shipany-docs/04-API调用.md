# API 调用

app/api/ping/route.ts:
```typescript
import { respData, respErr } from "@/lib/resp";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    if (!message) {
      return respErr("invalid params");
    }
    
    return respData({
      pong: `received message: ${message}`,
    });
  } catch (e) {
    console.log("test failed:", e);
    return respErr("test failed");
  }
}
```

Terminal:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"message": "hello"}' \
  http://localhost:3000/api/ping
```

Last updated on 2025年1月5日