"use strict";
var ci_source_helpers_1 = require("../ci_source_helpers");
var Semaphore = (function () {
    function Semaphore(env) {
        this.env = env;
    }
    Object.defineProperty(Semaphore.prototype, "name", {
        get: function () { return "Travis CI"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Semaphore.prototype, "isCI", {
        get: function () {
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, ["SEMAPHORE"]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Semaphore.prototype, "isPR", {
        get: function () {
            var mustHave = ["SEMAPHORE_REPO_SLUG"];
            var mustBeInts = ["PULL_REQUEST_NUMBER"];
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, mustHave) && ci_source_helpers_1.ensureEnvKeysAreInt(this.env, mustBeInts);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Semaphore.prototype, "pullRequestID", {
        get: function () { return this.env.PULL_REQUEST_NUMBER; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Semaphore.prototype, "repoSlug", {
        get: function () { return this.env.SEMAPHORE_REPO_SLUG; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Semaphore.prototype, "supportedPlatforms", {
        get: function () { return ["github"]; },
        enumerable: true,
        configurable: true
    });
    return Semaphore;
}());
exports.Semaphore = Semaphore;
//# sourceMappingURL=Semaphore.js.map