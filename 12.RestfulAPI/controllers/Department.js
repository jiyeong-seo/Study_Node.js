/** department 테이블에 대한 CRUD 기능을 수행하는 Restful API */

/** 모듈 참조 부분 */
const config = require("../../helper/_config");
const logger = require("../../helper/LogHelper");
const router = require("express").Router();
const mysql2 = require("mysql2/promise");

/** 라우팅 정의 부분 */
module.exports = (app) => {
  let dbcon = null;

  /** 전체 목록 조회 -> Read(SELECT) */
  router.get("/department", async (req, res, next) => {
    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;

    try {
      // 데이터베이스 접속
      dbcon = await mysql2.createConnection(config.databases);
      await dbcon.connect();

      // 데이터 조회
      const sql = "SELECT deptno, dname, loc FROM department";
      const [result] = await dbcon.query(sql);

      // 조회 결과를 미리 준비한 변수에 저장함
      json = result;
    } catch (error) {
      dbcon.end();
      logger.error(error);

      // 400 Bad Request -> 잘못된 요청
      return res.status(500).send({
        rt: 500,
        rtmsg: "요청을 처리하는데 실패했습니다.",
        pubdate: new Date().toISOString(),
      });
    }

    dbcon.end();

    // 모든 처리에 성공했으므로 정상 조회 결과 구성
    res.status(200).send({
      rt: 200,
      rtmsg: "OK",
      item: json,
      pubdate: new Date().toISOString(),
    });
  });

  /** 특정 항목에 대한 상세 조회 -> Read(SELECT) */
  router.get("/department/:deptno", async (req, res, next) => {
    const deptno = req.params.deptno;

    if (deptno === undefined) {
      // 400 Bad Request -> 잘못된 요청
      return res.status(400).send({
        rt: 400,
        rtmsg: "필수 파라미터가 없습니다.",
      });
    }

    // 데이터 조회 결과가 저장될 빈 변수
    let json = null;

    try {
      // 데이터베이스 접속
      dbcon = await mysql2.createConnection(config.databases);
      await dbcon.connect();

      // 데이터 조회
      const sql = "SELECT deptno, dname, loc FROM department WHERE deptno=?";
      const [result] = await dbcon.query(sql, [deptno]);

      // 조회 결과를 미리 준비한 변수에 저장함
      json = result;
    } catch (error) {
      dbcon.end();
      logger.error(error);

      // 400 Bad Request -> 잘못된 요청
      return res.status(500).send({
        rt: 500,
        rtmsg: "요청을 처리하는데 실패했습니다.",
        pubdate: new Date().toISOString(),
      });
    }

    dbcon.end();

    // 모든 처리에 성공했으므로 정상 조회 결과 구성
    // 모든 처리에 성공했으므로 정상 조회 결과 구성
    res.status(200).send({
      rt: 200,
      rtmsg: "OK",
      item: json,
      pubdate: new Date().toISOString(),
    });
  });

  /** 데이터 추가 -> Create(INSERT) */
  router.post('/department', async (req, res, next) => {
      // 저장을 위한 파라미터 입력 받기
     const dname = req.body.dname;
     const loc = req.body.location;

     if ( dname === undefined || loc === undefined) {
         
     }
  })
};
