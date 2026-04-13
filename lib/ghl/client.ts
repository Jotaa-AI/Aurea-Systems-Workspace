const GHL_BASE_URL = 'https://services.leadconnectorhq.com'

export class GHLClient {
  private apiKey: string
  private locationId: string

  constructor(apiKey: string, locationId: string) {
    this.apiKey = apiKey
    this.locationId = locationId
  }

  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${GHL_BASE_URL}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        Version: '2021-07-28',
        ...options?.headers,
      },
    })

    if (!res.ok) {
      const body = await res.text()
      throw new Error(`GHL API error ${res.status}: ${body}`)
    }

    return res.json()
  }

  async getContacts(params?: { limit?: number; query?: string }) {
    const searchParams = new URLSearchParams({
      locationId: this.locationId,
      limit: String(params?.limit ?? 20),
    })
    if (params?.query) searchParams.set('query', params.query)

    return this.request<{
      contacts: Array<{
        id: string
        firstName: string
        lastName: string
        email: string
        phone: string
        dateAdded: string
        tags: string[]
      }>
      meta: { total: number }
    }>(`/contacts/?${searchParams}`)
  }

  async getOpportunities(params?: { limit?: number; stageId?: string }) {
    const searchParams = new URLSearchParams({
      location_id: this.locationId,
      limit: String(params?.limit ?? 20),
    })
    if (params?.stageId) searchParams.set('stage_id', params.stageId)

    return this.request<{
      opportunities: Array<{
        id: string
        name: string
        monetaryValue: number
        status: string
        contact: { id: string; name: string }
        createdAt: string
      }>
      meta: { total: number }
    }>(`/opportunities/search?${searchParams}`)
  }

  async getCalendarAppointments(params: {
    startDate: string
    endDate: string
  }) {
    const searchParams = new URLSearchParams({
      locationId: this.locationId,
      startDate: params.startDate,
      endDate: params.endDate,
    })

    return this.request<{
      events: Array<{
        id: string
        title: string
        status: string
        appointmentStatus: string
        contactId: string
        startTime: string
        endTime: string
      }>
    }>(`/calendars/events?${searchParams}`)
  }

  async getConversations(params?: { limit?: number }) {
    const searchParams = new URLSearchParams({
      locationId: this.locationId,
      limit: String(params?.limit ?? 20),
    })

    return this.request<{
      conversations: Array<{
        id: string
        contactId: string
        lastMessageBody: string
        lastMessageDate: string
        unreadCount: number
      }>
    }>(`/conversations/search?${searchParams}`)
  }
}
