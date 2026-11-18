export function requireVerifiedEmail(user) {
 if(user.email_verified!==true)throw Object.assign(new Error('Confirme seu e-mail antes de acessar o portal. No login, use Reenviar confirmação de e-mail se precisar.'),{status:403});
}
