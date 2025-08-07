export interface CallHistoryRequest {
  user_id: number;
  partner_id: number;
  room_name: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
  recording_url?: string;
  transcript_url?: string;
  summary_text?: string;
}

export interface CallHistoryResponse {
  id: number;
  user_id: number;
  partner_id: number;
  room_name: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
  recording_url?: string;
  transcript_url?: string;
  summary_text?: string;
  created_at: Date;
  partner: {
    id: number;
    name: string;
    profile_image?: string;
  };
}
