const util = {
  delay(ms) {
    return new Promise((res) => {
      setTimeout(() => res(), ms);
    });
  },
};

export { util };
