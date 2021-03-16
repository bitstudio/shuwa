import React, { useEffect, useRef, useState } from 'react';
import Button, { PrimaryButton } from '../../components/Button';
import Camera from '../../components/Camera';

import styled from 'styled-components';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
    classifyModel as classifyModelAtom,
    signingResult as singingResultAtom,
} from '../../recoil/atom';
import Loader from '../../components/Loader';
import { drawResult } from './utils/DrawKeyPoints';
import CorrectionModal from './CorrectionModal';
/*
  signing
  mlprogress
  result_error
  result_correct

  -- flow --
  count down 3 s
  record video / capture image stack
  send image stack to ml
  receive result from ml
*/

const SigningWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;

    position: relative;

    width: 55%;
    height: 100%;
`;
const CameraWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;

    width: 50vw;
    height: 50vh;
    margin: 2rem 0;
`;

const WhiteWrapper = styled.div`
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    -webkit-mask-image: -webkit-radial-gradient(white, black);
    border: 0.3rem solid red;

    position: relative;
`;
type ActionButtonProps = {
    isCapturing: boolean;
};
const ActionButton = styled.button<ActionButtonProps>`
    width: ${(props: ActionButtonProps) =>
        props.isCapturing ? `1rem` : `3rem`};
    height: ${(props: ActionButtonProps) =>
        props.isCapturing ? `1rem` : `3rem`};
    border-radius: ${(props: ActionButtonProps) =>
        props.isCapturing ? `0` : `50%`};
    -webkit-mask-image: -webkit-radial-gradient(white, black);
    border: none;
    color: #fff;
    background-color: red;
    &:hover {
        background-color: ${(props: ActionButtonProps) =>
            props.isCapturing ? `red` : `#fff`};
        color: #000;
    }
    &:active {
        background-color: ${(props: ActionButtonProps) =>
            props.isCapturing ? `red` : `#fff`};
        color: #fff;
    }
    &:focus {
        outline: 0;
    }

    display: flex;
    align-items: center;
    justify-content: center;

    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    cursor: pointer;
    transition: all 0.2s;
`;
const CountDownStyle = styled.p`
    margin: 0;
    font-size: 1.2rem;
`;
const ProcessingModal = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: white;
    z-index: 100;
`;
// interface SigningProps {
//     nextState: () => any;
//     signingSelect: string[];
// }

interface IResultModalStyle {
    isShow: boolean;
}
const ResultModal = styled.div<IResultModalStyle>`
    width: 100%;
    height: 100%;
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: white;
    overflow: auto;
    opacity: ${(props: IResultModalStyle) => (props.isShow ? '1' : '0')};
    z-index: ${(props: IResultModalStyle) => (props.isShow ? '1' : '-1')};
`;
const FrameAnalystWrapper = styled.div<IResultModalStyle>`
    margin-bottom: 2rem;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    opacity: ${(props: IResultModalStyle) => (props.isShow ? '1' : '0')};
    z-index: ${(props: IResultModalStyle) => (props.isShow ? '1' : '-1')};
`;
const ResultWrapper = styled.div<IResultModalStyle>`
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    opacity: ${(props: IResultModalStyle) => (props.isShow ? '1' : '0')};
    z-index: ${(props: IResultModalStyle) => (props.isShow ? '1' : '-1')};
`;
const CanvasWrapper = styled.div``;
const CanvasTextContianer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
`;

interface IisChecked {
    isChecked: boolean;
}
const RollingImproveWrapper = styled.div<IisChecked>`
    width: 100%;
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    position: absolute;
    top: 0;
    left: 50%;
    transform: ${(props) =>
        props.isChecked ? `translate(-50%, 0)` : `translate(-50%, 100%)`};
    transition: transform 0.5s;
`;
const TextDescription = styled.p``;
const ActionButtonWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
`;
const TitleText = styled.h4`
    margin-top: 0;
`;
const RollingNotImproveWrapper = styled.div<IisChecked>`
    width: 100%;
    height: 100%;
    display: flex;
    overflow: hidden;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    position: absolute;
    top: 0;
    left: 50%;
    transform: ${(props) =>
        props.isChecked ? `translate(-50%, -100%)` : `translate(-50%, 0)`};
    transition: transform 0.5s;
`;
const RollingButtonWrapper = styled.div`
    width: 100%;
    height: 20vh;
    position: relative;
    overflow: hidden;
`;
const ToggleImproveWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    text-align: center;
    align-items: center;
