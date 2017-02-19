"use strict";
var ci_source_helpers_1 = require("../ci_source_helpers");
var Surf = (function () {
    function Surf(env) {
        this.env = env;
    }
    Object.defineProperty(Surf.prototype, "name", {
        get: function () {
            return "surf-build";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Surf.prototype, "isCI", {
        get: function () {
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, ["SURF_REPO", "SURF_NWO"]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Surf.prototype, "isPR", {
        get: function () {
            return this.isCI;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Surf.prototype, "pullRequestID", {
        get: function () {
            var key = "SURF_PR_NUM";
            return ci_source_helpers_1.ensureEnvKeysAreInt(this.env, [key]) ? this.env[key] : "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Surf.prototype, "repoSlug", {
        get: function () {
            return this.env["SURF_NWO"];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Surf.prototype, "supportedPlatforms", {
        get: function () {
            return ["github"];
        },
        enumerable: true,
        configurable: true
    });
    return Surf;
}());
exports.Surf = Surf;
//# sourceMappingURL=Surf.js.map