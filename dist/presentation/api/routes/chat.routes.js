"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Index_1 = require("../../../application/container/Index");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
const controller = new chat_controller_1.ChatController(Index_1.container.askQuestionUseCase);
router.post("/", controller.ask);
exports.default = router;
