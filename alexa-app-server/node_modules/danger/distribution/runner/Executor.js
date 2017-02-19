"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var Dangerfile_1 = require("../runner/Dangerfile");
var DangerDSL_1 = require("../dsl/DangerDSL");
var githubIssueTemplate_1 = require("./templates/githubIssueTemplate");
var DangerfileRunner_1 = require("./DangerfileRunner");
var debug = require("debug");
// This is still badly named, maybe it really should just be runner?
var Executor = (function () {
    function Executor(ciSource, platform) {
        this.ciSource = ciSource;
        this.platform = platform;
        this.d = debug("danger:executor");
    }
    /** Mainly just a dumb helper because I can't do
     * async functions in danger-run.js
     * @param {string} file the path to run Danger from
     * @returns {void} It's a promise, so a void promise
     */
    Executor.prototype.setupAndRunDanger = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var runtimeEnv;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setupDanger()];
                    case 1:
                        runtimeEnv = _a.sent();
                        return [4 /*yield*/, this.runDanger(file, runtimeEnv)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *  Runs all of the operations for a running just Danger
     * @returns {DangerfileRuntimeEnv} A runtime environment to run Danger in
     */
    Executor.prototype.setupDanger = function () {
        return __awaiter(this, void 0, void 0, function () {
            var dsl, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.dslForDanger()];
                    case 1:
                        dsl = _a.sent();
                        context = Dangerfile_1.contextForDanger(dsl);
                        return [4 /*yield*/, DangerfileRunner_1.createDangerfileRuntimeEnvironment(context)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     *  Runs all of the operations for a running just Danger
     * @param {string} file the filepath to the Dangerfile
     * @returns {void} It's a promise, so a void promise
     */
    Executor.prototype.runDanger = function (file, runtime) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, DangerfileRunner_1.runDangerfileEnvironment(file, runtime)];
                    case 1:
                        results = _a.sent();
                        return [4 /*yield*/, this.handleResults(results)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets up all the related objects for running the Dangerfile
     * @returns {void} It's a promise, so a void promise
     */
    Executor.prototype.dslForDanger = function () {
        return __awaiter(this, void 0, void 0, function () {
            var git, platformDSL;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.platform.getReviewDiff()];
                    case 1:
                        git = _a.sent();
                        return [4 /*yield*/, this.platform.getPlatformDSLRepresentation()];
                    case 2:
                        platformDSL = _a.sent();
                        return [2 /*return*/, new DangerDSL_1.DangerDSL(platformDSL, git)];
                }
            });
        });
    };
    /**
     * Handle the messaing aspects of running a Dangerfile
     * @param {DangerResults} results a JSON representation of the end-state for a Danger run
     * @returns {void} It's a promise, so a void promise
     */
    Executor.prototype.handleResults = function (results) {
        return __awaiter(this, void 0, void 0, function () {
            var fails, warnings, messages, markdowns, failureCount, messageCount, comment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Ensure process fails if there are fails
                        if (results.fails.length) {
                            process.exitCode = 1;
                        }
                        fails = results.fails, warnings = results.warnings, messages = results.messages, markdowns = results.markdowns;
                        failureCount = fails.concat(warnings).length;
                        messageCount = messages.concat(markdowns).length;
                        this.d(results);
                        if (!(failureCount + messageCount === 0))
                            return [3 /*break*/, 2];
                        console.log("No messages are collected.");
                        return [4 /*yield*/, this.platform.deleteMainComment()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (failureCount > 0) {
                            console.log("Found some validation failure");
                        }
                        else if (messageCount > 0) {
                            console.log("Found some message, writing it down");
                        }
                        comment = githubIssueTemplate_1.template(results);
                        return [4 /*yield*/, this.platform.updateOrCreateComment(comment)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return Executor;
}());
exports.Executor = Executor;
//# sourceMappingURL=Executor.js.map