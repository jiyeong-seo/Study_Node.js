function helloworld() {
    return new Promise((resolve, reject) => {
      // 비동기 처리로 구현해야 하는 로직
      if (처리가성공한경우) {
        resolve(/**파라미터는 개발자 마음*/);
      } else {
        reject(/**파라미터는 개발자 마음*/);
      }
    });
  }
  
  const myPromise = helloworld();
  myPromise
    .then((/** 개발자가 마음대로 정의한 파라미터 */) => {})
    .catch((/** 개발자가 마음대로 정한 파라미터 */) => {});
  