# Team Configuration System

This folder contains the team configuration system for managing team member data in a centralized, maintainable way.

## Structure

```
lib/team/
├── config.ts     # Team member data and types
├── utils.ts      # Utility functions for team operations
├── index.ts      # Export barrel file
└── README.md     # This documentation
```

## Usage

### Basic Import

```typescript
import { teamMembers, recruitingCard, teamQuote } from '@/lib/team'
```

### Adding a New Team Member

1. Open `lib/team/config.ts`
2. Add a new object to the `teamMembers` array:

```typescript
{
  id: 'unique-id',
  name: 'Full Name',
  title: 'Their Role/Title',
  description: 'Brief description of their background...',
  image: '/team/their-image.jpg',
  linkedinUrl: 'https://www.linkedin.com/in/their-profile/',
  companies: [
    { name: 'Company 1', logo: '/companies/company1.svg' },
    { name: 'Company 2', logo: '/companies/company2.svg' }
  ]
}
```

### Using Utility Functions

```typescript
import { 
  teamMembers, 
  getTeamMemberById, 
  getAdvisors, 
  getCoreTeam,
  getAllCompanies 
} from '@/lib/team'

// Get a specific team member
const andrew = getTeamMemberById('andrew', teamMembers)

// Get all advisors
const advisors = getAdvisors(teamMembers)

// Get core team (non-advisors)
const coreTeam = getCoreTeam(teamMembers)

// Get all companies
const companies = getAllCompanies(teamMembers)
```

## Types

### TeamMember

```typescript
interface TeamMember {
  id: string              // Unique identifier
  name: string           // Full name
  title: string          // Role/title (e.g., "THE OPERATOR", "ADVISOR – GTM")
  description: string    // Bio/description
  image: string          // Path to profile image
  linkedinUrl: string    // LinkedIn profile URL
  companies: {           // Array of associated companies
    name: string         // Company name
    logo: string         // Path to company logo
  }[]
}
```

### RecruitingCard

```typescript
interface RecruitingCard {
  id: string             // Unique identifier
  title: string          // Role title (e.g., "Signal Catalyst")
  description: string    // Recruiting message
  ctaText: string        // Call-to-action button text
  ctaEmail: string       // Email for applications
}
```

## Available Utility Functions

- `getTeamMemberById(id, members)` - Find team member by ID
- `getTeamMembersByRole(rolePattern, members)` - Filter by role pattern
- `getAdvisors(members)` - Get all advisors
- `getCoreTeam(members)` - Get core team members
- `getCompaniesString(member)` - Get formatted company names
- `getAllCompanies(members)` - Get unique company list
- `formatDescription(description)` - Format with line breaks
- `getLinkedInUsername(url)` - Extract LinkedIn username
- `validateTeamMember(member)` - Validate data structure

## Example Component Usage

```typescript
import { teamMembers, recruitingCard } from '@/lib/team'

export function TeamGrid() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {teamMembers.map((member) => (
        <div key={member.id} className="team-card">
          <img src={member.image} alt={member.name} />
          <h3>{member.name}</h3>
          <p>{member.title}</p>
          <p>{member.description}</p>
          <div className="companies">
            {member.companies.map((company, i) => (
              <img key={i} src={company.logo} alt={company.name} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
```

## Benefits

✅ **Centralized Data**: All team info in one place  
✅ **Type Safety**: Full TypeScript support  
✅ **Easy Maintenance**: Add/edit/remove members easily  
✅ **Reusable**: Use across multiple components  
✅ **Validation**: Built-in data validation  
✅ **Utilities**: Helper functions for common operations 