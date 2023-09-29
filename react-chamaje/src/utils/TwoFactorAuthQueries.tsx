/**************************************************************************************/
/* Two-Factor Authentication                                                                   	          */
/**************************************************************************************/

// fetch request to turn on 2FA mode : generate google auth secret and
// enable 2fa status (boolean). Infos are kept in database until user
// decides to turn it off.
// RETURN : generated QR Code with google auth secret and user's payload
export async function turnOnTwoFactorAuthentication(accessToken: string) {
	const response = await fetch('api/login/2fa/turn-on', {
		method: 'POST',
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message);
	}
	// return QR code url
	const qrCodeUrl = await response.text();
	return qrCodeUrl;
}

// fetch request to turn off 2FA mode : remove google auth secret and
// fisable 2FA status
export async function turnOffTwoFactorAuthentication(accessToken: string) {
	const response = await fetch('api/login/2fa/turn-off', {
		method: 'POST',
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});
	if (!response.ok) {
		const data = await response.json();
		throw new Error(data.message);
	}
	return response.json();
}

export async function logInTwoFactorAuthentication(
	validationCode: string,
	accessToken: string,
) {
	const response = await fetch('/api/login/2fa/authenticate', {
		method: 'POST',
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${accessToken}`,
		},
		body: JSON.stringify({ twoFactorAuthenticationCode: validationCode }),
	});
	if (!response.ok) {
		const data = await response.json();
		throw data.message;
	}
	// if validation code error is invalid, set
	// `ValidationCodeError` state to display
	// error message
	return response.json();
}
