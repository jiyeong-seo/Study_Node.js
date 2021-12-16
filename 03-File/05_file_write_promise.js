/** (1) 모듈 참조, 필요한 변수 생성 */
const fs = require("fs"); // FileSystem 모듈 참조
const target = "./output_async.txt"; // 저장할 파일의 경로
const contetn = "hello world"; // 저장할 내용
// 파일의 존재 여부 검사
// 존재 여부 검사는 시간이 오래 걸리지 않으므로 동기적으로 처리한다
const isExists = fs.existsSync(target);

if (!isExists) {
  const myPromise = fs.promises.writeFile(target, content);

  myPromise
    .then(() => {
      console.debug("저장 완료");
    })
    .catch((error) => {
      console.error("저장 실패");
      console.error(error);
    });

  console.log(target + "의 파일 저장을 요청했습니다.");
} else {
  fs.promises.unlink(target).then(() => {
    console.debug("삭제 실패");
  });

  console.log(target + "의 파일 삭제를 요청했습니다.");
}
