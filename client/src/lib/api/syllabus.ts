  async deleteEvent(eventId: string) {
    const response = await fetch(`${this.baseUrl}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete event');
    }

    return response.json();
  }, 
