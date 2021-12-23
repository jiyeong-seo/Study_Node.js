/*----------------------------------------------------------
 | 1) 모듈참조
 -----------------------------------------------------------*/
// 직접 구현한 모듈
const logger = require("../helper/LogHelper");
const util = require("../helper/UtilHelper");
const fileHelper = require("../helper/FileHelper");
// 내장 모듈
const url = require("url");
const path = require("path");
// 설치가 필요한 모듈
const express = require("express"); // express 본체
const useragent = require("express-useragent"); // 클라이언트의 정보를 조회할 수  있는 기능
const static = require("serve-static"); // 특정 폴더의 파일을 url로 노출시킴
const favicon = require("serve-favicon"); // favicon 처리
const bodyParser = require("body-parser"); // POST 파라미터 처리
const methodOverride = require("method-override"); // PUT 파라미터 처리
const cookieParser = require("cookie-parser"); // Cookie 처리
const expressSession = require("express-session"); // Session 처리
const multer = require("multer"); // 업로드 모듈
const nodemailer = require("nodemailer"); // 메일 발송 -> app.use()로 추가 설정 필요 없음.
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
/** POST 파라미터 수신 모듈 설정 */
// 추가 모듈들 중 UserAgent를 제외하고 가장 먼저 설정해야 함
// body-parser를 이용해 application/x-www-form-urlencoded 파싱
// extended: true -> 지속적 사용.
// extended: false -> 한번만 사용.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text()); // TEXT형식의 파라미터 수신 가능.
app.use(bodyParser.json()); // JSON형식의 파라미터 수신 가능.

/** HTTP, PUT, DELETE 전송 방식 확장 */
// 브라우저 개발사들이 PUT, DELETE 방식으로 전송하는 HTTP Header 이름
app.use(methodOverride("X-HTTP-Method")); // Microsoft
app.use(methodOverride("X-HTTP-Method-Override")); // Google/GData
app.use(methodOverride("X-Method-Override")); // IBM
// HTML폼에서 PUT, DELETE로 전송할 경우 POST방식을 사용하되, action 주소에 "?_method" 라고 추가.
app.use(methodOverride("_method")); // HTML form

/** 쿠키를 처리할 수 있는 객체 연결 */
// cookie-parser는 데이터를 저장, 조회 할 때 암호화 처리를 동반한다.
// 이 때 암호화에 사용되는 key문자열을 개발자가 정해야 한다.
const cookie_encrypt_key = "helloworld";
app.use(cookieParser(cookie_encrypt_key));

/** 세션 설정 */
app.use(
  expressSession({
    // 암호화 키
    secret: cookie_encrypt_key,
    // 세션을 쿠키 상태로 클라이언트에게 노출시킬지 여부
    resave: false,
    // 세션이 저장되기 전에 기존의 세션을 초기화 상태로 만들지 여부
    saveUninitialized: false,
  })
);

/** HTML,CSS,IMG,JS 등의 정적 파일을 URL에 노출시킬 폴더 연결 */
// 'http://아이피:포트번호' 이후의 경로가 router에 등록되지 않은 경로라면
// static 모듈에 연결된 폴더 안에서 해당 경로를 탐색한다.
const public_path = path.join(__dirname, "../public");
const upload_path = path.join(__dirname, "../_files/upload");
app.use("/", static(public_path));
// -> upload 폴더의 웹 상의 위치 : http://아이피:포트번호/upload
app.use("/upload/", static(upload_path));

/** favicon 설정 */
app.use(favicon(public_path + "/favicon.png"));

/** 라우터(URL 분배기) 객체 설정  -> 맨 마지막에 설정 */
const router = express.Router();
// 라우터를 express에 등록
app.use("/", router);

