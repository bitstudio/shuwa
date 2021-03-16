import React from 'react';
import styled from 'styled-components';

// interface
interface ButtonProps {
    onClick: any;
    children: string;
}

// style
const ButtonSignLanguage = styled.button`
    width: auto;
    height: 2.6rem;

    padding: 0 1rem;
    margin: 0 1rem;

    border-radius: 30px;
    background-color: #f1f1f1;
    border: none;
    color: #000;
    font-size: 1rem;

    &:hover {
        background-color: #000;
        color: #fff;
    }
    &:active {
        background-color: #000;
        color: #fff;
    }
    &:focus {
        outline: 0;
    }

    cursor: pointer;
    transition: all 0.2s;
`;

const PrimaryButtonSignLanguage = styled.button`
    width: auto;
    height: 2.6rem;

    padding: 0 1rem;
    margin: 0 1rem;

    border-radius: 30px;
    background-color: #7ecbbd;
    border: none;
    color: #000;
    font-size: 1rem;

    &:hover {
        background-color: #48857a;
        color: #fff;
    }
    &:active {
        background-color: #48857a;
        color: #fff;
    }
    &:focus {
        outline: 0;
    }

    cursor: pointer;
    transition: all 0.2s;
`;

const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
    return <ButtonSignLanguage onClick={props.onClick}>{props.children}</ButtonSignLanguage>;
};

export const PrimaryButton: React.FC<ButtonProps> = (props: ButtonProps) => {
    return <PrimaryButtonSignLanguage onClick={props.onClick}>{props.children}</PrimaryButtonSignLanguage>;
};

export default Button;
