import { ExecutorContext } from '@nrwl/devkit';
import { NormalizedSwcExecutorOptions } from '../schema';
export interface CliOptions {
    readonly outDir: string;
    readonly outFile: string;
    /**
     * Invoke swc using transformSync. It's useful for debugging.
     */
    readonly sync: boolean;
    readonly sourceMapTarget?: string;
    readonly filename: string;
    readonly filenames: string[];
    readonly extensions: string[];
    readonly watch: boolean;
    readonly copyFiles: boolean;
    readonly includeDotfiles: boolean;
    readonly deleteDirOnStart: boolean;
    readonly quiet: boolean;
}
export declare function compileSwc(context: ExecutorContext, normalizedOptions: NormalizedSwcExecutorOptions, postCompilationCallback: () => Promise<void>): Promise<{
    success: boolean;
}>;
export declare function compileSwcWatch(context: ExecutorContext, normalizedOptions: NormalizedSwcExecutorOptions, postCompilationCallback: () => Promise<void>): AsyncGenerator<{
    success: boolean;
    outfile: string;
}, any, undefined>;
