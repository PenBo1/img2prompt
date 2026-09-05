/**
 * Message types for communication between extension components
 */

// Message types
export type MessageType =
  | "ACTIVATE_SELECTION"
  | "ACTIVATE_SCREENSHOT"
  | "CAPTURE_SCREENSHOT"
  | "IMAGE_CAPTURED"
  | "FETCH_IMAGE"
  | "GENERATE_PROMPT"
  | "PROMPT_GENERATED"
  | "SHOW_PANEL"
  | "HIDE_PANEL"
  | "ERROR";

// Base message interface
export interface BaseMessage {
  payload?: unknown;
  type: MessageType;
}

// Activation messages
export interface ActivateSelectionMessage extends BaseMessage {
  type: "ACTIVATE_SELECTION";
}

export interface ActivateScreenshotMessage extends BaseMessage {
  type: "ACTIVATE_SCREENSHOT";
}

// Capture screenshot message
export interface CaptureScreenshotMessage extends BaseMessage {
  type: "CAPTURE_SCREENSHOT";
}

// Image capture message
export interface ImageMetadata {
  alt?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  filename?: string;
  timestamp: number;
  url?: string;
}

export interface ImageCapturedPayload {
  imageData: string; // base64 data URL
  metadata: ImageMetadata;
  source: "selection" | "screenshot" | "upload";
}

export interface ImageCapturedMessage extends BaseMessage {
  payload: ImageCapturedPayload;
  type: "IMAGE_CAPTURED";
}

// Fetch image message (for cross-origin)
export interface FetchImageMessage extends BaseMessage {
  type: "FETCH_IMAGE";
  url: string;
}

export interface FetchImageResponse {
  imageData: string;
}

// Prompt generation
export interface GeneratePromptMessage extends BaseMessage {
  payload: {
    imageData: string;
    language?: "en" | "zh" | "both";
  };
  type: "GENERATE_PROMPT";
}

export interface PromptGeneratedPayload {
  chinesePrompt: string;
  englishPrompt: string;
  source: "selection" | "screenshot" | "upload";
  timestamp: number;
}

export interface PromptGeneratedMessage extends BaseMessage {
  payload: PromptGeneratedPayload;
  type: "PROMPT_GENERATED";
}

// Panel control
export interface ShowPanelMessage extends BaseMessage {
  type: "SHOW_PANEL";
}

export interface HidePanelMessage extends BaseMessage {
  type: "HIDE_PANEL";
}

// Error message
export interface ErrorMessage extends BaseMessage {
  payload: {
    code: string;
    message: string;
    details?: unknown;
  };
  type: "ERROR";
}

// Union type for all messages
export type ExtensionMessage =
  | ActivateSelectionMessage
  | ActivateScreenshotMessage
  | CaptureScreenshotMessage
  | ImageCapturedMessage
  | FetchImageMessage
  | GeneratePromptMessage
  | PromptGeneratedMessage
  | ShowPanelMessage
  | HidePanelMessage
  | ErrorMessage;
