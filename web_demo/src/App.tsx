import React, { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import './App.css';
import Loader from './components/Loader';
import MLPlay from './containers/MLPlay';
import { classifyModel as classifyModelAtom } from './recoil/atom';

/*
project structure
    camera
    ML selection
    ML collect data
    result

project flow
    initmodel
    select sign language
    select sign words video
    record video
    send image to ML processing
*/

const ProcessingModal = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    z-index: 1;
`;

const App: React.FC = () => {
    const classifyModel = useRecoilValue(classifyModelAtom);
    const [isInitModel, updateIsInitModel] = useState<boolean>(false);

    useEffect(() => {
        classifyModel.initModel().then((result) => {
            updateIsInitModel(result);
        });
    }, []);

    return (
        <div className="App">
            APP version: 0.0.5 <br /> ML version: 0.0.3 <br />
            {isInitModel && <MLPlay />}
            {!isInitModel && (
                <ProcessingModal>
                    <p>Preparing Model</p>
                    <Loader />
                </ProcessingModal>
            )}
        </div>
    );
};

export default App;
