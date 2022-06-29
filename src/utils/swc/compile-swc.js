"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compileSwcWatch = exports.compileSwc = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const devkit_2 = require("@nrwl/devkit");
const create_async_iteratable_1 = require("../create-async-iterable/create-async-iteratable");
const print_diagnostics_1 = require("../typescript/print-diagnostics");
const run_type_check_1 = require("../typescript/run-type-check");
const dir_1 = require("@swc/cli/lib/swc/dir");
const core_1 = require("@swc/core");
const compileDirWithSwc = dir_1.default;
function getTypeCheckOptions(normalizedOptions) {
    const { projectRoot, watch, tsConfig, root, outputPath } = normalizedOptions;
    const typeCheckOptions = {
        mode: 'emitDeclarationOnly',
        tsConfigPath: tsConfig,
        outDir: outputPath,
        workspaceRoot: root,
        rootDir: projectRoot,
    };
    if (watch) {
        typeCheckOptions.incremental = true;
        typeCheckOptions.cacheDir = devkit_2.cacheDir;
    }
    return typeCheckOptions;
}
function compileSwc(context, normalizedOptions, postCompilationCallback) {
    return tslib_1.__awaiter(this, void 0, void 0, function* () {
        devkit_1.logger.log(`Compiling with SWC for ${context.projectName}...`);
        const { sourceDir, outDir, swcrcPath } = normalizedOptions;
        yield compileDirWithSwc({
            cliOptions: {
                outDir,
                copyFiles: false,
                deleteDirOnStart: false,
                filename: undefined,
                filenames: [sourceDir],
                extensions: core_1.DEFAULT_EXTENSIONS,
                includeDotfiles: false,
                outFile: undefined,
                quiet: false,
                sync: false,
                watch: false,
            },
            swcOptions: {
                configFile: swcrcPath,
                swcrc: false,
                // swcCwd only kinda works, dir uses process.cwd() 🤷‍♂️ so just use absolute paths above
            },
        });
        yield postCompilationCallback();
        if (normalizedOptions.skipTypeCheck) {
            return { success: true };
        }
        const { errors, warnings } = yield (0, run_type_check_1.runTypeCheck)(getTypeCheckOptions(normalizedOptions));
        const hasErrors = errors.length > 0;
        const hasWarnings = warnings.length > 0;
        if (hasErrors || hasWarnings) {
            yield (0, print_diagnostics_1.printDiagnostics)(errors, warnings);
        }
        return { success: !hasErrors };
    });
}
exports.compileSwc = compileSwc;
function compileSwcWatch(context, normalizedOptions, postCompilationCallback) {
    return tslib_1.__asyncGenerator(this, arguments, function* compileSwcWatch_1() {
        const getResult = (success) => ({
            success,
            outfile: normalizedOptions.mainOutputPath,
        });
        let typeCheckOptions;
        let initialPostCompile = true;
        return yield tslib_1.__await(yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues((0, create_async_iteratable_1.createAsyncIterable)(({ next, done }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let processOnExit;
            let stdoutOnData;
            let stderrOnData;
            let watcherOnExit;
            throw new Error('not implemented yet');
            // const swcWatcher = exec(getSwcCmd(normalizedOptions, true), {
            //   cwd: 'TODO',
            // });
            // processOnExit = () => {
            //   swcWatcher.kill();
            //   done();
            //   process.off('SIGINT', processOnExit);
            //   process.off('SIGTERM', processOnExit);
            //   process.off('exit', processOnExit);
            // };
            // stdoutOnData = async (data?: string) => {
            //   process.stdout.write(data);
            //   if (!data.startsWith('Watching')) {
            //     const swcStatus = data.includes('Successfully');
            //     if (initialPostCompile) {
            //       await postCompilationCallback();
            //       initialPostCompile = false;
            //     }
            //     if (normalizedOptions.skipTypeCheck) {
            //       next(getResult(swcStatus));
            //       return;
            //     }
            //     if (!typeCheckOptions) {
            //       typeCheckOptions = getTypeCheckOptions(normalizedOptions);
            //     }
            //     const delayed = delay(5000);
            //     next(
            //       getResult(
            //         await Promise.race([
            //           delayed
            //             .start()
            //             .then(() => ({ tscStatus: false, type: 'timeout' })),
            //           runTypeCheck(typeCheckOptions).then(({ errors, warnings }) => {
            //             const hasErrors = errors.length > 0;
            //             if (hasErrors) {
            //               printDiagnostics(errors, warnings);
            //             }
            //             return {
            //               tscStatus: !hasErrors,
            //               type: 'tsc',
            //             };
            //           }),
            //         ]).then(({ type, tscStatus }) => {
            //           if (type === 'tsc') {
            //             delayed.cancel();
            //             return tscStatus && swcStatus;
            //           }
            //           return swcStatus;
            //         })
            //       )
            //     );
            //   }
            // };
            // stderrOnData = (err?: any) => {
            //   process.stderr.write(err);
            //   next(getResult(false));
            // };
            // watcherOnExit = () => {
            //   done();
            //   swcWatcher.off('exit', watcherOnExit);
            // };
            // swcWatcher.stdout.on('data', stdoutOnData);
            // swcWatcher.stderr.on('data', stderrOnData);
            // process.on('SIGINT', processOnExit);
            // process.on('SIGTERM', processOnExit);
            // process.on('exit', processOnExit);
            // swcWatcher.on('exit', watcherOnExit);
        }))))));
    });
}
exports.compileSwcWatch = compileSwcWatch;
// function delay(ms: number): { start: () => Promise<void>; cancel: () => void } {
//   let timerId: ReturnType<typeof setTimeout> = undefined;
//   return {
//     start() {
//       return new Promise<void>((resolve) => {
//         timerId = setTimeout(() => {
//           resolve();
//         }, ms);
//       });
//     },
//     cancel() {
//       if (timerId) {
//         clearTimeout(timerId);
//         timerId = undefined;
//       }
//     },
//   };
// }
//# sourceMappingURL=compile-swc.js.map