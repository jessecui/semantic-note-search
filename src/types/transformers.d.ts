declare module '@xenova/transformers' {
    export interface PipelineOptions {
        pooling?: 'mean' | 'cls';
        normalize?: boolean;
    }

    export interface PipelineOutput {
        data: number[];
    }

    export function pipeline(
        task: 'feature-extraction',
        model: string,
        options?: PipelineOptions
    ): Promise<(text: string, options?: PipelineOptions) => Promise<PipelineOutput>>;
} 