/** multer 객체 생성 -> 파일 제한 : 5개, 20M */
const multipart = multer({
  storage: multer.diskStorage({
    /** 업로드 된 파일이 저장될 디렉토리 설정 */
    // req는 요청 정보, file은 최종적으로 업로드 된 결과 데이터가 저장되어 있을 객체
    destination: (req, file, callback) => {
      // 폴더 생성
      fileHelper.mkdirs(upload_path);
      console.debug(file);

      // 업로드 정보에 백엔드의 업로드 파일 저장 폴더 위치를 추가한다
      file.dir = upload_path.replace(/\\/gi, "/");

      // multer 객체에게 업로드 경로를 전달
      callback(null, upload_path);
    },
    /** 업로드 된 파일이 저장될 파일명 설정 */
    // file.originalname 변수에 파일 이름이 저장되어 있다. -> ex) helloworld.png
    filename: (req, file, callback) => {
      // 파일의 확장자만 추출 -> .png
      const extName = path.extname(file.originalname);
      // 파일이 저장될 이름 (현재 시각)
      const saveName = new Date().getTime().toString() + extName.toLowerCase();
      // 업로드 정보에 백엔드의 업로드 파일 이름을 추가한다.
      file.saveName = saveName;
      // 업로드 정보에 파일에 접근할 수 있는 URL값 추가
      file.url = path.join("/upload", saveName).replace(/\//gi, "/");
      // 구성된 정보를 req 객체에게 추가
      if (req.file instanceof Array) {
        req.file.push(file);
      } else {
        req.file = file;
      }

      callback(null, saveName);
    },
  }),
  /** 요량, 최대 업로드 파일 수 제한 설정 */
  limits: {
    files: 5,
    fileSize: 1024 * 1024 * 20,
  },
  /** 업로드 될 파일의 확장자 제한 */
  fileFilter: (req, file, callback) => {
    // 파일의 종류 얻기
    var mimetype = file.mimetype;

    // 파일의 종류 문자열에 'image/'가 포함되어 있지 않은 경우
    if (mimetype.indexOf("image/") == -1) {
      const error = new Error();
      error.result_code = 500;
      error.result_msg = "이미지 파일만 업로드 가능합니다.";
      return callback(error);
    }

    callback(null, true);
  },
});

/*----------------------------------------------------------
 | 5) 각 URL별 백엔드 기능 정의
 -----------------------------------------------------------*/
/** 01 - 기본설정 */
// router.route('url경로').get|post|put|delete((req, res, next) => {});
router.route("/page1").get((req, res, next) => {
  /** 방법(1) - router 기능을 사용 (권장) */
  // 브라우저에게 전달할 응답 내용
  let html = "<h1>Page1</h1>";
  html += "<h2>Express로 구현한 Node.js 백엔드 페이지</h2>";

  // 브라우저에게 전달할 결과 코드
  res.status(200);
  res.send(html);
});

router.route("/page2").get((req, res, next) => {
  /** 방법(2) - express 기능을 사용 */
  // 브라우저에게 전달할 응답 내용
  let html = "<h1>Page2</h1>";
  html += "<h2>Node.js Backend Page</h2>";

  // 브라우저에게 전달할 결과 코드
  res.writeHead(200);
  res.write(html);
  res.end();
});

router.route("/page3").get((req, res, next) => {
  // 페이지 강제 이동
  res.redirect("https://www.naver.com");
});

/** 02 - GetParams */
/** GET 파라미터를 처리하기 위한 페이지 정의 */
router.route("/send_get").get((req, res, next) => {
  // GET 파라미터들은 req.query 객체의 하위 데이터로 저장된다.
  for (key in req.query) {
    const str =
      "프론트엔드로부터 전달받는 변수 ::: " + key + "=" + req.query[key];
    logger.debug(str);
  }

  // /send_get?answer=0000 형태로 접근한 경우 answer파라미터의 값 추출
  const answer = req.query.answer;
  let html = null;

  if (parseInt(answer) === 300) {
    html = '<h1 style="color:#0066ff">정답입니다.</h1>';
  } else {
    html = '<h1 style="color:#ff6600">틀렸습니다.</h1>';
  }

  res.status(200).send(html);
});

/** URL 파라미터를 처리하기 위한 라우터 등록 */
// http://<hostname>:<port>/페이지이름/변수1/변수2
router.route("/send_url/:username/:age").get((req, res, next) => {
  // URL 파라미터들은 req.params 객체의 하위 데이터로 저장된다.
  // 전달받은 URL 파라미터는 GET 파라미터와 같은 방법으로 사용 가능함.
  for (key in req.params) {
    const str =
      "프론트엔드로부터 전달받는 변수 ::: " + key + "=" + req.params[key];
    logger.debug(str);
  }

  const html =
    "<h1><span style = 'color:#0066ff'>" +
    req.params.username +
    "</span>님은 <span style = 'color:#ff6600'>" +
    req.params.age +
    "</span>세 입니다.</h1>";

  res.status(200).send(html);
});

/** 03 - Post,Put,Delete.js */
/** POST 파라미터를 처리하기 위한 라우터 등록 */
router.route("/send_post").post((req, res, next) => {
  // URL 파라미터들은 req.body 객체의 하위 데이터로 저장된다
  for (key in req.body) {
    "프론트엔드로부터 전달받는 변수 ::: " + key + "=" + req.body[key];
    logger.debug(str);
  }

  const html =
    "<h1><span style = 'color:#0066ff'>" +
    req.body.username +
    "</span>님의 이메일 주소는 <span style = 'color:#ff6600'>" +
    req.body.email +
    "</span>입니다.</h1>";

  res.status(200).send(html);
});

/** PUT 파라미터를 처리하기 위한 라우터 등록 */
router.route("/send_put").put((req, res, next) => {
  // URL 파라미터들은 req.body 객체의 하위 데이터로 저장된다
  for (key in req.body) {
    "프론트엔드로부터 전달받는 변수 ::: " + key + "=" + req.body[key];
    logger.debug(str);
  }

  const html =
    "<h1><span style = 'color:#0066ff'>" +
    req.body.username +
    "</span>님의 이메일 주소는 <span style = 'color:#ff6600'>" +
    req.body.grade +
    "</span>학년 입니다.</h1>";

  res.status(200).send(html);
});

/** DELETE 파라미터를 처리하기 위한 라우터 등록 */
router.route("/send_delete").put((req, res, next) => {
  // URL 파라미터들은 req.body 객체의 하위 데이터로 저장된다
  for (key in req.body) {
    "프론트엔드로부터 전달받는 변수 ::: " + key + "=" + req.body[key];
    logger.debug(str);
  }

  const html =
    "<h1><span style = 'color:#0066ff'>" +
    req.body.username +
    "</span>님의 점수는 <span style = 'color:#ff6600'>" +
    req.body.point +
    "</span>점 입니다.</h1>";

  res.status(200).send(html);
});

/** 상품에 대한 Restful API 정의하기 */
// 위의 형태처럼 개별적인 함수로 구현 가능하지만 대부분 하나의 URL에 메서드 체인을 사용해서 4가지 전송방식을 한번에 구현
router
  .route("/product")
  .get((req, res, next) => {
    // URL params 형식으로 조회할 상품의 일련번호를 전달받아야 한다.
    const html =
      "<h1><span style = 'color:#0066ff'>" +
      req.query.productNumber +
      "</span>번 상품 <span style = 'color:#ff6600'>조회</span>하기.</h1>";

    res.status(200).send(html);
  })
  .post((req, res, next) => {
    // <form> 상에 저장할 상품 정보를 입력 후 전송한다. (주로 관리자 기능)
    // 저장시에는 일련번호는 전송하지 않으며 저장후 자동으로 발급되는 일련번호를 프론트에게 돌려줘야 한다
    const html =
      "<h1><span style = 'color:#0066ff'>" +
      req.body.productNumber +
      "</span>번 상품 <span style = 'color:#ff6600'>등록</span>하기.</h1>";

    res.status(200).send(html);
  })
  .put((req, res, next) => {
    // <form> 상에 수정 상품 정보를 입력 후 전송한다. (주로 관리자 기능)
    // 몇번 상품을 수정할지 식별하기 위해 상품 일련번호가 함꼐 전송된다.
    const html =
      "<h1><span style = 'color:#0066ff'>" +
      req.body.productNumber +
      "</span>번 상품 <span style = 'color:#ff6600'>수정</span>하기.</h1>";

    res.status(200).send(html);
  })
  .delete((req, res, next) => {
    // 삭제할 상품의 일련번호 전송
    const html =
      "<h1><span style = 'color:#0066ff'>" +
      req.body.productNumber +
      "</span>번 상품 <span style = 'color:#ff6600'>삭제</span>하기.</h1>";

    res.status(200).send(html);
  });

/** 04 - Cookie.js */
router
  .route("/cookie")
  .post((req, res, next) => {
    // URL 파라미터들은 req.body 객체의 하위 데이터로 저장된다
    for (key in req.body) {
      const str = "[" + req.method + "]" + key + "=" + req.body[key];
      logger.debug(str);
    }

    // 일반 쿠키 저장하기 -> 유효시간을 30초로 설정
    res.cookie("my_msg", req.body.msg, { maxAge: 30 * 1000, path: "/" });

    // 암호화된 쿠키 저장하기 -> 유효시간을 30초로 설정
    res.cookie("my_msg_signed", req.body.msg, {
      maxAge: 30 * 1000,
      path: "/",
      signed: true,
    });

    res.status(200).send("ok");
  })
  .get((req, res, next) => {
    // 기본 쿠키값들은 req.cookies 객체의 하위 데이터로 저장된다. (일반 데이터)
    for (key in req.cookies) {
      const str = "[cookies]" + key + "=" + req.cookies[key];
      logger.debug(str);
    }

    // 암호화 된 쿠키값들은 req.signedCookies 객체의 하위 데이터로 저장된다. (일반 데이터)
    for (key in req.signedCookies) {
      const str = "[signedCookies]" + key + "=" + req.cookies[key];
      logger.debug(str);
    }

    // 원하는 쿠키값을 가져온다.
    const my_msg = req.cookies.my_msg;
    const my_msg_signed = req.cookies.my_msg_signed;

    const result_data = {
      my_msg: my_msg,
      my_msg_signed: my_msg_signed,
    };

    res.status(200).send(result_data);
  })
  .delete((req, res, next) => {
    // 저장시 domain, path 를 설정했다면 삭제시에도 동일한 값을 지정해야 함
    res.clearCookie("my_msg", { path: "/" });
    res.clearCookie("my_msg_signed", { path: "/" });
    res.status(200).send("clear");
  });

/** 05 - Session.js */
router
  .route("/session")
  .post((req, res, next) => {
    const username = req.body.username;
    const nickname = req.body.nickname;

    req.session.username = username;
    req.session.nickname = nickname;

    const json = { rt: "ok" };
    res.status(200).send(json);
  })
  .get((req, res, next) => {
    // 세션 데이터들은 req.session 객체의 하위 데이터로 저장된다.
    for (key in req.signedCookies) {
      const str = "[세션에 저장되어 있는 값]" + key + "=" + req.session[key];
      logger.debug(str, "node");
    }

    const my_data = {
      username: req.session.username,
      nickname: req.session.nickname,
    };

    res.status(200).send(my_data);
  })
  .delete((req, res, next) => {
    req.session.destroy((error) => {
      // 세션 삭제에 실패한 경우
      if (error) {
        logger.error("세션 삭제에 실패했습니다.");
        logger.error(error);
        return false;
      }
    });

    const json = { rt: "ok" };
    res.status(200).send(json);
  });

router
  .route("/session/login")
  .post((req, res, next) => {
    const id = req.body.id;
    const pw = req.body.pw;

    logger.debug("id = " + id);
    logger.debug("pw = " + pw);

    let login_ok = false;

    if (id == "node" && pw == "1234") {
      logger.debug("로그인 성공");
      login_ok = true;
    }

    let result_code = null;
    let result_msg = null;

    if (login_ok) {
      req.session.id = id;
      req.session.pw = pw;
      result_code = 200;
      result_msg = "ok";
    } else {
      result_code = 403;
      result_msg = "fail";
    }

    const json = { rt: result_msg };
    res.status(result_code).send(json);
  })
  .delete((req, res, next) => {
    logger.debug("로그아웃");
    req.session.destroy((error) => {
      // 세션 삭제에 실패한 경우
      if (error) {
        logger.error("세션 삭제에 실패했습니다.");
        logger.error(error);
        return false;
      }
    });

    const json = { rt: "ok" };
    res.status(200).send(json);
  })
  .get((req, res, next) => {
    const id = req.session.id;
    const pw = req.session.pw;

    let result_code = null;
    let result_msg = null;

    if (id !== undefined && pw !== undefined) {
      logger.debug("현재 로그인중이 맞습니다.");
      result_code = 200;
      result_msg = "OK";
    } else {
      logger.debug("현재 로그인중이 아닙니다.");
      result_code = 400;
      result_msg = "fail";
    }

    const json = { rt: result_msg };
    res.status(result_code).send(json);
  });

/** 06 - FileUpload.js */
router.route("/upload/simple").post((req, res, next) => {
  // name속성값이 myphoto인 경우, 업로드를 수행.
  const upload = multipart.single("myphoto");

  upload(req, res, (err) => {
    let result_code = 200;
    let result_msg = "ok";

    if (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FIELD_COUNT":
            err.result_code = 500;
            err.result_msg = "업로드 가능한 파일 수를 초과했습니다.";
            break;
          case "LIMIT_FILE_SIZE":
            err.result_code = 500;
            err.result_msg = "업로드 가능한 파일 용량을 초과했습니다.";
            break;
          default:
            err.result_code = 500;
            err.result_msg = "알 수 없는 에러가 발생했습니다.";
            break;
        }
      }
      logger.error(err);
      result_code = err.result_code;
      result_msg = err.result_msg;
    }

    const fileInfo = req.file;
    fileInfo.msg = result_msg;

    res.status(result_code).send(fileInfo);
  });
});

