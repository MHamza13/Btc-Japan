import { EncryptStorage } from 'encrypt-storage';


export const encryptStorage = new EncryptStorage('secret-key-value', {
    prefix: '@edbe38e0-748a-49c8-9f8f-499f-b68f38dbe5a2',
    storageType: 'localStorage'
});


export const encryptUserID = new EncryptStorage('secret-key-value', {
    prefix: '@edbe38e0-748a-49c8-9f8f-499f-IDb68f38dbe5a2',
    storageType: 'localStorage'
});