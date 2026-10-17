import { decryptText, encryptText, hashPin, isEncryptedFile, isValidPin, randomBytes, toBase64, verifyPin } from './crypto';

describe('criptografia local', () => {
  it('PIN vira hash e confere só com o PIN certo', async () => {
    const salt = randomBytes(16);
    const hash = await hashPin('2580', salt);
    expect(hash).not.toContain('2580');
    expect(await verifyPin('2580', toBase64(salt), hash)).toBe(true);
    expect(await verifyPin('0000', toBase64(salt), hash)).toBe(false);
  });

  it('backup cifrado abre só com a senha', async () => {
    const file = await encryptText('{"segredo":true}', 'minha senha');
    expect(isEncryptedFile(file)).toBe(true);
    expect(JSON.stringify(file)).not.toContain('segredo');
    expect(await decryptText(file, 'minha senha')).toBe('{"segredo":true}');
    await expect(decryptText(file, 'errada')).rejects.toThrow('Senha errada');
  });

  it('valida formato do PIN', () => {
    expect(isValidPin('1234')).toBe(true);
    expect(isValidPin('12a4')).toBe(false);
    expect(isValidPin('123')).toBe(false);
  });
});
