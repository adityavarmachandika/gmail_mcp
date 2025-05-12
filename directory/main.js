"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const open_1 = __importDefault(require("open"));
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
//required credentials for the oauth login
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const client = new googleapis_1.google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
const authenticate = () => __awaiter(void 0, void 0, void 0, function* () {
    //check if the user is already loged in recently
    if (fs_1.default.existsSync('tokens.json')) {
        client.setCredentials(JSON.parse(fs_1.default.readFileSync('tokens.json').toString()));
    }
    else {
        const authurl = client.generateAuthUrl({ access_type: 'offline', scope: SCOPES });
        yield (0, open_1.default)(authurl);
    }
});
app.get('/auth', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield authenticate();
        res.json({ "auth": "successfull" });
    }
    catch (error) {
        console.log(error);
        res.send("there is an error");
    }
}));
app.get('/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const { tokens } = yield client.getToken(code);
        fs_1.default.writeFileSync('tokens.json', JSON.stringify(tokens));
        client.setCredentials(tokens);
        console.log("all successfull");
    }
    catch (error) {
        console.log(error);
    }
}));
app.listen('3999', () => {
    console.log(`it is running on 3999 port`);
});
