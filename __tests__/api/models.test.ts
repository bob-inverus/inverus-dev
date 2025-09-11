import { GET as getModels } from '@/app/api/models/route'
import { GET as getSettingsModels } from '@/app/api/models/settings/route'

// Mock the models functions
jest.mock('@/lib/models', () => ({
  getAllModels: jest.fn().mockResolvedValue([
    { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral' },
    { id: 'harvestor', name: 'Harvestor', provider: 'inVerus' },
    { id: 'consortium', name: 'Consortium', provider: 'inVerus' }
  ]),
  getModelsForSettingsWithAccessFlags: jest.fn().mockResolvedValue([
    { id: 'harvestor', name: 'Harvestor', provider: 'inVerus', accessible: true },
    { id: 'consortium', name: 'Consortium', provider: 'inVerus', accessible: true }
  ]),
  getModelsWithAccessFlags: jest.fn().mockResolvedValue([
    { id: 'mistral-large-latest', name: 'Mistral Large', provider: 'Mistral', accessible: true },
    { id: 'harvestor', name: 'Harvestor', provider: 'inVerus', accessible: true },
    { id: 'consortium', name: 'Consortium', provider: 'inVerus', accessible: true }
  ])
}))

describe('/api/models', () => {
  it('should return all models including Mistral', async () => {
    const response = await getModels()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.models).toHaveLength(3)
    expect(data.models.some((m: any) => m.id === 'mistral-large-latest')).toBe(true)
    expect(data.models.some((m: any) => m.id === 'harvestor')).toBe(true)
    expect(data.models.some((m: any) => m.id === 'consortium')).toBe(true)
  })
})

describe('/api/models/settings', () => {
  it('should return only custom models (no Mistral)', async () => {
    const response = await getSettingsModels()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.models).toHaveLength(2)
    expect(data.models.some((m: any) => m.id === 'harvestor')).toBe(true)
    expect(data.models.some((m: any) => m.id === 'consortium')).toBe(true)
    expect(data.models.some((m: any) => m.id === 'mistral-large-latest')).toBe(false)
  })
})
