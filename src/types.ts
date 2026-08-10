export type { LetterStatus } from "./utils/evaluateGuess";

export type GameMode = "daily" | "random";

export type GameStatus = "playing" | "won" | "lost";

export type ToastType = "info" | "success" | "error";

export interface ToastMessage {
  id: number;
  text: string;
  type: ToastType;
}
