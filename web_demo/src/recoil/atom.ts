import { atom } from 'recoil';
import SignLanguageClassifyModel from '../modules/ML/sign_classify';

export const signLanguage = atom<string>({
    key: 'signLanguage',
    default: '',
});

export const sceneSelect = atom<string>({
    key: 'sceneSelect',
    default: '',
});

export const classifyModel = atom<SignLanguageClassifyModel>({
    key: 'classifyModel',
    default: new SignLanguageClassifyModel(),
});

export const videoSelection = atom<string>({
    key: 'videoselection',
    default: '',
});

export const signingResult = atom<string>({
    key: 'signingResult',
    default: '',
});
