const express = require('express');
const fs = require('fs');
const path = require('path');
const serverless = require('serverless-http');
const cloudbase = require("@cloudbase/node-sdk");

// 初始化 CloudBase
const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV  // 使用 CloudBase 动态环境变量
});

const tcbApp = express();

// 配置中间件
tcbApp.use(express.json());
tcbApp.use(express.urlencoded({ extended: true }));

// 设置CORS头
tcbApp.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
  } else {
    next();
  }
});

let attendees = [];

// 加载参会人员信息
async function loadAttendees() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'attendees.json'), 'utf8');
        attendees = JSON.parse(data);
        console.log('Attendees data loaded successfully');
    } catch (error) {
        console.error('Error loading attendees data:', error);
    }
}

loadAttendees();

// 为根路径添加处理程序
tcbApp.get('/', (req, res) => {
    res.send('Welcome to the Seat Query Service!');
});

// 注册POST路径
tcbApp.post('/seatQuery', (req, res) => {
    const name = req.body.name;
    console.log(`Received query for name: ${name}`);

    const attendee = attendees.find(a => a.name === name);
    if (attendee) {
        console.log(`Found attendee: ${JSON.stringify(attendee)}`);
        res.json({
            success: true,
            data: attendee
        });
    } else {
        console.log('Attendee not found');
        res.json({
            success: false,
            message: '未找到参会者信息'
        });
    }
});

exports.main = serverless(tcbApp);
