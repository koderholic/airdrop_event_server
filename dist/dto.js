"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppResponse = void 0;
class AppResponse {
    status;
    message;
    data;
    constructor(message, data) {
        this.status = "success";
        this.message = message;
        this.data = data;
    }
}
exports.AppResponse = AppResponse;
//# sourceMappingURL=dto.js.map