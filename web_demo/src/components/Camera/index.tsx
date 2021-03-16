import React, {
    forwardRef,
    ForwardRefRenderFunction,
    useEffect,
    useRef,
    useState,
} from 'react';
import { isMobile } from 'react-device-detect';
import styled from 'styled-components';

const VideoWrapper = styled.div`
    position: relative;
    min-width: 800px;
    width: 100%;
    height: 100%;
`;

const VideoStyle = styled.video`
    height: 100%;
    object-fit: contain;
    transform: rotateY(180deg);
    border: 0.3rem solid black;
    border-radius: 30px;
    box-sizing: border-box;
    background-color: black;
`;
const HumanGuide = styled.img`
    position: absolute;
    height: 100%;
    left: 50%;
    object-fit: cover;
    z-index: 10;
    transform: translate(-50%, 0);
`;

const CanvasCaptureStyle = styled.canvas`
    position: absolute;
    width: 100%;
    opacity: 0;
    object-fit: contain;
    transform: rotateY(180deg);
    z-index: -1;
`;

type CameraComponentsProps = Record<string, unknown>;

type CameraComponentsHandle = {
    captureImage: () => void;
    start: () => void;
};

const Camera: ForwardRefRenderFunction<
    CameraComponentsHandle,
    CameraComponentsProps
> = (props, forwardedRef) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasCaptureRef = useRef<HTMLCanvasElement>(null);
    const humanGuideRef = useRef<HTMLImageElement>(null);

    const [isVideoPlayed, updateIsVideoPlayed] = useState<boolean>(false);
    const [isCameraSetup, updateIsCameraSetup] = useState<boolean>(false);
    const [isMobileCheck] = useState<boolean>(isMobile);

    const setupCamera = async () => {
        const constraints = {
            audio: false,
            video: {
                facingMode: 'user', // 'user' or 'environment'
            },
        };
        if (videoRef.current !== null) {
            const mediaStream = await navigator.mediaDevices.getUserMedia(
                constraints,
            );
            try {
                videoRef.current.srcObject = mediaStream;
                console.log(`--- set up camera ---`);
                updateIsCameraSetup(true);
            } catch (err) {
                console.log(err.name + ': ' + err.message);
            }
        } else return;
    };

    const onLoadedVideo = () => {
        console.log('loadedVideoData');
        if (
            videoRef.current !== null &&
            canvasCaptureRef.current !== null &&
            !isVideoPlayed &&
            isCameraSetup
        ) {
            updateIsVideoPlayed(true);
            videoRef.current.play();
        }
    };

    useEffect(() => {
        if (videoRef.current !== null) setupCamera();
    }, [videoRef]);

    useEffect(() => {
        if (canvasCaptureRef.current !== null) onLoadedVideo();
    }, [canvasCaptureRef]);

    const captureImage = () => {
        const canvasCtx = canvasCaptureRef.current?.getContext('2d');
        if (
            canvasCaptureRef.current?.width !== undefined &&
            canvasCaptureRef.current?.height !== undefined &&
            videoRef.current !== null
        ) {
            console.log('capture Image !');
            canvasCtx?.clearRect(
                0,
                0,
                canvasCaptureRef.current?.width,
                canvasCaptureRef.current?.height,
            );
            isMobileCheck
                ? canvasCtx?.drawImage(
                      videoRef.current,
                      0,
                      (videoRef.current.videoHeight -
                          videoRef.current.videoWidth) /
                          2,
                      videoRef.current?.videoWidth,
                      videoRef.current?.videoWidth,
                      0,
                      0,
                      canvasCaptureRef.current?.width,
                      canvasCaptureRef.current?.height,
                  )
                : canvasCtx?.drawImage(
                      videoRef.current,
                      (videoRef.current.videoWidth -
                          videoRef.current.videoHeight) /
                          2,
                      0,
                      videoRef.current?.videoHeight,
                      videoRef.current?.videoHeight,
                      0,
                      0,
                      canvasCaptureRef.current?.width,
                      canvasCaptureRef.current?.height,
                  );
            return {
                imageData: canvasCtx?.getImageData(
                    0,
                    0,
                    canvasCaptureRef.current.width,
                    canvasCaptureRef.current.height,
                ),
                dataUrl: canvasCaptureRef.current?.toDataURL('image/png'),
            };
        } else return false;
    };

    React.useImperativeHandle(forwardedRef, () => ({
        captureImage: captureImage,
        start: function start() {
            console.log('start');
        },
    }));

    return (
        <>
            <VideoWrapper>
                <HumanGuide
                    src={'./assets/guide_human.png'}
                    ref={humanGuideRef}
                />
                <VideoStyle
                    ref={videoRef}
                    autoPlay={true}
                    onLoadedData={onLoadedVideo}
                    playsInline
                />
            </VideoWrapper>
            <CanvasCaptureStyle
                ref={canvasCaptureRef}
                width={257}
                height={257}
            />
        </>
    );
};

export default forwardRef(Camera);
