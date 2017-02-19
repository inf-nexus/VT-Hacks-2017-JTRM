"use strict";
/* END FLOWTYPE EXPORT */
var DangerDSL = (function () {
    function DangerDSL(platformDSL, git) {
        this.git = git;
        // As GitLab etc support is added this will need to be changed
        this.github = platformDSL;
    }
    return DangerDSL;
}());
exports.DangerDSL = DangerDSL;
//# sourceMappingURL=DangerDSL.js.map