"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHelperDependenciesFromProjectGraph = exports.getHelperDependency = exports.HelperDependency = void 0;
const devkit_1 = require("@nrwl/devkit");
const typescript_1 = require("@nrwl/workspace/src/utilities/typescript");
const path_1 = require("path");
const get_swcrc_path_1 = require("./swc/get-swcrc-path");
var HelperDependency;
(function (HelperDependency) {
    HelperDependency["tsc"] = "npm:tslib";
    HelperDependency["swc"] = "npm:@swc/helpers";
})(HelperDependency = exports.HelperDependency || (exports.HelperDependency = {}));
const jsExecutors = {
    '@nrwl/js:tsc': {
        helperDependency: HelperDependency.tsc,
        getConfigPath: (options, contextRoot, _) => (0, path_1.join)(contextRoot, options.tsConfig),
    },
    '@nrwl/js:swc': {
        helperDependency: HelperDependency.swc,
        getConfigPath: (options, contextRoot, projectRoot) => (0, get_swcrc_path_1.getSwcrcPath)(options, contextRoot, projectRoot),
    },
};
/**
 * Check and return a DependencyNode for the compiler's external helpers npm package. Return "null"
 * if it doesn't need it or it cannot be found in the Project Graph
 *
 * @param {HelperDependency} helperDependency
 * @param {string} configPath
 * @param {DependentBuildableProjectNode[]} dependencies
 * @param {boolean=false} returnDependencyIfFound
 */
function getHelperDependency(helperDependency, configPath, dependencies, returnDependencyIfFound = false) {
    const dependency = dependencies.find((dep) => dep.name === helperDependency);
    if (!!dependency) {
        // if a helperDependency is found, we either return null or the found dependency
        // We return the found return dependency for the cases where it is a part of a
        // project's dependency's dependency instead
        // eg: app-a -> lib-a (helperDependency is on lib-a instead of app-a)
        // When building app-a, we'd want to know about the found helper dependency still
        return returnDependencyIfFound ? dependency : null;
    }
    let isHelperNeeded = false;
    switch (helperDependency) {
        case HelperDependency.tsc:
            isHelperNeeded = !!(0, typescript_1.readTsConfig)(configPath).options['importHelpers'];
            break;
        case HelperDependency.swc:
            isHelperNeeded = !!(0, devkit_1.readJsonFile)(configPath)['jsc']['externalHelpers'];
            break;
    }
    if (!isHelperNeeded)
        return null;
    const projectGraph = (0, devkit_1.readCachedProjectGraph)();
    const libNode = projectGraph.externalNodes[helperDependency];
    if (!libNode) {
        devkit_1.logger.warn(`Your library compilation option specifies that the compiler external helper (${helperDependency.split(':')[1]}) is needed but it is not installed.`);
        return null;
    }
    return {
        name: helperDependency,
        outputs: [],
        node: libNode,
    };
}
exports.getHelperDependency = getHelperDependency;
function getHelperDependenciesFromProjectGraph(contextRoot, sourceProject) {
    const projectGraph = (0, devkit_1.readCachedProjectGraph)();
    // if the source project isn't part of the projectGraph nodes; skip
    if (!projectGraph.nodes[sourceProject])
        return [];
    // if the source project does not have any dependencies; skip
    if (!projectGraph.dependencies[sourceProject] ||
        !projectGraph.dependencies[sourceProject].length)
        return [];
    const sourceDependencies = projectGraph.dependencies[sourceProject];
    const internalDependencies = sourceDependencies.reduce((result, dependency) => {
        // we check if a dependency is part of the workspace and if it's a library
        // because we wouldn't want to include external dependencies (npm packages)
        if (!dependency.target.startsWith('npm:') &&
            !!projectGraph.nodes[dependency.target] &&
            projectGraph.nodes[dependency.target].type === 'lib') {
            const targetData = projectGraph.nodes[dependency.target].data;
            // check if the dependency has a buildable target with one of the jsExecutors
            const targetExecutor = Object.values(targetData.targets).find(({ executor }) => !!jsExecutors[executor]);
            if (targetExecutor) {
                const jsExecutor = jsExecutors[targetExecutor['executor']];
                const { root: projectRoot } = targetData;
                const configPath = jsExecutor.getConfigPath(targetExecutor['options'], contextRoot, projectRoot);
                // construct the correct helperDependency configurations
                // so we can compute the ProjectGraphDependency later
                result.push({
                    helperDependency: jsExecutors[targetExecutor['executor']].helperDependency,
                    dependencies: projectGraph.dependencies[dependency.target],
                    configPath,
                });
            }
        }
        return result;
    }, []);
    return internalDependencies.reduce((result, { helperDependency, configPath, dependencies }) => {
        const dependency = getHelperDependency(helperDependency, configPath, dependencies, true);
        if (dependency) {
            result.push({
                type: 'static',
                source: sourceProject,
                target: dependency.name,
            });
        }
        return result;
    }, []);
}
exports.getHelperDependenciesFromProjectGraph = getHelperDependenciesFromProjectGraph;
//# sourceMappingURL=compiler-helper-dependency.js.map