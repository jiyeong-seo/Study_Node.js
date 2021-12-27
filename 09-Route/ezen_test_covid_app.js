// ezen/Study_Node/09-Route 폴더 안에 있다는 가정 하에 작동가능.

// ezen/Study_Node/09-Route/route 폴더 안에 있다는 가정 하에 작동가능.

/*----------------------------------------------------------
 | 1) 모듈참조
 -----------------------------------------------------------*/
// 직접 구현한 모듈
const config = require("../helper/_config");
const logger = require("../helper/LogHelper");
const util = require("../helper/UtilHelper");
const fileHelper = require("../helper/FileHelper");
// 내장 모듈
const url = require("url");
const path = require("path");
// 설치가 필요한 모듈
const express = require("express"); // express 본체
const useragent = require("express-useragent"); // 클라이언트의 정보를 조회할 수  있는 기능

/*----------------------------------------------------------
 | 2) Express 객체 생성
 -----------------------------------------------------------*/
// 여기서 생성한 app 객체의 use() 함수를 사용해서
// 각종 외부 기능, 설정 내용, URL을 계쏙해서 확장하는 형태로 구현이 진행된다.
const app = express();

/*----------------------------------------------------------
 | 3) 클라이언트의 접속시 초기화 -> 접속한 클라이언트의 정보 파악
 -----------------------------------------------------------*/
/** app 객체에 UserAgent 모듈을 탑재 */
// -> Express객체(app)에 추가되는 확장 기능들을 Express에서는 미들웨어라고 부른다.
// -> 초기화 콜백함수에 전달되는 req, res객체를 확장하기 때문에 다른 모듈들보다 먼저 설정되어야 한다.
app.use(useragent.express());

// 초기화 - 클라이언트의 접속을 감지
app.use((req, res, next) => {
  logger.debug("클라이언트가 접속했습니다.");

  // 클라이언트가 접속한 시간
  const beginTime = Date.now();

  // 클라이언트의 IP주소
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  // 클라이언트의 디바이스 정보 기록 (UserAgent 사용)
  logger.debug(
    "[client]" +
      ip +
      "/" +
      req.useragent.os +
      "/" +
      req.useragent.browser +
      "(" +
      req.useragent.version +
      ") / " +
      req.useragent.platform
  );

  // 클라이언트가 요청한 페이지 URL
  // 콜백함수에 전달되는 req 파라미터는(객체는) 클라이언트가 요청한 URL의 각 부분을 변수로 담고 있다.
  // url.format()의 인자로 입력한 객체의 프로퍼티들을 하나의 url로 리턴
  const curretn_url = url.format({
    protocol: req.protocol, // ex) http://
    host: req.get("host"), // ex) 172.16.141.1
    port: req.port, // ex) 3000
    pathname: req.originalUrl, // ex) /page1.html
  });

  logger.debug("[" + req.method + "]" + decodeURIComponent(curretn_url));

  // 클라이언트의 접속이 종료된 경우의 이벤트
  res.on("finish", () => {
    // 접속 종료시간
    const endTime = Date.now();

    // 이번 접속에서 클라이언트가 머문 시간 = 백엔드가 실행하는데 걸린 시간
    const time = endTime - beginTime;
    logger.debug(
      "클라이언트의 접속이 종료되었습니다. ::: [runtime] " + time + "ms"
    );
    logger.debug("--------------------------------------------------------");
  });

  // 이 콜백함수를 종료하고 요청 URL에 연결된 기능으로 제어를 넘김
  next();
});

/*----------------------------------------------------------
 | 4) Express 객체의 추가 설정
 -----------------------------------------------------------*/
/** 라우터(URL 분배기) 객체 설정  -> 맨 마지막에 설정 */
const router = express.Router();
// 라우터를 express에 등록
app.use("/", router);

/*----------------------------------------------------------
 | 5) URL 모듈화
 -----------------------------------------------------------*/
app.use(require("./route/ezen_test_covid")(app));
/*----------------------------------------------------------
 | 6) 설정한 내용을 기반으로 서버 구동 시작
 -----------------------------------------------------------*/
// 백엔드를 가동하고 3000번 포트에서 대기

const ip = util.myip();

app.listen(config.server_port, () => {
  logger.debug(
    "----------------------------------------------------------------"
  );
  logger.debug(
    "|                       start express server                   |"
  );
  logger.debug(
    "----------------------------------------------------------------"
  );

  ip.forEach((v, i) => {
    logger.debug("server address => http://" + v + ":" + config.server_port);
  });

  logger.debug(
    "----------------------------------------------------------------"
  );
});
