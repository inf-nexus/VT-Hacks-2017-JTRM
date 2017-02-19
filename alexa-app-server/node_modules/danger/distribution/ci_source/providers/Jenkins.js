"use strict";
var ci_source_helpers_1 = require("../ci_source_helpers");
var Jenkins = (function () {
    function Jenkins(env) {
        this.env = env;
    }
    Object.defineProperty(Jenkins.prototype, "name", {
        get: function () {
            return "Jenkins";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Jenkins.prototype, "isCI", {
        get: function () {
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, ["JENKINS_URL"]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Jenkins.prototype, "isPR", {
        get: function () {
            var mustHave = ["JENKINS_URL", "ghprbPullId", "ghprbGhRepository"];
            var mustBeInts = ["ghprbPullId"];
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, mustHave) && ci_source_helpers_1.ensureEnvKeysAreInt(this.env, mustBeInts);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Jenkins.prototype, "pullRequestID", {
        get: function () {
            return this.env.ghprbPullId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Jenkins.prototype, "repoSlug", {
        get: function () {
            return this.env.ghprbGhRepository;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Jenkins.prototype, "supportedPlatforms", {
        get: function () {
            return ["github"];
        },
        enumerable: true,
        configurable: true
    });
    return Jenkins;
}());
exports.Jenkins = Jenkins;
//# sourceMappingURL=Jenkins.js.map