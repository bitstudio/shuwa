import React from 'react';
import styled, { keyframes } from 'styled-components';

const LoaderKeyFrame = keyframes`
0% {
	transform: rotate(0deg);
  }
  100% {
	transform: rotate(360deg);
  }
`;

const LoaderStyle = styled.div`
    display: inline-block;
    position: relative;
    width: 80px;
    height: 80px;
`;
const DIV = styled.div`
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    margin: 8px;
    border: 8px solid #7ecbbd;
    border-radius: 50%;
    -webkit-mask-image: -webkit-radial-gradient(white, black);
    animation: ${LoaderKeyFrame} 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: #7ecbbd transparent transparent transparent;
`;

const Loader = () => {
    return (
        <LoaderStyle>
            <DIV></DIV>
            {/* <DIV style={{ animationDelay: '-0.45s' }}></DIV>
            <DIV style={{ animationDelay: '-0.3s' }}></DIV>
            <DIV style={{ animationDelay: '-0.15s' }}></DIV> */}
        </LoaderStyle>
    );
};

export default Loader;
