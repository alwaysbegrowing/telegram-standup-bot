export const fetchWithToken = async (url) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: localStorage.getItem('telegram-user'),
  });

  if (res.status !== 200) throw new Error(res.statusText);

  return res.json();
};
