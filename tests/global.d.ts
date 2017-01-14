declare interface ErrorModel extends AlertResponse {
    message?: string;
    url?: string;
    line?: number;
    col?: number;
    error?: Error
}

declare interface ClickCommand extends AlertResponse {
    targetId: string;
}

declare interface AlertResponse {
    type: string;
}