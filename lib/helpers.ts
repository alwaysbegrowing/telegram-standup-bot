export const fetchWithToken = async (url) => {
  const user = localStorage.getItem('telegram-user');
  if (!user) throw new Error('user not found');

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: user,
  });

  if (res.status !== 200) throw new Error(res.statusText);

  return res.json();
};
