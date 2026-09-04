import { keyframes } from "@emotion/react";

export const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0px); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;

export const moveTruck = keyframes`
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(3px, -3px) rotate(5deg); }
  50% { transform: translate(5px, 0) rotate(-5deg); }
  75% { transform: translate(3px, 3px) rotate(3deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
`;

export const gradient = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const shake = keyframes`
  0% { transform: translateX(0); }
  25% { transform: translateX(3px); }
  50% { transform: translateX(-3px); }
  75% { transform: translateX(2px); }
  100% { transform: translateX(0); }
`;

export const particle = keyframes`
  0% { transform: translateY(0) scale(1); opacity: 0.8; }
  100% { transform: translateY(-20px) scale(0.5); opacity: 0; }
`;

export const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px rgba(100, 150, 255, 0.5)); }
  50% { filter: drop-shadow(0 0 8px rgba(100, 150, 255, 0.8)); }
  100% { filter: drop-shadow(0 0 2px rgba(100, 150, 255, 0.5)); }
`;

export const spinAnimation = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;