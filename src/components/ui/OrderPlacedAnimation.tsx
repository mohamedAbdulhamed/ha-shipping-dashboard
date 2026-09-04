import React, { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./styles/OrderPlacedAnimation.css";

type OrderPlacedAnimationProps = {
  goTo: string;
  height?: string | number | null;
}

const OrderPlacedAnimation: React.FC<OrderPlacedAnimationProps> = ({ height, goTo }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const truckRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();

  const handleAnimation = useCallback(() => {
    if (!buttonRef.current || !boxRef.current || !truckRef.current) return;

    if (!isDone) {
      if (!isAnimating) {
        setIsAnimating(true);

        const button = buttonRef.current;
        const box = boxRef.current;
        const truck = truckRef.current;

        gsap.to(button, {
          "--box-s": 1,
          "--box-o": 1,
          duration: 0.3,
          delay: 0.5,
        });

        gsap.to(box, {
          x: 0,
          duration: 0.4,
          delay: 0.7,
        });

        gsap.to(button, {
          "--hx": -5,
          "--bx": 50,
          duration: 0.18,
          delay: 0.92,
        });

        gsap.to(box, {
          y: 0,
          duration: 0.1,
          delay: 1.15,
        });

        gsap.set(button, {
          "--truck-y": 0,
          "--truck-y-n": -26,
        });

        gsap.to(button, {
          "--truck-y": 1,
          "--truck-y-n": -25,
          duration: 0.2,
          delay: 1.25,
          onComplete: () => {
            gsap
              .timeline({
                onComplete: () => {
                  setIsDone(true);
                  setTimeout(() => {
                    navigate(goTo);
                  }, 1000)
                },
              })
              .to(truck, { x: 0, duration: 0.4 })
              .to(truck, { x: 40, duration: 1 })
              .to(truck, { x: 20, duration: 0.6 })
              .to(truck, { x: 96, duration: 0.4 });

            gsap.to(button, {
              "--progress": 1,
              duration: 2.4,
              ease: "power2.in",
            });
          },
        });
      }
    } else {
      resetAnimation();
    }
  }, [navigate, isAnimating, isDone, goTo]);

  const resetAnimation = () => {
    if (!buttonRef.current || !boxRef.current || !truckRef.current) return;

    const button = buttonRef.current;
    const box = boxRef.current;
    const truck = truckRef.current;

    setIsAnimating(false);
    setIsDone(false);

    gsap.set(truck, { x: 4 });
    gsap.set(button, {
      "--progress": 0,
      "--hx": 0,
      "--bx": 0,
      "--box-s": 0.5,
      "--box-o": 0,
      "--truck-y": 0,
      "--truck-y-n": -26,
    });
    gsap.set(box, { x: -24, y: -6 });
  };

  // start the animation right away
  useEffect(() => {
    handleAnimation();
  }, [handleAnimation]);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        width: "100%",
        height: height || "100%",
        backgroundColor: "wheat",
        zIndex: "9999",
      }}
    >
      <button
        ref={buttonRef}
        className={`truck-button ${isDone ? "done" : ""} ${
          isAnimating ? "animation" : ""
        }`}
        onClick={handleAnimation}
      >
        <span className="default">Complete Order</span>
        <span className="success">
          Order Placed
          <svg viewBox="0 0 12 10">
            <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
          </svg>
        </span>
        <div className="truck" ref={truckRef}>
          <div className="wheel"></div>
          <div className="back"></div>
          <div className="front"></div>
          <div className="box" ref={boxRef}></div>
        </div>
      </button>
    </Box>
  );
};

export default OrderPlacedAnimation;
