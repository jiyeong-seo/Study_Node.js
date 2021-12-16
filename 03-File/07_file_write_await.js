/** (1) 모듈 참조, 필요한 변수 생성 */
const fs = require("fs"); // FileSystem 모듈 참조
const target = "./output_async.txt"; // 저장할 파일의 경로
const contetn = "hello world"; // 저장할 내용
// 파일의 존재 여부 검사
// 존재 여부 검사는 시간이 오래 걸리지 않으므로 동기적으로 처리한다
const isExists = fs.existsSync(target);

// async~await 문법은 비동기 결과를 콜백으로만 받아야 했던 한계를 개선하여
// 비동기 결과를 동기식 문법처럼 일반 함수가 리턴할 수 있도록 함

// 1) promise객체를 리턴하는 기능 호출을 async가 적용된 함수 안에서 수행
// 2) promise객체 리턴 구문 앞에 await라는 예약어를 추가.

if (!isExists) {
  // async function myWrite() {}
  const myWrite = async () => {
    try {
      // 성공시에 아무런 결과도 반환하지 않으므로 리턴받지 않음.
      await fs.promises.writeFile(target, content);
      console.debug("저장완료");
    } catch (error) {
      console.error("에러 발생");
      console.error(error);
    }
  };
  myWrite();
  console.log(target + "의 파일 저장을 요청했습니다.");
} else {
  /** (3) 파일이 존재할 경우 파일 삭제 */
  // 즉시실행함수 형식
  (async () => {
    try {
      await fs.promises.unlink(target);
    } catch (error) {
      console.error("에러 발생");
      console.error(error);
    }
  })();

  console.log(target + "의 파일 삭제를 요청했습니다.");
}
