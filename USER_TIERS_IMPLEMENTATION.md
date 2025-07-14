# User Tiers & Credits System Implementation

This implementation adds a comprehensive user tier system with credits to your application. It includes three tiers: Basic, Pro, and Enterprise, each with different credit allocations and features.

## 🚀 Features

- **3 User Tiers**: Basic (50 credits), Pro (500 credits), Enterprise (custom credits)
- **Account Management**: New Account section in Settings with tier information
- **Upgrade Flow**: "Upgrade to Pro" button opens Settings with Account tab
- **Credits System**: Track and display user credit usage
- **Database Integration**: Full Supabase integration with automatic defaults

## 📁 Files Added/Modified

### New Files
- `app/components/layout/settings/account/account-section.tsx` - Main account management UI
- `app/components/layout/settings/account/account-trigger.tsx` - Account menu trigger (matches your HTML structure)
- `migrations/add-user-tiers.sql` - Database migration script

### Modified Files
- `app/types/user.ts` - Added user tier types and configurations
- `app/types/database.types.ts` - Added tier and credits columns
- `app/components/layout/settings/settings-content.tsx` - Added Account tab
- `app/components/layout/sidebar/app-nav-user.tsx` - Modified upgrade flow
- `lib/user/api.ts` - Added automatic tier/credits initialization

## 🗄️ Database Setup

1. **Run the migration script** in your Supabase SQL editor:
   ```sql
   -- Copy and paste the contents of migrations/add-user-tiers.sql
   ```

2. **The migration will:**
   - Add `tier` and `credits` columns to the `users` table
   - Set default values for existing users (Basic tier, 50 credits)
   - Create a trigger to automatically set defaults for new users
   - Add performance indexes

## 🎯 User Tiers Configuration

```typescript
export const USER_TIERS: Record<UserTier, UserTierInfo> = {
  basic: {
    name: "Basic",
    credits: 50,
    features: [
      "Basic chat functionality",
      "50 credits per month", 
      "Community support"
    ]
  },
  pro: {
    name: "Pro",
    credits: 500,
    features: [
      "All Basic features",
      "500 credits per month",
      "Premium models access",
      "Priority support", 
      "Advanced features"
    ]
  },
  enterprise: {
    name: "Enterprise", 
    credits: 0, // Custom allocation
    isCustomCredits: true,
    features: [
      "All Pro features",
      "Custom credit allocation",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantees"
    ]
  }
}
```

## 🔧 Usage

### Accessing User Tier Information
```typescript
import { useUser } from "@/lib/user-store/provider"
import { USER_TIERS, type UserTier } from "@/app/types/user"

function MyComponent() {
  const { user } = useUser()
  
  // Get user's current tier (defaults to "basic" if not set)
  const userTier: UserTier = user?.tier || "basic"
  const userCredits = user?.credits || USER_TIERS.basic.credits
  const tierInfo = USER_TIERS[userTier]
  
  return (
    <div>
      <p>Tier: {tierInfo.name}</p>
      <p>Credits: {userCredits}</p>
    </div>
  )
}
```

### Checking User Permissions
```typescript
function hasFeatureAccess(userTier: UserTier, feature: string): boolean {
  switch (userTier) {
    case "enterprise":
      return true // Enterprise has access to everything
    case "pro":
      return feature !== "enterprise-only"
    case "basic":
    default:
      return feature === "basic"
  }
}
```

### Updating User Credits
```typescript
import { updateUserProfile } from "@/lib/user-store/api"

async function updateUserCredits(userId: string, newCredits: number) {
  await updateUserProfile(userId, { credits: newCredits })
}
```

## 🎨 UI Components

### Account Section
The new Account section in Settings displays:
- Current plan with badge
- Credit usage with progress bar
- Plan features list
- Available upgrade options
- Upgrade buttons

### Account Menu Item
The Account menu item uses your exact HTML structure:
```html
<div role="menuitem" data-slot="dropdown-menu-item" data-variant="default" class="...">
  <svg><!-- BadgeCheck icon --></svg>
  Account
</div>
```

## 🔄 Upgrade Flow

1. User clicks "Upgrade to Pro" in the user dropdown
2. Settings dialog opens automatically
3. User can see Account tab with tier information
4. Upgrade buttons redirect to payment/contact flow

## 🛠️ Customization

### Adding New Tiers
1. Update the `UserTier` type in `app/types/user.ts`
2. Add new tier configuration to `USER_TIERS`
3. Update database constraint in migration script
4. Update UI components as needed

### Modifying Credit Amounts
Simply update the `credits` value in the `USER_TIERS` configuration.

### Custom Features per Tier
Add new features to the `features` array in each tier configuration.

## 🔒 Security Considerations

- User tier and credits are stored in the database
- Client-side tier checking should be validated server-side
- Consider implementing server-side credit deduction
- Add rate limiting based on user tiers

## 📱 Mobile Support

The implementation includes full mobile support:
- Responsive Account section
- Mobile-optimized settings dialog
- Touch-friendly upgrade buttons

## 🧪 Testing

Test the implementation:
1. Create users with different tiers
2. Verify credit display and progress bars
3. Test upgrade flow from Basic to Pro
4. Ensure Account menu item works correctly
5. Verify database triggers work for new users

## 📝 Notes

- The system automatically initializes new users with Basic tier and 50 credits
- Enterprise tier supports custom credit allocation
- All existing users will be migrated to Basic tier with 50 credits
- The implementation is fully integrated with your existing Supabase setup

## 🤝 Support

If you need to modify credit allocation logic or add payment integration, the upgrade handlers in the Account components are ready for your custom implementation. 