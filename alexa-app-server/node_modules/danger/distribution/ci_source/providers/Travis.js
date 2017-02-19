"use strict";
var ci_source_helpers_1 = require("../ci_source_helpers");
var Travis = (function () {
    function Travis(env) {
        this.env = env;
    }
    Object.defineProperty(Travis.prototype, "name", {
        get: function () { return "Travis CI"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Travis.prototype, "isCI", {
        get: function () {
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, ["HAS_JOSH_K_SEAL_OF_APPROVAL"]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Travis.prototype, "isPR", {
        get: function () {
            var mustHave = ["HAS_JOSH_K_SEAL_OF_APPROVAL", "TRAVIS_PULL_REQUEST", "TRAVIS_REPO_SLUG"];
            var mustBeInts = ["TRAVIS_PULL_REQUEST"];
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, mustHave) && ci_source_helpers_1.ensureEnvKeysAreInt(this.env, mustBeInts);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Travis.prototype, "pullRequestID", {
        get: function () { return this.env.TRAVIS_PULL_REQUEST; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Travis.prototype, "repoSlug", {
        get: function () { return this.env.TRAVIS_REPO_SLUG; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Travis.prototype, "supportedPlatforms", {
        get: function () { return ["github"]; },
        enumerable: true,
        configurable: true
    });
    return Travis;
}());
exports.Travis = Travis;
//# sourceMappingURL=Travis.js.map