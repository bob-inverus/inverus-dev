export interface TeamMember {
  id: string
  name: string
  title: string
  description: string
  image: string
  linkedinUrl: string
  companies: {
    name: string
    logo: string
  }[]
}

export interface RecruitingCard {
  id: string
  title: string
  description: string
  ctaText: string
  ctaEmail: string
}

export const teamMembers: TeamMember[] = [
  {
    id: 'andrew',
    name: 'Andrew O\'Doherty',
    title: 'THE OPERATOR',
    description: 'From Wall Street to Web3: channels capital-markets discipline into building a verifiable layer for the internet that clears humans, content, and agents at millisecond speed.',
    image: '/team/andrew_odoherty.png',
    linkedinUrl: 'https://www.linkedin.com/in/andrewirl',
    companies: [
      { name: 'Citi', logo: '/companies/citi.svg' },
      { name: 'PWC', logo: '/companies/pwc.svg' }
    ]
  },
  {
    id: 'jim',
    name: 'Jim Anderson',
    title: 'THE ARCHITECT',
    description: 'From Prodigy to co-founding About.com to Spotify\'s mass rollout, his blueprints reach billions. A go-to advisor for homeland-security tech; his next build lets every digital actor prove it\'s real.',
    image: '/team/jim-anderson.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/jimcto',
    companies: [
      { name: 'Spotify', logo: '/companies/spotify.svg' },
      { name: 'About.com', logo: '/companies/about.svg' }
    ]
  },
  {
    id: 'steven',
    name: 'Steven G Chrust',
    title: 'THE GOVERNOR',
    description: 'From Sanford C. Bernstein\'s research desk to co-founding WinStar\'s multi-billion IPO, now steering private-equity capital and governance so the Trust Protocol launches with institutional polish.',
    image: '/team/steven-chrust.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/schrust',
    companies: [
      { name: 'Centricap', logo: '/companies/centricap.svg' },
      { name: 'Winstar', logo: '/companies/winstar.svg' }
    ]
  },
  {
    id: 'stephen',
    name: 'Stephen Rossetter',
    title: 'THE CUSTODIAN',
    description: 'EY auditor — venture-fund CFO — PE co-founder. Four decades of capital hygiene and board seats now keep balance sheets mission-proof for internet-scale infrastructure.',
    image: '/team/stephen-rossetter.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/steve-rossetter-a81a08a',
    companies: [
      { name: 'EY', logo: '/companies/ey.svg' },
      { name: 'Centricap', logo: '/companies/centricap.svg' }
    ]
  },
  {
    id: 'jeffrey',
    name: 'Jeffrey Brodlieb',
    title: 'THE STRATEGIST',
    description: 'Private-equity partner and HBS MBA who led GE Capital turnarounds. Launched PREVIEW TV into the nation\'s fastest-growing subscription network, then advised Fortune 100s at BCG—four decades of strategy distilled.',
    image: '/team/jeffrey-brodlieb.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/jeff-brodlieb-07b18441',
    companies: [
      { name: 'BCG', logo: '/companies/bcg.svg' },
      { name: 'GE', logo: '/companies/ge.svg' }
    ]
  },
  {
    id: 'david',
    name: 'David Bell',
    title: 'ADVISOR – Brand & Narrative',
    description: 'Advertising Hall-of-Famer, ex-IPG Chairman. Led two NYSE-listed holding companies, advised AOL & Google in breakout years, and turned Bozell into a top-ten global agency.',
    image: '/team/david_bell.png',
    linkedinUrl: 'https://www.linkedin.com/in/david-bell-01276a5',
    companies: [
      { name: 'Google', logo: '/companies/google.svg' },
      { name: 'IPG', logo: '/companies/ipg.svg' }
    ]
  },
  {
    id: 'lawrence',
    name: 'Lawrence Leibowitz',
    title: 'ADVISOR – Market Structure & Governance',
    description: 'Former COO of NYSE, led through its $10bn ICE acquisition. Understands how governance, liquidity, and confidence intertwine. Now applies that muscle to make credibility an asset class.',
    image: '/team/lawrence_leibowitz.png',
    linkedinUrl: 'https://www.linkedin.com/in/lleibowitz',
    companies: [
      { name: 'NYSE', logo: '/companies/nyse.svg' },
      { name: 'UBS', logo: '/companies/ubs.svg' }
    ]
  },
  {
    id: 'tom',
    name: 'Tom Saleh',
    title: 'ADVISOR – Infrastructure & Compliance',
    description: 'Built the first automated futures exchange, overhauled FASB\'s XBRL "intelligent-data" project, and pioneered policy-driven VM security a decade before "zero trust." Seven companies founded, six exits—three decades turning complexity into compliance.',
    image: '/team/tom_saleh.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/tom-saleh-5a56b03',
    companies: [
      { name: 'FASB', logo: '/companies/fasb.svg' },
      { name: 'NYSE', logo: '/companies/nyse.svg' }
    ]
  },
  {
    id: 'keith',
    name: 'Keith Turco',
    title: 'ADVISOR – GTM & Enterprise Growth',
    description: '25-year growth architect: scaled CA Tech, Ogilvy, and Merge. Crafts B2B flywheels so new categories feel inevitable. Built and exited agencies, ran $100m P&Ls, served on AAF & ANA boards.',
    image: '/team/keith_turco.png',
    linkedinUrl: 'https://www.linkedin.com/in/keith-turco',
    companies: [
      { name: 'Madison Logic', logo: '/companies/madison-logic.svg' },
      { name: 'Broadcom', logo: '/companies/broadcom.svg' }
    ]
  },
  {
    id: 'alan',
    name: 'Alan Kessman',
    title: 'ADVISOR – Scale & Capital Markets',
    description: 'Serial CEO & turnaround specialist. Sixteen boardrooms, countless crises. Led $500m businesses through turnaround, growth, and exit—including the PE sale of Universal Marine Medical.',
    image: '/team/alan-kessman.jpg',
    linkedinUrl: 'https://www.linkedin.com/in/alan-kessman-bb787016/',
    companies: [
      { name: 'Unimed', logo: '/companies/unimed.svg' },
      { name: 'Vion', logo: '/companies/vion.svg' }
    ]
  }
]

export const recruitingCard: RecruitingCard = {
  id: 'recruiting',
  title: 'Signal Catalyst',
  description: `If you built a bot that crashed the school network just for fun…
If you'd rather create the future, not copy the past…
If you've ever looked at the internet and thought, "I can fix this…"
Then we're looking for you.
We don't want your resume.
This is about your signal.
If it resonates, it will find us.`,
  ctaText: 'Send your Signal',
  ctaEmail: 'andrew@inverus.tech'
}

export const teamQuote = "A generational ensemble… forged across cycles, systems, and disciplines… aligned by one mission: to rebuild trust at the protocol layer of the internet." 