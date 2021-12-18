const axios = require("axios");

/** API 참조: */
(async () => {
  let json = null;
  try {
    // axios를 활용하여 다른 백엔드에게 HTTP GET 파라미터를 전달하고 결과를 리턴받는다.
    const response = await axios.get(
      "https://www.juso.go.kr/addrlink/addrLinkApi.do",
      {
        params: {
          confmKey: "devU01TX0FVVEgyMDIxMTIxNzIzMzQzMjExMjA0NTY=", // 발급받은 승인키
          currentPage: 1, // 현재 페이지 번호
          currentPerPage: 20, // 페이지당 출력할 결과 Row 수
          keyword: "서초W", // 주소 검색어
          resultType: "json", // 검색결과형식 설정(xml,json)
        },
      }
    );

    json = response.data;
  } catch (error) {
    const errorMessage = `[${error.response.status}] ${error.response.statusText}`;
    console.error(errorMessage);
    return;
  }
  console.log(`json: %o`, json);

  json.results.juso.map((item, index) => {
    console.log("[%s] ", item.zipNo);
    console.log("[지번주소]" + item.jibunAddr);
    console.log("[도로명주소]" + item.roadAddr);
  });
})();
