"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swcExecutor = exports.normalizeOptions = void 0;
const tslib_1 = require("tslib");
const devkit_1 = require("@nrwl/devkit");
const assets_1 = require("@nrwl/workspace/src/utilities/assets");
const buildable_libs_utils_1 = require("@nrwl/workspace/src/utilities/buildable-libs-utils");
const path_1 = require("path");
const check_dependencies_1 = require("../../utils/check-dependencies");
const compiler_helper_dependency_1 = require("../../utils/compiler-helper-dependency");
const copy_assets_handler_1 = require("../../utils/copy-assets-handler");
const compile_swc_1 = require("../../utils/swc/compile-swc");
const get_swcrc_path_1 = require("../../utils/swc/get-swcrc-path");
const update_package_json_1 = require("../../utils/update-package-json");
const watch_for_single_file_changes_1 = require("../../utils/watch-for-single-file-changes");
function normalizeOptions(options, contextRoot, sourceRoot, projectRoot) {
    const outputPath = (0, path_1.join)(contextRoot, options.outputPath);
    if (options.skipTypeCheck == null) {
        options.skipTypeCheck = false;
    }
    if (options.watch == null) {
        options.watch = false;
    }
    const files = (0, assets_1.assetGlobsToFiles)(options.assets, contextRoot, outputPath);
    return Object.assign(Object.assign({}, options), { mainOutputPath: (0, path_1.resolve)(outputPath, options.main.replace(`${projectRoot}/`, '').replace('.ts', '.js')), files, root: contextRoot, sourceRoot,
        projectRoot,
        outputPath, tsConfig: (0, path_1.join)(contextRoot, options.tsConfig), sourceDir: (0, path_1.resolve)(contextRoot, projectRoot), outDir: (0, path_1.resolve)(contextRoot, outputPath), swcrcPath: (0, get_swcrc_path_1.getSwcrcPath)(options, contextRoot, projectRoot) });
}
exports.normalizeOptions = normalizeOptions;
function processAssetsAndPackageJsonOnce(assetHandler, options, context, target, dependencies) {
    return () => tslib_1.__awaiter(this, void 0, void 0, function* () {
        yield assetHandler.processAllAssetsOnce();
        (0, update_package_json_1.updatePackageJson)(options, context, target, dependencies, !options.skipTypeCheck);
    });
}
function swcExecutor(_options, context) {
    return tslib_1.__asyncGenerator(this, arguments, function* swcExecutor_1() {
        const { sourceRoot, root } = context.workspace.projects[context.projectName];
        const options = normalizeOptions(_options, context.root, sourceRoot, root);
        const projectGraph = (0, devkit_1.readCachedProjectGraph)();
        const { target, dependencies, nonBuildableDependencies } = (0, buildable_libs_utils_1.calculateProjectDependencies)(projectGraph, context.root, context.projectName, context.targetName, context.configurationName);
        const projectRoot = target.data.root;
        options.tsConfig = (0, buildable_libs_utils_1.createTmpTsConfig)(options.tsConfig, context.root, projectRoot, dependencies);
        // Type checking requires deps to be built, but transpile-only usually doesn't need to check anything
        if (!options.skipTypeCheck) {
            (0, check_dependencies_1.checkDependencies)(context, options.tsConfig);
        }
        const swcHelperDependency = (0, compiler_helper_dependency_1.getHelperDependency)(compiler_helper_dependency_1.HelperDependency.swc, options.swcrcPath, dependencies);
        if (swcHelperDependency) {
            dependencies.push(swcHelperDependency);
        }
        const assetHandler = new copy_assets_handler_1.CopyAssetsHandler({
            projectDir: projectRoot,
            rootDir: context.root,
            outputDir: options.outputPath,
            assets: options.assets,
        });
        if (options.watch) {
            const disposeWatchAssetChanges = yield tslib_1.__await(assetHandler.watchAndProcessOnAssetChange());
            const disposePackageJsonChanges = yield tslib_1.__await((0, watch_for_single_file_changes_1.watchForSingleFileChanges)((0, path_1.join)(context.root, projectRoot), 'package.json', () => (0, update_package_json_1.updatePackageJson)(options, context, target, dependencies, !options.skipTypeCheck)));
            process.on('exit', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield disposeWatchAssetChanges();
                yield disposePackageJsonChanges();
            }));
            process.on('SIGTERM', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield disposeWatchAssetChanges();
                yield disposePackageJsonChanges();
            }));
            return yield tslib_1.__await(yield tslib_1.__await(yield* tslib_1.__asyncDelegator(tslib_1.__asyncValues((0, compile_swc_1.compileSwcWatch)(context, options, processAssetsAndPackageJsonOnce(assetHandler, options, context, target, dependencies))))));
        }
        else {
            return yield tslib_1.__await(yield yield tslib_1.__await((0, compile_swc_1.compileSwc)(context, options, processAssetsAndPackageJsonOnce(assetHandler, options, context, target, dependencies))));
        }
    });
}
exports.swcExecutor = swcExecutor;
exports.default = swcExecutor;
//# sourceMappingURL=swc.impl.js.map