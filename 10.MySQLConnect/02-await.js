/** (1) mysql 모듈 불러오기 */
// npm install mysql2 --save
const mysql2 = require("mysql2/promise");

(async () => {
  let dbcon = null;

  /** (2) mysql 모듈 객체 생성 및 접속 정보 설정 */
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
    // 실행할 SQL 구문
    // Node의 변수로 치환될 부분(주로 저장, 수정될 값)은 ?로 지정
    // 문자열이더라도 홑따옴표 사용 안함
    const sql = "INSERT INTO department (dname, loc) VALUES (?, ?)";
    // SQL문의 '?'를 치환할 배열 -> ? 순서대로 값을 지정한다.
    var input_data = ["Node학과", "공학관"];
    const [result1] = await dbcon.query(sql, input_data);
    // 저장 결과 확인
    console.log("저장된 데이터의 수 :" + result1.affectedRows);
    // UPDATE, DELETE 쿼리의 경우 사용할 수 없는 값임
    console.log("생성된 PK값:" + result1.insertID);

    const [result2] = await dbcon.query(
      "UPDATE department SET dname=? WHERE deptno=?",
      ["수정학과", result1.insertID]
    );
    console.log("수정된 데이터의 수: " + result2.affectedRows);

    const [result3] = await dbcon.query(
      "DELETE FROM department WHERE deptno=?",
      [result1.insertId]
    );
    console.log("삭제된 데이터의 수 : " + result3.affectedRows);
  } catch (error) {
    console.log(error);
    // 앞 처리 과정에서 db에 접속이 된 상태이므로 SQL 실행 도중 문제가 발생하면 DB 접근을 해제해야 한다.
    dbcon.end();
    return;
  }

  dbcon.end();
})();
