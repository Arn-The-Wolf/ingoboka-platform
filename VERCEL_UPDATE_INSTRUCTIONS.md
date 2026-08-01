# 🚀 Update Vercel Environment Variables

## ⚠️ IMPORTANT: Backend URL Changed

The backend API URL has been updated:
- **OLD**: `http://185.181.10.165:8085/api/v1`
- **NEW**: `http://4.168.192.169:8085/api/v1`

---

## ✅ Already Updated

✅ **Local Development** (`.env.local`) - Working  
✅ **Example Config** (`.env.local.example`) - Updated  
✅ **Production Config** (`.env.production`) - Updated  
✅ **Code Changes** - Pushed to GitHub

---

## 🔴 ACTION REQUIRED: Update Vercel Production

### Method 1: Using Vercel Dashboard (Recommended)

1. **Open Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Login if needed

2. **Select Your Project**
   - Click on: **ingoboka-platform**

3. **Navigate to Settings**
   - Click: **Settings** (top navigation)

4. **Go to Environment Variables**
   - Click: **Environment Variables** (left sidebar)

5. **Update the Variable**
   - Find: `NEXT_PUBLIC_API_BASE_URL`
   - Click the **three dots (•••)** menu next to it
   - Click: **Edit**
   - Change the value to: `http://4.168.192.169:8085/api/v1`
   - Select environments: **Production**, **Preview**, **Development** (all)
   - Click: **Save**

6. **Redeploy**
   - Go to: **Deployments** tab
   - Click the **three dots (•••)** on the latest deployment
   - Click: **Redeploy**
   - Wait for deployment to complete (~2-3 minutes)

---

### Method 2: Using Vercel CLI (Alternative)

If you prefer command line:

```bash
# 1. Login to Vercel
vercel login

# 2. Link project (if not already linked)
vercel link

# 3. Remove old variable
vercel env rm NEXT_PUBLIC_API_BASE_URL

# 4. Add new variable for all environments
vercel env add NEXT_PUBLIC_API_BASE_URL

# When prompted:
# - Value: http://4.168.192.169:8085/api/v1
# - Environments: Select Production, Preview, Development (use space to select, enter to confirm)

# 5. Redeploy
vercel --prod
```

---

## 🧪 Verify the Update

After updating and redeploying:

### 1. Test Production Site
- Visit: https://ingoboka-platform.vercel.app/en
- Open browser console (F12)
- Try logging in with test credentials:
  - Phone: `+250780000001`
  - Password: `Ingoboka@2026`

### 2. Check API Calls
In the browser console, you should see API requests going to:
```
http://4.168.192.169:8085/api/v1/...
```

### 3. Test Hero Section Buttons
- Click "Get Started" button → Should navigate to `/register`
- Click "Login" button → Should navigate to `/login`
- Both buttons should work without errors

---

## 📊 Quick Reference

| Environment | API Base URL |
|-------------|-------------|
| **Local Dev** | `http://4.168.192.169:8085/api/v1` ✅ |
| **Vercel Production** | `http://4.168.192.169:8085/api/v1` ⚠️ UPDATE NEEDED |
| **Vercel Preview** | `http://4.168.192.169:8085/api/v1` ⚠️ UPDATE NEEDED |

---

## 🔗 Important Links

- **Frontend (Production)**: https://ingoboka-platform.vercel.app/en
- **Frontend (Kinyarwanda)**: https://ingoboka-platform.vercel.app/rw
- **Backend API**: http://4.168.192.169:8085/api/v1
- **Swagger Docs**: http://4.168.192.169:8085/swagger-ui.html
- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repo**: https://github.com/Arn-The-Wolf/ingoboka-platform

---

## ❓ Troubleshooting

### Issue: "Network Error" or "API not reachable"
**Solution**: Make sure the backend server at `4.168.192.169:8085` is running

### Issue: Buttons not working on hero section
**Solution**: Clear browser cache and hard refresh (Ctrl+F5 or Cmd+Shift+R)

### Issue: Old API URL still being used
**Solution**: 
1. Verify Vercel environment variable is updated
2. Redeploy from Vercel dashboard
3. Wait for deployment to complete
4. Clear browser cache

### Issue: "Mixed Content" error (HTTPS/HTTP)
**Note**: This is expected. The production site uses HTTPS but the API uses HTTP. This is acceptable for internal development/testing but should be changed to HTTPS for production.

---

## 📝 Notes

- The environment variable `NEXT_PUBLIC_API_BASE_URL` is exposed to the browser (that's what `NEXT_PUBLIC_` prefix means)
- After updating, all new deployments will automatically use the new value
- Existing deployments need to be redeployed to pick up the new value
- You can verify the current value in Vercel Dashboard under Settings → Environment Variables

---

**Last Updated**: August 1, 2026  
**Status**: Waiting for Vercel environment variable update
