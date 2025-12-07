# Clean Reinstall Steps

After deleting `node_modules`, follow these steps:

## Step 1: Delete lock file (optional but recommended)
```powershell
Remove-Item pnpm-lock.yaml
```

## Step 2: Clear pnpm cache
```powershell
pnpm store prune
```

## Step 3: Clear Next.js cache
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
```

## Step 4: Reinstall dependencies
```powershell
pnpm install
```

## Step 5: Restart dev server
```powershell
pnpm dev
```

## Alternative: All-in-one command
```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue; Remove-Item pnpm-lock.yaml -ErrorAction SilentlyContinue; pnpm store prune; pnpm install
```

