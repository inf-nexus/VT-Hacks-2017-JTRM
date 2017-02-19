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
var parseDiff = require("parse-diff");
var includes = require("lodash.includes");
var find = require("lodash.find");
var os = require("os");
/** Handles conforming to the Platform Interface for GitHub, API work is handle by GitHubAPI */
var GitHub = (function () {
    function GitHub(api) {
        this.api = api;
        this.name = "GitHub";
    }
    /**
     * Get the Code Review description metadata
     *
     * @returns {Promise<any>} JSON representation
     */
    GitHub.prototype.getReviewInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            var deets;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.getPullRequestInfo()];
                    case 1:
                        deets = _a.sent();
                        return [4 /*yield*/, deets.json()];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get the Code Review diff representation
     *
     * @returns {Promise<GitDSL>} the git DSL
     */
    GitHub.prototype.getReviewDiff = function () {
        return __awaiter(this, void 0, void 0, function () {
            var diffReq, getCommitsResponse, getCommits, diff, fileDiffs, addedDiffs, removedDiffs, modifiedDiffs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.getPullRequestDiff()];
                    case 1:
                        diffReq = _a.sent();
                        return [4 /*yield*/, this.api.getPullRequestCommits()];
                    case 2:
                        getCommitsResponse = _a.sent();
                        return [4 /*yield*/, getCommitsResponse.json()];
                    case 3:
                        getCommits = _a.sent();
                        return [4 /*yield*/, diffReq.text()];
                    case 4:
                        diff = _a.sent();
                        fileDiffs = parseDiff(diff);
                        addedDiffs = fileDiffs.filter(function (diff) { return diff["new"]; });
                        removedDiffs = fileDiffs.filter(function (diff) { return diff["deleted"]; });
                        modifiedDiffs = fileDiffs.filter(function (diff) { return !includes(addedDiffs, diff) && !includes(removedDiffs, diff); });
                        return [2 /*return*/, {
                                modified_files: modifiedDiffs.map(function (d) { return d.to; }),
                                created_files: addedDiffs.map(function (d) { return d.to; }),
                                deleted_files: removedDiffs.map(function (d) { return d.from; }),
                                diffForFile: function (name) {
                                    var diff = find(fileDiffs, function (diff) { return diff.from === name || diff.to === name; });
                                    if (!diff) {
                                        return null;
                                    }
                                    var changes = diff.chunks.map(function (c) { return c.changes; })
                                        .reduce(function (a, b) { return a.concat(b); }, []);
                                    var lines = changes.map(function (c) { return c.content; });
                                    return lines.join(os.EOL);
                                },
                                commits: getCommits.map(this.githubCommitToGitCommit)
                            }];
                }
            });
        });
    };
    /**
     * Returns the `github` object on the Danger DSL
     *
     * @returns {Promise<GitHubDSL>} JSON response of the DSL
     */
    GitHub.prototype.getPlatformDSLRepresentation = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pr, commits;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getReviewInfo()];
                    case 1:
                        pr = _a.sent();
                        return [4 /*yield*/, this.api.getPullRequestCommits()];
                    case 2:
                        commits = _a.sent();
                        return [2 /*return*/, {
                                pr: pr,
                                commits: commits
                            }];
                }
            });
        });
    };
    /**
     * Returns the response for the new comment
     *
     * @param {GitHubCommit} ghCommit A GitHub based commit
     * @returns {GitCommit} a Git commit representation without GH metadata
     */
    GitHub.prototype.githubCommitToGitCommit = function (ghCommit) {
        return {
            sha: ghCommit.sha,
            parents: ghCommit.parents.map(function (p) { return p.sha; }),
            author: ghCommit.commit.author,
            committer: ghCommit.commit.committer,
            message: ghCommit.commit.message,
            tree: ghCommit.commit.tree
        };
    };
    /**
     * Returns the response for the new comment
     *
     * @param {string} comment you want to post
     * @returns {Promise<any>} JSON response of new comment
     */
    GitHub.prototype.createComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.api.postPRComment(comment)];
            });
        });
    };
    // In Danger RB we support a danger_id property,
    // this should be handled at some point
    /**
     * Deletes the main Danger comment, used when you have
     * fixed all your failures.
     *
     * @returns {Promise<boolean>} did it work?
     */
    GitHub.prototype.deleteMainComment = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commentID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.getDangerCommentID()];
                    case 1:
                        commentID = _a.sent();
                        if (!commentID)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.api.deleteCommentWithID(commentID)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, commentID !== null];
                }
            });
        });
    };
    /**
     * Either updates an existing comment, or makes a new one
     *
     * @param {string} newComment string value of comment
     * @returns {Promise<boolean>} success of posting comment
     */
    GitHub.prototype.updateOrCreateComment = function (newComment) {
        return __awaiter(this, void 0, void 0, function () {
            var commentID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.getDangerCommentID()];
                    case 1:
                        commentID = _a.sent();
                        if (!commentID)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.api.updateCommentWithID(commentID, newComment)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.createComment(newComment)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Updates the main Danger comment, when Danger has run
     * more than once
     *
     * @param {string} comment updated text
     *
     * @returns {Promise<boolean>} did it work?
     */
    GitHub.prototype.editMainComment = function (comment) {
        return __awaiter(this, void 0, void 0, function () {
            var commentID;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.api.getDangerCommentID()];
                    case 1:
                        commentID = _a.sent();
                        if (!commentID)
                            return [3 /*break*/, 3];
                        return [4 /*yield*/, this.api.updateCommentWithID(commentID, comment)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, commentID !== null];
                }
            });
        });
    };
    return GitHub;
}());
exports.GitHub = GitHub;
//# sourceMappingURL=GitHub.js.map