router.route("/upload/multiple").post((req, res, next) => {
  // 요청 정보 안에 업로드된 파일의 정보를 저장할 빈 배열을 준비
  req.file = [];

  // name속성이 myphoto이고 multiple 속성이 부여된 다중 업로드를 처리하는 함수 upload
  const upload = multipart.array("myphoto");

  upload(req, res, (err) => {
    let result_code = 200;
    let result_msg = "ok";

    if (err) {
      if (err instanceof multer.MulterError) {
        switch (err.code) {
          case "LIMIT_FIELD_COUNT":
            err.result_code = 500;
            err.result_msg = "업로드 가능한 파일 수를 초과했습니다.";
            break;
          case "LIMIT_FILE_SIZE":
            err.result_code = 500;
            err.result_msg = "업로드 가능한 파일 용량을 초과했습니다.";
            break;
          default:
            err.result_code = 500;
            err.result_msg = "알 수 없는 에러가 발생했습니다.";
            break;
        }
      }
      logger.error(err);
      result_code = err.result_code;
      result_msg = err.result_msg;
    }

    const result = {
      rt: result_code,
      rtmsg: result_msg,
      item: req.file,
    };

    res.status(result_code).send(result);
  });
});

/** 07-SendMail.js */
router.route("/send_mail").post(async (req, res, next) => {
  /** 1) 프론트엔드에서 전달한 사용자 입력값 */
  const writer_name = req.body.writer_name;
  let writer_email = req.body.writer_email;
  const receiver_name = req.body.receiver_name;
  let receiver_email = req.body.receiver_email;
  const subject = req.body.subject;
  const content = req.body.content;

  /** 2) 보내는 사람, 받는 사람의 메일 주소와 이름 */
  // 보내는 사람의 이름과 주소
  if (writer_name) {
    // ex) 서지영 <jen.jyseo@gmail.com>
    writer_email = writer_name + "<" + writer_email + ">";
  }

  // 받는 사람의 이름과 주소
  if (receiver_name) {
    receiver_email = receiver_name + "<" + receiver_email + ">";
  }

  /** 3) 메일 발송정보 구성 */
  const send_info = {
    from: writer_email,
    to: receiver_email,
    subject: subject,
    html: content,
  };
  logger.debug(JSON.stringify(send_info));

  const smtp = nodemailer.createTransport({
    host: "smtp.gmail.com", // SMTP 서버명 : smtp.gmail.com
    port: 465, // SMTP 포트 : 587
    secure: true, // 보안연결(SSL) 필요
    auth: { user: "jen.jyseo@gmail.com", pass: "zrkxmkmyaliqpnwy" },
  });

  /** 4) 메일발송 요청 */
  try {
    await smtp.sendMail(send_info);
  } catch (err) {
    console.error(err);
    return res.status(500).send("error");
  }

  res.status(200).send("ok");
});

/*----------------------------------------------------------
 | 6) 설정한 내용을 기반으로 서버 구동 시작
 -----------------------------------------------------------*/
// 백엔드를 가동하고 3000번 포트에서 대기
const port = 3000;
const ip = util.myip();

app.listen(port, () => {
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
    logger.debug("server address => http://" + v + ":" + port);
  });

  logger.debug(
    "----------------------------------------------------------------"
  );
});
