var fs = require("fs"); // FileSystem 모듈 참조
var target = "./output_await.txt"; // 읽어들일 파일의 경로

if (fs.existsSync(target)) {
  (async () => {
    let data = null;
    // 비동기 처리의 결과를 then()함수에 대한 콜백 파라미터로 전달받아야 하는 경우,
    // await 키워드를 적용하면 then()함수 없이 즉시 리턴받을 수 있다.
    try {
      data = await fs.promises.readFile(target, "utf8");
      console.log("파일 읽기 완료");
    } catch (error) {
      console.error(error);
      console.error("파일 읽기 실패");
    }

    console.debug(data);
  })();

  console.log(target + "파일을 읽도록 요청했습니다.");
} else {
  console.log(target + "파일이 존재하지 않습니다.");
}