`;

interface IResultStack {
    poseStack: number[][][];
    faceStack: number[][][];
    leftHandStack: number[][][];
    rightHandStack: number[][][];
}
interface IFrameKeypoints {
    frame: number;
    pose: boolean;
    face: boolean;
    leftHand: boolean;
    rightHand: boolean;
}
interface ITopFiveResult {
    sign: string;
    acc: string;
}

interface IimageStack {
    imageData: ImageData;
    dataUrl: string;
}

const IMAGE_STACK: IimageStack[] = [];
const PREDICTION_IMAGE_STACK: IimageStack[] = [];
const TIMER_STACK = ['3', '2', '1', 'start'];
const THRESHOLD_CLASSIFY = 0.5;
let captureInterval: NodeJS.Timer;
type CameraType = React.ElementRef<typeof Camera>;

const Signing: React.FC = () => {
    const [checked, setCheck] = useState(true);
    const classifyModel = useRecoilValue(classifyModelAtom);
    const cameraRef = useRef<CameraType>(null);
    // const [timeState, updateTimeState] = useState<number>(0);
    const [signingState, updateSigningState] = useState<string>('idle');
    const [countDown, updateCountDown] = useState<number>(0);
    // const [signingResult, updateSigningResult] = useState<string>('');
    const [signingResult, updateSigningResult] = useRecoilState(
        singingResultAtom,
    );

    const [TopFiveResult, updateTopFiveResult] = useState<ITopFiveResult[]>([]);
    const [frameKeypointsTable, updateFrameKeypointsTable] = useState<
        IFrameKeypoints[]
    >([]);
    const [isAboveThreshold, updateIsAboveThreshold] = useState<boolean>(true);

    const [resultStack, updateResultStack] = useState<IResultStack>({
        poseStack: [],
        faceStack: [],
        leftHandStack: [],
        rightHandStack: [],
    });
    const [predictionCount, updatePredictionCount] = useState<number>(0);

    const [showResultCanvas, updateShowResultCanvas] = useState<number>(0);

    const handleStart = () => {
        if (signingState === 'idle') {
            updateSigningState('countdown');
            let count = 0;
            const CountDownInterval = setInterval(() => {
                count += 1;
                updateCountDown(count);
                if (count === 3) {
                    clearInterval(CountDownInterval);
                    updateSigningState('capturing');
                    handleCapture();
                }
            }, 1000);
        }
    };

    const handleCapture = () => {
        let time_set = 0;
        captureInterval = setInterval(() => {
            time_set += 100;
            const imageCaptured = cameraRef.current?.captureImage();
            if (imageCaptured) IMAGE_STACK.push(imageCaptured);
            if (time_set === 3000) {
                clearInterval(captureInterval);
                updateSigningState('processing');
            }
        }, 100);
    };

    const checkArrayMatch = (a: any[], b: any[]) => {
        const z = a.map((item) => {
            return JSON.stringify(item);
        });
        return z.includes(JSON.stringify(b));
    };

    const startClassify = () => {
        // slice image stack to 16 frame uniform spread
        const thres = (IMAGE_STACK.length - 5) / 16;
        const imageTime = [];
        for (let i = 0; i < 16; i++) {
            imageTime.push(Math.round(thres * i));
        }
        console.log('image time stack: ', imageTime);
        for (const time of imageTime) {
            PREDICTION_IMAGE_STACK.push(IMAGE_STACK[time + 3]);
        }
        console.log(PREDICTION_IMAGE_STACK);
        IMAGE_STACK.length = 0; // clear image stack
        classifyModel
            .predictImage(PREDICTION_IMAGE_STACK[predictionCount].imageData)
            .then((result: any) => {
                updatePredictionCount(predictionCount + 1);
                console.log(result);

                // check frame 1 pose face lefthand righthand
                const isPose = !checkArrayMatch(result.pose, [0, 0]);
                const isFace = !checkArrayMatch(result.face, [0, 0]);
                const isLeftHand = !checkArrayMatch(result.leftHand, [0, 0]);
                const isRightHand = !checkArrayMatch(result.rightHand, [0, 0]);

                updateFrameKeypointsTable([
                    ...frameKeypointsTable,
                    {
                        frame: 1,
                        pose: isPose,
                        face: isFace,
                        leftHand: isLeftHand,
                        rightHand: isRightHand,
                    },
                ]);

                //update result stack
                updateResultStack({
                    poseStack: [...resultStack.poseStack, result.pose],
                    faceStack: [...resultStack.faceStack, result.face],
                    leftHandStack: [
                        ...resultStack.leftHandStack,
                        result.leftHand,
                    ],
                    rightHandStack: [
                        ...resultStack.rightHandStack,
                        result.rightHand,
                    ],
                });

                // clear state and clear array
                // PREDICTION_IMAGE_STACK.length = 0;
                // updateSigningResult(result.resultLabel);
                // updateSigningState('idle');
                // updateCountDown(0);
            });
    };

    // check each frame
    useEffect(() => {
        if (signingState === 'processing' && predictionCount < 16) {
            // check prediction count image
            classifyModel
                .predictImage(PREDICTION_IMAGE_STACK[predictionCount].imageData)
                .then((result: any) => {
                    console.log(result);
                    updatePredictionCount(predictionCount + 1);
                    const isPose = !checkArrayMatch(result.pose, [0, 0]);
                    const isFace = !checkArrayMatch(result.face, [0, 0]);
                    const isLeftHand = !checkArrayMatch(result.leftHand, [
                        0,
                        0,
                    ]);
                    const isRightHand = !checkArrayMatch(result.rightHand, [
                        0,
                        0,
                    ]);

                    updateFrameKeypointsTable([
                        ...frameKeypointsTable,
                        {
                            frame: frameKeypointsTable.length + 1,
                            pose: isPose,
                            face: isFace,
                            leftHand: isLeftHand,
                            rightHand: isRightHand,
                        },
                    ]);

                    updateResultStack({
                        poseStack: [...resultStack.poseStack, result.pose],
                        faceStack: [...resultStack.faceStack, result.face],
                        leftHandStack: [
                            ...resultStack.leftHandStack,
                            result.leftHand,
                        ],
                        rightHandStack: [
                            ...resultStack.rightHandStack,
                            result.rightHand,
                        ],
                    });
                });
        }
        if (predictionCount === 16) {
            console.log('resultStack: ', resultStack);
            // classify
            classifyModel.predictSign(resultStack).then((result: any) => {
                function cmp(a: any[], b: any[]) {
                    return b[1] > a[1] ? 1 : -1;
                }
                const sortedArray = result.resultArray.sort(cmp);
                console.log(sortedArray);

                // get all stack keypoints and image stack send to draw key points
                const canvasWrapperEl = document.getElementById(
                    'canvasWrapper',
                );
                for (const i in PREDICTION_IMAGE_STACK) {
                    const canvasEl = drawResult({
                        imageData: PREDICTION_IMAGE_STACK[i].imageData,
                        resultKeypoints: {
                            poseStack: resultStack.poseStack[i],
                            faceStack: resultStack.faceStack[i],
                            leftHandStack: resultStack.leftHandStack[i],
                            rightHandStack: resultStack.rightHandStack[i],
                        },
                    });
                    if (canvasEl !== null && canvasWrapperEl !== null) {
                        canvasEl.classList.add('result-kp-image');
                        canvasEl.id = `image-frame-${i}`;
                        canvasEl.style.display = 'none';
                        canvasWrapperEl.appendChild(canvasEl);
                        console.log('append child');
                    }
                }

                updateSigningResult(result.resultLabel);
                console.log(result.resultLabel);

                sortedArray[0][1] > THRESHOLD_CLASSIFY
                    ? updateIsAboveThreshold(true)
                    : updateIsAboveThreshold(false);
                updateSigningState('result');
                const topFiveResultArr = [];
                for (let i = 0; i < 5; i++) {
                    topFiveResultArr.push({
                        sign: sortedArray[i][0],
                        acc: (sortedArray[i][1] * 100).toFixed(2),
                    });
                }
                updateTopFiveResult(topFiveResultArr);
            });
        }
    }, [resultStack]);

    useEffect(() => {
        if (signingState === 'processing') {
            startClassify();
        }
    }, [signingState]);

    useEffect(() => {
        if (signingState === 'result') {
            const canvasShow = document.getElementById(
                `image-frame-${showResultCanvas}`,
            );
            if (canvasShow) canvasShow.style.display = 'flex';
        }
    }, [signingState]);

    const handleTryAgain = () => {
        updateSigningState('idle');
        PREDICTION_IMAGE_STACK.length = 0;
        updateCountDown(0);
        updatePredictionCount(0);
        updateResultStack({
            poseStack: [],
            faceStack: [],
            leftHandStack: [],
            rightHandStack: [],
        });
        updateFrameKeypointsTable([]);

        // clear drawing canvas
        const canvasWrapperEl = document.getElementById('canvasWrapper');
        while (canvasWrapperEl?.lastChild) {
            canvasWrapperEl.removeChild(canvasWrapperEl.lastChild);
        }
        updateShowResultCanvas(0);
    };

    function dataURLtoFile(dataurl: any, filename: string) {
        const arr = dataurl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }

    async function uploadImage(url: any, dataurl: any, imageName: string) {
        return new Promise((resolve, reject) => {
            // var fd = new FormData()
            // fd.append()
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', url, true);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                        console.log('upload complete');
                        // $('.bottom-page3-container').show();
                    } else {
                        reject(xhr.response);
                    }
                }
            };

            const imageFile = dataURLtoFile(dataurl, imageName);

            xhr.setRequestHeader('Content-Type', 'image/png');
            xhr.send(imageFile);
        });
    }

    async function getSignedURL(metadata: any) {
        return new Promise(async (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(
                'POST',
                'https://us-central1-bit-ml-research.cloudfunctions.net/sign_language_pipeline/get_signed_url',
                true,
            );
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(JSON.parse(xhr.response).url);
                        console.log('get URL complete');
                    } else {
                        reject(xhr.response);
                    }
                }
            };

            console.log(metadata);

            xhr.setRequestHeader('Content-Type', 'application/json');
            const obj = JSON.stringify(metadata);
            xhr.send(obj);
        });
    }

    const sendDataToCloud = () => {
        console.log('send data to cloud');
        console.log('finish data to cloud');

        updateSigningState('sendtocloud');

        /**
         * Flow: collect image stack array
         * key the right selection sign from user
         * send image stack array to cloud
         * return notation to the user
         */
        let frameCount = 1;
        const folderTime = +Date.now();
        const startSendData = async () => {
            for (const imageSelected of PREDICTION_IMAGE_STACK) {
                const imageUrl = imageSelected.dataUrl;
                const metadata = {
                    directory:
                        'ML_demo_test/' + signingResult + '/' + folderTime,
                    filename: String(frameCount) + '.png',
                    contentType: 'image/png',
                    action: 'write',
                    version: 'v4',
                };
                frameCount += 1;
                const url = await getSignedURL(metadata);
                uploadImage(url, imageUrl, signingResult);
            }
            handleTryAgain();
        };
        startSendData();
    };

    const selectFrameResult = (input: number) => {
        const previousCanvas = document.getElementById(
            `image-frame-${showResultCanvas}`,
        );
        if (previousCanvas) previousCanvas.style.display = 'none';
        const selectedCanvas = document.getElementById(`image-frame-${input}`);
        if (selectedCanvas) selectedCanvas.style.display = 'flex';
        updateShowResultCanvas(input);
    };

    /**
     * Flow:
     * fire api to ml
     * ml predict return value to frontend
     * front end show progress of predict each frame
     * draw keypoints in each frame | list to table
     * return top 3 result
     *
     * threshold >> return false
     *
     * draw keypoints on image
     * collect images
     * send image to draw keypoints
     * collect images in stack
     *  {
     *      frame: number
     *      image: img
     *  }
     * playback video loop ? or user select
     */
    const [open, setOpen] = useState<boolean>(false);
    const handleClickClose = () => {
        setOpen(false);
    };

    return (
        <>
            <CorrectionModal
                open={open}
                setClose={handleClickClose}
                sendDataToCloud={sendDataToCloud}
            />
            {signingState === 'sendtocloud' && (
                <ProcessingModal>
                    <p>send data to bucket</p>
                    <Loader />
                </ProcessingModal>
            )}
            <SigningWrapper>
                <ResultModal isShow={signingState === 'result'}>
                    {/* isAboveThreshold */}
                    <h1>RESULT</h1>
                    {/* <FrameAnalystWrapper isShow={isAboveThreshold}> */}
                    <FrameAnalystWrapper isShow={true}>
                        <table
                            style={{
                                borderCollapse: 'collapse',
                                width: '100%',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th>Frame</th>
                                    <th>Pose</th>
                                    <th>Face</th>
                                    <th>Left Hand</th>
                                    <th>Right Hand</th>
                                </tr>
                            </thead>
                            <tbody>
                                {frameKeypointsTable.map((item, index) => {
                                    return [
                                        <tr
                                            key={index}
                                            onClick={() =>
                                                selectFrameResult(index)
                                            }
                                            style={{
                                                cursor: 'pointer',
                                                border:
                                                    '&:hover {1px solid red}',
                                            }}
                                        >
                                            <td>{item.frame}</td>
                                            <td
                                                style={{
                                                    backgroundColor: item.pose
                                                        ? '#7ecbbd'
                                                        : '#de5246',
                                                }}
                                            >
                                                {item.pose === true
                                                    ? 'yes'
                                                    : 'no'}
                                            </td>
                                            <td
                                                style={{
                                                    backgroundColor: item.face
                                                        ? '#7ecbbd'
                                                        : '#de5246',
                                                }}
                                            >
                                                {item.face === true
                                                    ? 'yes'
                                                    : 'no'}
                                            </td>
                                            <td
                                                style={{
                                                    backgroundColor: item.leftHand
                                                        ? '#7ecbbd'
                                                        : '#de5246',
                                                }}
                                            >
                                                {item.leftHand === true
                                                    ? 'yes'
                                                    : 'no'}
                                            </td>
                                            <td
                                                style={{
                                                    backgroundColor: item.rightHand
                                                        ? '#7ecbbd'
                                                        : '#de5246',
                                                }}
                                            >
                                                {item.rightHand === true
                                                    ? 'yes'
                                                    : 'no'}
                                            </td>
                                        </tr>,
                                    ];
                                })}
                            </tbody>
                        </table>
                        <CanvasTextContianer>
                            <CanvasWrapper id={'canvasWrapper'}></CanvasWrapper>
                            <TextDescription>
                                frame: {showResultCanvas + 1}
                            </TextDescription>
                            <input
                                type="range"
                                min="0"
                                max="15"
                                step="1"
                                value={showResultCanvas}
                                onChange={(e) =>
                                    selectFrameResult(Number(e.target.value))
                                }
                            />
                        </CanvasTextContianer>
                    </FrameAnalystWrapper>
                    <ResultWrapper isShow={isAboveThreshold}>
                        <table
                            style={{
                                borderCollapse: 'collapse',
                                width: '100%',
                            }}
                        >
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Sign result</th>
                                    <th>Accuracy (%)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {TopFiveResult.map((item, index) => {
                                    return [
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>{item.sign}</td>
                                            <td>{item.acc}</td>
                                        </tr>,
                                    ];
                                })}
                            </tbody>
                        </table>
                        <ToggleImproveWrapper>
                            <input
                                type="checkbox"
                                defaultChecked={checked}
                                checked={checked}
                                onChange={() => setCheck(!checked)}
                            />
                            <h5 onClick={() => setCheck(!checked)}>
                                I would like to help improve ML performance
                            </h5>
                        </ToggleImproveWrapper>
                    </ResultWrapper>
                    <RollingButtonWrapper>
                        <RollingNotImproveWrapper isChecked={checked}>
                            <TitleText>Try another sign</TitleText>
                            <ActionButtonWrapper>
                                <PrimaryButton onClick={handleTryAgain}>
                                    {'Try again'}
                                </PrimaryButton>
                            </ActionButtonWrapper>
                        </RollingNotImproveWrapper>
                        <RollingImproveWrapper isChecked={checked}>
                            <TitleText>Is this correct?</TitleText>
                            <ActionButtonWrapper>
                                <Button onClick={() => setOpen(true)}>
                                    {'No'}
                                </Button>
                                <PrimaryButton onClick={sendDataToCloud}>
                                    {'Yes'}
                                </PrimaryButton>
                            </ActionButtonWrapper>
                        </RollingImproveWrapper>
                    </RollingButtonWrapper>
                </ResultModal>
                {signingState === 'processing' ? (
                    <ProcessingModal>
                        <CountDownStyle>Processing</CountDownStyle>
                        <Loader />
                    </ProcessingModal>
                ) : (
                    <>
                        {signingState !== 'result' && (
                            <>
                                <CameraWrapper>
                                    <Camera ref={cameraRef} />
                                </CameraWrapper>
                                <WhiteWrapper>
                                    <ActionButton
                                        onClick={() => handleStart()}
                                        isCapturing={
                                            signingState === 'capturing'
                                        }
                                    >
                                        {signingState === 'countdown' && (
                                            <CountDownStyle>
                                                {TIMER_STACK[countDown]}
                                            </CountDownStyle>
                                        )}
                                    </ActionButton>
                                </WhiteWrapper>
                            </>
                        )}
                    </>
                )}
            </SigningWrapper>
        </>
    );
};

export default Signing;
