export function requireVerifiedEmail(user) {
 if(user.email_verified!==true)throw Object.assign(new Error('Confirme seu e-mail antes de acessar o portal. Confira sua caixa de entrada e o spam.'),{status:403});
}
