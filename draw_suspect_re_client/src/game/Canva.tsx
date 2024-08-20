import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";

interface Pos {
  x: number;
  y: number;
}
interface Coord {
  pos1: Pos;
  pos2: Pos;
}

export default function Canva({
  sendDrawing,
  socket,
  isActive,
  canPaint,
  ink,
  setInk,
  color,
  width,
}: {
  sendDrawing: any;
  socket: Socket;
  isActive: boolean;
  canPaint: boolean;
  ink: number;
  setInk: any;
  color: string;
  width: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState(canvasRef.current);
  const [context, setContext] = useState(
    canvas ? canvas.getContext("2d") : null
  );

  const [allLocalCoord, setAllLocalCoord] = useState<Coord[]>([]);
  const [lastPos, setLastPos] = useState<Pos>({ x: 0, y: 0 });
  const [lastSent, setLastSent] = useState(0);

  const setPosition = (x: number, y: number) => {
    if (!canvas) {
      return;
    }
    const canvaPos = canvas.getBoundingClientRect();
    setLastPos({ x: x - canvaPos.left, y: y - canvaPos.top });
    return { x: x - canvaPos.left, y: y - canvaPos.top };
  };

  useEffect(() => {
    if (canvasRef) {
      setCanvas(canvasRef.current);
    }
  }, [canvasRef]);

  useEffect(() => {
    if (canvas) {
      setContext(canvas.getContext("2d"));
    }
  }, [canvas]);

  useEffect(() => {
    if (canvas) {
      canvas.style.cursor = isActive ? "crosshair" : "not-allowed";
    }
  }, [canvas, isActive]);

  const draw = (e: any) => {
    if (!context) {
      return;
    }
    // mouse left button must be pressed
    if (e.buttons !== 1) return;

    if (allLocalCoord.length % 2 === 0) {
      sendDrawToServer();
    }

    drawPoint({ x: e.clientX, y: e.clientY });
  };

  const drawPoint = (tmpPos: Pos) => {
    if (!context) return;
    if (!isActive) return;
    if (!canPaint) return;
    if (ink <= 0) return;
    //ctx.moveTo(pos.x, pos.y); // from

    context.beginPath(); // begin

    context.lineWidth = width;
    context.lineCap = "round";
    context.strokeStyle = color;

    const x1 = lastPos.x;
    const y1 = lastPos.y;

    context.moveTo(lastPos.x, lastPos.y); // from
    const t = setPosition(tmpPos.x, tmpPos.y);
    if (!t) {
      return;
    }

    const x2 = t.x;
    const y2 = t.y;

    const dist = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    const amount = parseInt("" + (ink - dist));
    setInk(amount < 0 ? 0 : amount);
    context.lineTo(t.x, t.y); // to

    context.stroke(); // draw it!
    allLocalCoord.push({ pos1: { x: x1, y: y1 }, pos2: { x: x2, y: y2 } });
  };

  const sendDrawToServer = () => {
    const newDraw = allLocalCoord.slice(lastSent, allLocalCoord.length);
    sendDrawing(newDraw);
    setLastSent(allLocalCoord.length);
  };

  function drawFromServer(coords: Coord[], _color: string, _width: number) {
    if (!context) return;

    context.strokeStyle = _color;
    context.lineWidth = _width;
    context.lineCap = "round";

    coords.forEach((coord, i) => {
      context.beginPath(); // begin

      context.moveTo(coord.pos1.x, coord.pos1.y);
      context.lineTo(coord.pos2.x, coord.pos2.y); // to
      context.stroke(); // draw it!
    });
  }

  socket.on("draw", drawFromServer);
  return (
    <canvas
      ref={canvasRef}
      className="canva"
      id="drawingCanvas"
      width="1000px"
      height="600px"
      onMouseMove={draw}
      onMouseDown={(e) => {
        setPosition(e.clientX, e.clientY);
      }}
      onMouseEnter={(e) => {
        setPosition(e.clientX, e.clientY);
      }}
    />
  );
}
