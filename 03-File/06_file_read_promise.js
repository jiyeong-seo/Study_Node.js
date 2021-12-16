var fs = require("fs");
var target = "./output_await.txt"; // 읽어들일 파일의 경로

if (fs.existsSync(target)) {
  fs.promises
    .readFile(target, "utf8")
    .then((data) => {
      // 읽은 결과를 받기 위한 콜백
      console.debug("파일 읽기 완료");
      console.debug(data);
    })
    .catch((err) => {
      // 에러 발생시 호출되는 콜백
      console.error(err);
      console.error("파일 읽기 실패");
    });

  console.debug(target + "파일을 읽도록 요청했습니다.");
} else {
  console.log(target + "파일이 존재하지 않습니다.");
}
