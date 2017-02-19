"use strict";
var GitHub_1 = require("./GitHub");
var GitHubAPI_1 = require("./github/GitHubAPI");
//     /** Download all the comments in a PR */
//     async downloadComments: (id: string) => Promise<Comment[]>;
//     /** Create a comment on a PR */
//     async  createComment: (body: string) => Promise<?Comment>;
//     /** Delete comments on a PR */
//     async deleteComment: (env: any) => Promise<booleanean>;
//     /** Edit an existing comment */
//     async editComment: (comment: Comment, newBody: string) => Promise<booleanean>;
/**
 * Pulls out a platform for Danger to communicate on based on the environment
 * @param {Env} env The environment.
 * @param {CISource} source The existing source, to ensure they can run against each other
 * @returns {Platform} returns a platform if it can be supported
 */
function getPlatformForEnv(env, source) {
    var token = env["DANGER_GITHUB_API_TOKEN"];
    if (!token) {
        console.error("The DANGER_GITHUB_API_TOKEN environmental variable is missing");
        console.error("Without an api token, danger will be unable to comment on a PR");
        throw new Error("Cannot use authenticated API requests.");
    }
    var api = new GitHubAPI_1.GitHubAPI(token, source);
    var github = new GitHub_1.GitHub(api);
    return github;
}
exports.getPlatformForEnv = getPlatformForEnv;
//# sourceMappingURL=platform.js.map