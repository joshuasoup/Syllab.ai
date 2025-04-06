import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import supabase from '../lib/supabase';

export const getKanbanStates = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { syllabusId } = req.params;
    const userId = req.user.id;

    console.log('[getKanbanStates] Request received:', { syllabusId, userId });

    // Get all Kanban states for this syllabus and user
    const { data, error } = await supabase
      .from('kanban_states')
      .select('*')
      .eq('syllabus_id', syllabusId)
      .eq('user_id', userId);

    if (error) {
      console.error('[getKanbanStates] Database error:', error);
      throw error;
    }

    console.log('[getKanbanStates] Success:', { count: data?.length });
    res.json(data || []);
  } catch (error) {
    console.error('[getKanbanStates] Error:', error);
    res.status(500).json({ error: 'Failed to get Kanban states' });
  }
};

export const updateKanbanState = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { syllabusId } = req.params;
    const userId = req.user.id;
    const { eventId, status } = req.body;

    console.log('[updateKanbanState] Request received:', {
      syllabusId,
      userId,
      eventId,
      status
    });

    // Validate status
    const validStatuses = ['upcoming', 'in_progress', 'finished', 'submitted'];
    if (!validStatuses.includes(status)) {
      console.error('[updateKanbanState] Invalid status:', status);
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Simple insert/update
    const { data, error } = await supabase
      .from('kanban_states')
      .upsert({
        user_id: userId,
        syllabus_id: syllabusId,
        event_id: eventId,
        status: status,
      })
      .select()
      .single();

    if (error) {
      console.error('[updateKanbanState] Database error:', error);
      throw error;
    }

    console.log('[updateKanbanState] Success:', data);
    return res.json(data);
  } catch (error) {
    console.error('[updateKanbanState] Error:', error);
    res.status(500).json({ error: 'Failed to update Kanban state' });
  }
}; 