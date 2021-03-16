import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import Button, { PrimaryButton } from '../../components/Button';
import { JSL_LABELS, HKSL_LABELS, CheckDouble } from './config';
import { signingResult as singingResultAtom } from '../../recoil/atom';
/* 

structure
    selectionWrapper
        availableSelection
            hksl
                list
            jsl
                list	
        videotutorial
    actionButtonWrapper
        cancel
        submit

receive props
- callback submit
- callback correction data select

*/

interface IstyleModalWrapper {
    open: boolean;
}
const CorrectionModalWrapper = styled.section<IstyleModalWrapper>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 60vw;
    height: 60vh;
    position: absolute;
    top: 50%;
    left: 50%;
    background-color: white;
    z-index: 100;
    transform: ${(props) =>
        props.open ? `translate(-50%, -50%)` : `translate(-50%, 150%)`};
    border: 1px solid black;
    border-radius: 2rem;
    transition: all 0.5s;
`;

interface IBackground {
    open: boolean;
}
const Background = styled.div<IBackground>`
    background-color: ${(props) => (props.open ? `rgb(80,80,80,0.7);` : null)};
    position: absolute;
    top: 50%;
    left: 50%;
    z-index: ${(props) => (props.open ? `99` : `-99`)};
    transform: translate(-50%, -50%);
    width: 105vw;
    height: 105vh;
    transition: background-color 0.5s z-index 1s;
`;
const TitleText = styled.h3`
    margin: 0;
`;

const SelectionWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    height: 60%;
`;
const VideoStyle = styled.video`
    min-width: 30%;
    height: 80%;
    object-fit: contain;
    border: 0.3rem solid black;
    border-radius: 15px;
    box-sizing: border-box;
`;
const SelectionLanguageListContainer = styled.div`
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    overflow-y: auto;
    height: 80%;
`;
const LanguageSelectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;
const SelectionButtonWrapper = styled.div`
    overflow-y: scroll;
    scroll-behavior: smooth;
`;
const SelectionResultText = styled.p`
    font-size: 1.4rem;
    color: #7ecbbd;
`;
const SelectionResultWrapper = styled.div`
    width: 100%;
    height: 2rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
`;
const ActionButtonWrapper = styled.div`
    width: 50%;
    display: flex;
    flex-direction: center;
    justify-content: center;
    margin-top: 1rem;
`;

type SelectionButtonProps = {
    isSelected: boolean;
};
const SelectionButton = styled.button<SelectionButtonProps>`
    background-color: ${(props) => (props.isSelected ? `#7ecbbd` : `#f1f1f1`)};
    width: 100%;
    border: none;
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

interface IListComponent {
    handleSelectVideo: (input: string) => void;
}
const JSL_listComponent: React.FC<IListComponent> = (props: IListComponent) => {
    const [videoSelection, updateVideoSelection] = useState('');
    const handleSelection = (input: string) => {
        updateVideoSelection(input);
        props.handleSelectVideo(input);
    };
    const JSL_LIST = JSL_LABELS.map((item, index) => {
        return (
            <SelectionButton
                key={index}
                onClick={() => handleSelection(item)}
                isSelected={videoSelection === item}
            >
                {item}
            </SelectionButton>
        );
    });
    return <>{JSL_LIST}</>;
};

const HKSL_listComponent: React.FC<IListComponent> = (
    props: IListComponent,
) => {
    const [videoSelection, updateVideoSelection] = useState('');
    const handleSelection = (input: string) => {
        updateVideoSelection(input);
        props.handleSelectVideo(input);
    };
    const HKSL_LIST = HKSL_LABELS.map((item, index) => {
        return (
            <SelectionButton
                key={index}
                onClick={() => handleSelection(item)}
                isSelected={videoSelection === item}
            >
                {item}
            </SelectionButton>
        );
    });
    return <>{HKSL_LIST}</>;
};

interface ICorrectionModal {
    open: boolean;
    setClose: () => void;
    sendDataToCloud: () => void;
}
const CorrectionModal: React.FC<ICorrectionModal> = (
    props: ICorrectionModal,
) => {
    const [videoSelection, updateVideoSelection] = useState('');
    const [signingResult, updateSigningResult] = useRecoilState(
        singingResultAtom,
    );
    const [isConfirm, updateIsConfirm] = useState(false);

    const handleSelectVideo = (input: string) => {
        updateVideoSelection(input);
    };
    const [videoLabel, updatevideoLabel] = useState<string[]>([]);
    const [languageSelect, updateLanguageSelect] = useState<string>('hksl');
    // const languageListWrapper = useRef<HTMLDivElement>(null)

    const handleSelectLanguage = (input: string) => {
        updateLanguageSelect(input);
    };

    useEffect(() => {
        updatevideoLabel(videoSelection?.split('_'));
    }, [videoSelection]);

    const handleConfirm = () => {
        console.log('click confirm');
        let signSelectionText: string;
        const result = CheckDouble(videoSelection);
        if (result) signSelectionText = result;
        else signSelectionText = videoSelection;
        updateSigningResult(signSelectionText);
        updateIsConfirm(true);
    };
    useEffect(() => {
        if (isConfirm) {
            props.sendDataToCloud();
            props.setClose();
        }
    }, [signingResult]);

    return (
        <>
            <Background open={props.open} />
            <CorrectionModalWrapper open={props.open}>
                <TitleText>Which is the correct sign</TitleText>
                <SelectionWrapper>
                    <SelectionLanguageListContainer>
                        <LanguageSelectionWrapper>
                            {languageSelect === 'hksl' ? (
                                <>
                                    <PrimaryButton
                                        onClick={() =>
                                            handleSelectLanguage('hksl')
                                        }
                                    >
                                        HKSL
                                    </PrimaryButton>
                                    <Button
                                        onClick={() =>
                                            handleSelectLanguage('jsl')
                                        }
                                    >
                                        JSL
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        onClick={() =>
                                            handleSelectLanguage('hksl')
                                        }
                                    >
                                        HKSL
                                    </Button>
                                    <PrimaryButton
                                        onClick={() =>
                                            handleSelectLanguage('jsl')
                                        }
                                    >
                                        JSL
                                    </PrimaryButton>
                                </>
                            )}
                        </LanguageSelectionWrapper>
                        <SelectionButtonWrapper>
                            {languageSelect === 'hksl' && (
                                <HKSL_listComponent
                                    handleSelectVideo={handleSelectVideo}
                                />
                            )}
                            {languageSelect === 'jsl' && (
                                <JSL_listComponent
                                    handleSelectVideo={handleSelectVideo}
                                />
                            )}
                        </SelectionButtonWrapper>
                    </SelectionLanguageListContainer>

                    <VideoStyle
                        src={`./assets/video/${
                            videoLabel.length > 0 ? videoLabel[0] : null
                        }/${videoSelection}.mp4`}
                        autoPlay={true}
                        loop
                        playsInline
                        muted
                    ></VideoStyle>
                </SelectionWrapper>
                <SelectionResultWrapper>
                    <SelectionResultText>{videoSelection}</SelectionResultText>
                </SelectionResultWrapper>
                <ActionButtonWrapper>
                    <Button onClick={() => props.setClose()}>cancel</Button>
                    <PrimaryButton onClick={handleConfirm}>
                        confirm
                    </PrimaryButton>
                </ActionButtonWrapper>
            </CorrectionModalWrapper>
        </>
    );
};

export default CorrectionModal;
