"use strict";
var fetch = require("node-fetch");
var debug = require("debug");
var d = debug("danger:networking");
/**
 * Adds logging to every fetch request if a global var for `verbose` is set to true
 *
 * @param {(string | fetch.Request)} url the request
 * @param {fetch.RequestInit} [init] the usual options
 * @returns {Promise<fetch.Response>} network-y promise
 */
function api(url, init) {
    if (global.verbose && global.verbose === true) {
        var output = ["curl", "-i"];
        if (init.method) {
            output.push("-X " + init.method);
        }
        var showToken = process.env["DANGER_VERBOSE_SHOW_TOKEN"];
        var token = process.env["DANGER_GITHUB_API_TOKEN"];
        if (init.headers) {
            for (var prop in init.headers) {
                if (init.headers.hasOwnProperty(prop)) {
                    // Don't show the token for normal verbose usage
                    if (init.headers[prop].includes(token) && !showToken) {
                        output.push("-H", "\"" + prop + ": [API TOKEN]\"");
                        continue;
                    }
                    output.push("-H", "\"" + prop + ": " + init.headers[prop] + "\"");
                }
            }
        }
        if (init.method === "POST") {
        }
        if (typeof url === "string") {
            output.push(url);
        }
        d(output.join(" "));
    }
    return fetch(url, init)
        .then(function (response) {
        // Handle failing errors
        if (!response.ok) {
            process.exitCode = 1;
            console.error("Request failed: " + JSON.stringify(response, null, 2));
            var msg = response.status === 0 ? "Network Error" : response.statusText;
            throw new Error(response.status, msg, { response: response });
        }
        return response;
    });
}
exports.api = api;
//# sourceMappingURL=fetch.js.map