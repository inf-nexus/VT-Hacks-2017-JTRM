"use strict";
var ci_source_helpers_1 = require("../ci_source_helpers");
var Circle = (function () {
    function Circle(env) {
        this.env = env;
    }
    Object.defineProperty(Circle.prototype, "name", {
        get: function () { return "Circle CI"; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "isCI", {
        get: function () {
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, ["CIRCLE_BUILD_NUM"]);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "isPR", {
        get: function () {
            if (ci_source_helpers_1.ensureEnvKeysExist(this.env, ["CI_PULL_REQUEST"])) {
                return true;
            }
            var mustHave = ["CIRCLE_CI_API_TOKEN", "CIRCLE_PROJECT_USERNAME", "CIRCLE_PROJECT_REPONAME", "CIRCLE_BUILD_NUM"];
            return ci_source_helpers_1.ensureEnvKeysExist(this.env, mustHave) && ci_source_helpers_1.ensureEnvKeysAreInt(this.env, ["CIRCLE_PR_NUMBER"]);
        },
        enumerable: true,
        configurable: true
    });
    Circle.prototype._prParseURL = function () {
        var prUrl = this.env.CI_PULL_REQUEST || "";
        var splitSlug = prUrl.split("/");
        if (splitSlug.length === 7) {
            var owner = splitSlug[3];
            var reponame = splitSlug[4];
            var id = splitSlug[6];
            return { owner: owner, reponame: reponame, id: id };
        }
        ;
        return {};
    };
    Object.defineProperty(Circle.prototype, "pullRequestID", {
        get: function () {
            if (this.env.CIRCLE_PR_NUMBER) {
                return this.env.CIRCLE_PR_NUMBER;
            }
            else {
                var id = this._prParseURL().id;
                return id || "";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "repoSlug", {
        get: function () {
            var _a = this._prParseURL(), owner = _a.owner, reponame = _a.reponame;
            return (owner && reponame) ? owner + "/" + reponame : "";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "repoURL", {
        get: function () { return this.env.CIRCLE_REPOSITORY_URL; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Circle.prototype, "supportedPlatforms", {
        get: function () { return ["github"]; },
        enumerable: true,
        configurable: true
    });
    return Circle;
}());
exports.Circle = Circle;
//# sourceMappingURL=Circle.js.map