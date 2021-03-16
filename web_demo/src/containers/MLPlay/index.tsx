import React from 'react';
import styled from 'styled-components';
import Signing from './Signing';
import Selection from './Selection';

/*
component state
  sign_selection
  signing
  packing_done
*/

const SignPlayWrapper = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    overflow: hidden;

    height: 90vh;
    width: 100vw;

    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;

const MLPlay: React.FC = () => {
    return (
        <SignPlayWrapper>
            <Selection />
            <Signing />
        </SignPlayWrapper>
    );
};

export default MLPlay;
