export class ClientConnectionError extends Error {
    constructor(message: string | undefined) {
        super(message);
        this.name = "ClientConnectionError";
    }
}

export class NoWatchFilesError extends Error {
    constructor(message: string | undefined) {
        super(message);
        this.name = "NoWatchFilesError";
    }
}