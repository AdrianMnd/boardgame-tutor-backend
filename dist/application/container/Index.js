"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
require("dotenv/config");
const ApplicationContainer_1 = require("./ApplicationContainer");
exports.container = new ApplicationContainer_1.ApplicationContainer();
