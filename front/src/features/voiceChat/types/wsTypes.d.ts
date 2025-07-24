export type MatchProposalMessage = {
  event: "match_proposal";
  room: string;
  partner_id: number;
};

export type MatchedMessage = {
  event: "matched";
  room: string;
};

export type RejectedMessage = {
  event: "rejected";
};

export type DisconnectedMessage = {
  event: "disconnected";
};

export type IncomingMessage =
  | MatchProposalMessage
  | MatchedMessage
  | RejectedMessage
  | DisconnectedMessage;
