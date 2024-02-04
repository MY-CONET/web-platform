const getSystemConfig = async (...args: any[]): Promise<unknown> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'CONET-Platform',
        version: '1.0.0',
      });
    }, 500);
  });
};

export default { getSystemConfig };
