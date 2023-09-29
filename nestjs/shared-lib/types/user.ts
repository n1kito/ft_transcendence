export interface IMatchHistory {
	player1Login: string;
	player1Score: number;
	player1Image: string;
	player2Login: string;
	player2Score: number;
	player2Image: string;
}

export interface IUserData {
	// User informatiom
	id: number;
	login: string;
	image: string;
	email?: string;
	// Profile information
	killCount?: number;
	rank?: number;
	winRate?: number;
	gamesCount: number;
	// Target
	targetLogin?: string;
	targetImage?: string;
	targetDiscoveredByUser: boolean;
	// Bestie
	bestieLogin?: string;
	// Rival
	rivalLogin?: string;
	rivalImage?: string;
	// Games
	matchHistory?: IMatchHistory[];
}
