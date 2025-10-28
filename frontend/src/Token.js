function setToken(tokenType, token, expiryInMinutes = 30) {
  const now = new Date();
  const expiryTime = now.getTime() + expiryInMinutes * 60 * 1000; // Convert to milliseconds

  const tokenData = {
    token: token,
    expiry: expiryTime
  };

  localStorage.setItem(tokenType, JSON.stringify(tokenData));
}

function getToken(tokenType) {
  const tokenData = JSON.parse(localStorage.getItem(tokenType));

  if (!tokenData) return null;

  const now = new Date();

  if (now.getTime() > tokenData.expiry) {
    // Token expired
    localStorage.removeItem(tokenType);
    window.location.href= "/login"
    return null;
  }

  return tokenData.token;
}

export  { setToken, getToken}
