/** (1) 모듈 참조, 필요한 변수 생성 */
const fs = require("fs"); // FileSystem 모듈 참조
const target = "./output_sync.txt"; // 저장할 파일의 경로
const contetn = "hello world"; // 저장할 내용
const isExists = fs.existsSync(target); // 파일의 존재 여부 검사

if (!isExists) {
  /** (2) 파일이 존재하지 않을 경우 새로 저장 */
  // 저장할 경로는 상대, 절대 모두 가능
  // 상대 경로인 경운 vscode에 설정된 작업 디렉토리가 기준
  // 절대 경로인 경우 컴퓨터 전역에 대해서 지정 가능 -> ex) /hello/world
  // 현재 실습에서는 상대경로 지정한 상황 -> target
  // 동기식 파일 저장 -> fs.writeFileSync()
  // 이 파일을 다 저장하기 전까지는 프로그램이 대기상태임
  // 그러므로 대용량 처리에는 적합하지 않음
  fs.writeFileSync(target, contetn, "utf8");

  // 퍼미션 설정(권한 설정)
  fs.chmodSync(target, 0766);

  // 파일 저장이 완료된 후에나 메시지가 표시된다. -> 동기 처리
  console.log(target + "파일에 데이터 쓰기 및 퍼미션 설정 완료");
} else {
  /** (3) 파일이 존재할 경우 파일 삭제 */
  fs.unlinkSync(target);
  console.log(target + "파일 삭제 완료.");
}
