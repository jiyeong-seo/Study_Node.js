/** (1) mysql 모듈 불러오기 */

const mysql2 = require("mysql2/promise");

(async () => {
  let dbcon = null;

  /** (2) mysql 모듈 객체 생성 및 접속 정보 설정 및 접속 */
  try {
    dbcon = await mysql2.createConnection({
      host: "localhost", // MySQL server 주소 (다른 pc인 경우 ip주소)
      port: 3306, // MySQL 설치시 기본값 3306
      user: "root", // 접근 권한 아이디 (root=관리자)
      // password: '' // 설치시 입력한 비밀번호
      database: "myschool", // 사용할 데이터베이스 이름
    });

    await dbcon.connect();
  } catch (error) {
    console.error(error);
    return;
  }

  /** (3) SQL 실행하기 */
  try {
    const sql = "SELECT deptno, dname, loc FROM department WHERE deptno <= ?";
    const input_data = [202];
    const [result1] = await dbcon.query(sql, input_data);

    console.log(result1);

    result1.map((v, i) => {
      console.log("%d, %s, %s", v.deptno, v.dname, v.loc);
    });
  } catch (error) {
    console.log(error);
    // 앞 처리 과정에서 db에 접속이 된 상태이므로 SQL 실행 도중 문자게 발생하면 DB 접근을 해제해야 한다.
    dbcon.end();
    return;
  }
  dbcon.end();
})();
