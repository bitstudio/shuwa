import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Button, { PrimaryButton } from '../../components/Button';
import { JSL_LABELS, HKSL_LABELS } from './config';

/* 
structure
	videotutorial
	availableSelection
		hksl
			list
		jsl
			list	
*/
const SelectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 35%;
    height: 100%;
`;
const VideoStyle = styled.video`
    min-width: 20vw;
    min-height: 20vw;
    max-width: 20vw;
    max-height: 20vw;
    background-color: black;
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
`;
const LanguageSelectionWrapper = styled.div`
    display: flex;
    flex-direction: column;
`;
const SelectionButtonWrapper = styled.div`
    overflow-y: scroll;
    scroll-behavior: smooth;
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

const Selection: React.FC = () => {
    // const videoSelection = useRecoilValue(videoSelectionAtom);
    const [videoSelection, updateVideoSelection] = useState('');
    const [languageSelect, updateLanguageSelect] = useState<string>('hksl');
    // const languageListWrapper = useRef<HTMLDivElement>(null)
    const [videoLabel, updatevideoLabel] = useState<string[]>([]);

    useEffect(() => {
        updatevideoLabel(videoSelection?.split('_'));
    }, [videoSelection]);

    const handleSelectLanguage = (input: string) => {
        updateLanguageSelect(input);
    };
    const handleSelectVideo = (input: string) => {
        updateVideoSelection(input);
    };

    return (
        <SelectionWrapper>
            <VideoStyle
                src={`./assets/video/${
                    videoLabel.length > 0 ? videoLabel[0] : null
                }/${videoSelection}.mp4`}
                autoPlay={true}
                loop
                playsInline
                muted
            ></VideoStyle>
            <SelectionLanguageListContainer>
                <LanguageSelectionWrapper>
                    {languageSelect === 'hksl' ? (
                        <>
                            <PrimaryButton
                                onClick={() => handleSelectLanguage('hksl')}
                            >
                                HKSL
                            </PrimaryButton>
                            <Button onClick={() => handleSelectLanguage('jsl')}>
                                JSL
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                onClick={() => handleSelectLanguage('hksl')}
                            >
                                HKSL
                            </Button>
                            <PrimaryButton
                                onClick={() => handleSelectLanguage('jsl')}
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
        </SelectionWrapper>
    );
};

export default Selection;
