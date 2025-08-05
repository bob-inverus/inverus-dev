import { TeamMember } from './config'

export function getTeamMemberById(id: string, members: TeamMember[]): TeamMember | undefined {
  return members.find(member => member.id === id)
}

export function getTeamMembersByRole(rolePattern: string, members: TeamMember[]): TeamMember[] {
  return members.filter(member => 
    member.title.toLowerCase().includes(rolePattern.toLowerCase())
  )
}

export function getAdvisors(members: TeamMember[]): TeamMember[] {
  return getTeamMembersByRole('ADVISOR', members)
}

export function getCoreTeam(members: TeamMember[]): TeamMember[] {
  return members.filter(member => 
    !member.title.toLowerCase().includes('advisor')
  )
}

export function getCompaniesString(member: TeamMember): string {
  return member.companies.map(company => company.name).join(', ')
}

export function getAllCompanies(members: TeamMember[]): string[] {
  const companies = new Set<string>()
  members.forEach(member => {
    member.companies.forEach(company => {
      companies.add(company.name)
    })
  })
  return Array.from(companies).sort()
}

export function formatDescription(description: string): string {
  return description.replace(/\.\s/g, '.\n')
}

export function getLinkedInUsername(linkedinUrl: string): string {
  const match = linkedinUrl.match(/linkedin\.com\/in\/([^\/]+)/)
  return match ? match[1] : ''
}

export function validateTeamMember(member: any): member is TeamMember {
  return (
    typeof member === 'object' &&
    typeof member.id === 'string' &&
    typeof member.name === 'string' &&
    typeof member.title === 'string' &&
    typeof member.description === 'string' &&
    typeof member.image === 'string' &&
    typeof member.linkedinUrl === 'string' &&
    Array.isArray(member.companies) &&
    member.companies.every((company: any) => 
      typeof company.name === 'string' && typeof company.logo === 'string'
    )
  )
} 