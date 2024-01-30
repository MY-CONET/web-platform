export const getDappListData = () => {
  return fetch('http://localhost:13001/api/dapp-list/', {
    method: 'GET',
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    });
};

// 激活Dapp
export const activeDapp = (dappName: string) => {
  return fetch(`http://localhost:13001/api/dapp-list/active`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      dappName,
    }),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data;
    });
};
