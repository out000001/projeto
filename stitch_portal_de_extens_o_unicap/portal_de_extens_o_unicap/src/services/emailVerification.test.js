import{beforeEach,it,expect,vi}from'vitest';
import{sendVerificationForCredentials}from'./emailVerification';
import{signInWithEmailAndPassword,sendEmailVerification,signOut}from'firebase/auth';
vi.mock('./firebase',()=>({auth:{}}));vi.mock('firebase/auth',()=>({signInWithEmailAndPassword:vi.fn(),sendEmailVerification:vi.fn(),signOut:vi.fn()}));
beforeEach(()=>{vi.resetAllMocks();signInWithEmailAndPassword.mockResolvedValue({user:{emailVerified:false}});sendEmailVerification.mockResolvedValue();signOut.mockResolvedValue();});
it('requests the Firebase verification email then clears the temporary session',async()=>{await sendVerificationForCredentials(' a@example.com ','password');expect(sendEmailVerification).toHaveBeenCalledOnce();expect(signOut).toHaveBeenCalledOnce();});
it('clears the session even if email delivery fails',async()=>{sendEmailVerification.mockRejectedValue({code:'auth/network-request-failed'});await expect(sendVerificationForCredentials('a@example.com','password')).rejects.toThrow(/Não foi possível enviar/);expect(signOut).toHaveBeenCalledOnce();});
it('does not resend a verification to a verified account',async()=>{signInWithEmailAndPassword.mockResolvedValue({user:{emailVerified:true}});await expect(sendVerificationForCredentials('a@example.com','password')).rejects.toThrow(/já está confirmado/);expect(sendEmailVerification).not.toHaveBeenCalled();expect(signOut).toHaveBeenCalledOnce();});
