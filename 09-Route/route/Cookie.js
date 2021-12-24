module.exports = (app) => {
  const router = require("express").Router();
  const logger = require('../../helper/LogHelper');
  const config = require('../../helper/_config');
  
  // 1) router.route("url경로").get|post|put|delete((req, res) => {});
  // 2) router.get|post|put|delete("url경로", (req, res) => {});
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

  return router;
};
