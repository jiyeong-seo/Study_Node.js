module.exports = (app) => {
  const router = require("express").Router();
  const logger = require("../../helper/LogHelper");
  const config = require("../../helper/_config");
  const axios = require("axios");

  /** URL 파라미터를 처리하기 위한 라우터 등록 */
  // http://<hostname>:<port>/페이지이름/변수1/변수2
  router.route("/today_covid19/:region").get((req, res, next) => {
    // URL 파라미터들은 req.params 객체의 하위 데이터로 저장된다.
    // 전달받은 URL 파라미터는 GET 파라미터와 같은 방법으로 사용 가능함.
    const str = `프론트엔드로부터 전달받는 변수 : ${req.params.region}`;
    logger.debug(str);

    const covidUrl = "http://itpaper.co.kr/demo/covid19/now.php";

    let html = "";
    let confirmed = "";

    (async () => {
      let json = null;
      try {
        // axios를 활용하여 json 데이터 요청
        const response = await axios.get(covidUrl);
        json = response.data;
      } catch (error) {
        const errorMessage = `[${error.response.status}] ${error.response.statusText}`;
        logger.error(errorMessage);
        return;
      }

      json.state.map((v, i) => {
        if (v.region === req.params.region) {
          confirmed = v.confirmed - v.confirmed_prev;
          logger.debug(`{'확진': ${confirmed}}`);
        }
      });

      html = `{'확진': ${confirmed}}`;

      // 브라우저에게 전달할 결과 코드
      res.writeHead(200);
      res.write(html);
      res.end();
    })();
  });

  return router;
};
